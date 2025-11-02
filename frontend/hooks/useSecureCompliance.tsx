"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "./useInMemoryStorage";
import { useMetaMaskEthersSigner } from "./metamask/useMetaMaskEthersSigner";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { SecureComplianceAddresses } from "@/abi/SecureComplianceAddresses";

// Contract ABI for SecureCompliance
const SECURE_COMPLIANCE_ABI = [
  "function getRecordCount() external view returns (uint256)",
  "function getAllRecordIds() external view returns (uint256[])",
  "function getRecordInfo(uint256 recordId) external view returns (uint256 id, address submitter, uint256 timestamp, bool exists)",
  "function getEncryptedRiskLevel(uint256 recordId) external view returns (bytes32)",
  "function getEncryptedStatus(uint256 recordId) external view returns (bytes32)",
  "function getEncryptedViolationCode(uint256 recordId) external view returns (bytes32)",
  "function createRecord(bytes32 encryptedRiskLevel, bytes calldata riskLevelProof, bytes32 encryptedViolationCode, bytes calldata violationCodeProof) external returns (uint256 recordId)",
  "function updateStatus(uint256 recordId, bytes32 encryptedStatus, bytes calldata statusProof) external",
  "function grantAccess(uint256 recordId, address user) external",
  "event RecordCreated(uint256 indexed recordId, address indexed submitter, uint256 timestamp)",
];

// Contract addresses per chain
const CONTRACT_ADDRESSES: Record<number, string | undefined> = {
  31337: undefined, // Will be set after deployment
  11155111: undefined, // Will be set after deployment to Sepolia
};

interface UseSecureComplianceProps {
  // Props can be extended as needed
}

export function useSecureCompliance(props?: UseSecureComplianceProps) {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const [isDeployed, setIsDeployed] = useState<boolean | undefined>(undefined);
  const [contractAddress, setContractAddress] = useState<string | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [message, setMessage] = useState<string>("");

  const contractRef = useRef<ethers.Contract | null>(null);

  // Load contract address from imported deployment addresses
  useEffect(() => {
    if (!chainId) {
      setIsDeployed(undefined);
      setContractAddress(undefined);
      return;
    }

    // Get address from imported addresses file
    const entry = SecureComplianceAddresses[chainId.toString() as keyof typeof SecureComplianceAddresses];
    
    if (entry && "address" in entry && entry.address !== ethers.ZeroAddress) {
      const addr = entry.address;
      CONTRACT_ADDRESSES[chainId] = addr;
      setContractAddress(addr);
      setIsDeployed(true);
      console.log(`[useSecureCompliance] Loaded address for chainId ${chainId}: ${addr}`);
    } else {
      // Fallback: check if address is hardcoded
      const addr = CONTRACT_ADDRESSES[chainId];
      setContractAddress(addr);
      setIsDeployed(!!addr);
    }
  }, [chainId]);

  // Create contract instance
  useEffect(() => {
    if (!contractAddress || !ethersReadonlyProvider) {
      contractRef.current = null;
      return;
    }

    contractRef.current = new ethers.Contract(
      contractAddress,
      SECURE_COMPLIANCE_ABI,
      ethersReadonlyProvider
    );
  }, [contractAddress, ethersReadonlyProvider]);

  // Create a new compliance record with encrypted data
  const createRecord = useCallback(
    async (riskLevel: number, violationCode: number): Promise<number> => {
      if (!fhevmInstance || !ethersSigner || !contractAddress || !chainId) {
        throw new Error("Not ready to create record");
      }

      setIsCreating(true);
      setMessage("Encrypting data...");

      try {
        // Encrypt the risk level (euint8)
        const encryptedRiskLevel = await fhevmInstance
          .createEncryptedInput(contractAddress, await ethersSigner.getAddress())
          .add8(riskLevel)
          .encrypt();

        // Encrypt the violation code (euint32)
        const encryptedViolationCode = await fhevmInstance
          .createEncryptedInput(contractAddress, await ethersSigner.getAddress())
          .add32(violationCode)
          .encrypt();

        setMessage("Submitting transaction...");

        // Create contract with signer
        const contract = new ethers.Contract(
          contractAddress,
          SECURE_COMPLIANCE_ABI,
          ethersSigner
        );

        // Call createRecord
        const tx = await contract.createRecord(
          encryptedRiskLevel.handles[0],
          encryptedRiskLevel.inputProof,
          encryptedViolationCode.handles[0],
          encryptedViolationCode.inputProof
        );

        setMessage("Waiting for confirmation...");
        const receipt = await tx.wait();

        // Parse the RecordCreated event to get the record ID
        const event = receipt.logs.find(
          (log: ethers.Log) => {
            try {
              const parsed = contract.interface.parseLog({
                topics: log.topics as string[],
                data: log.data,
              });
              return parsed?.name === "RecordCreated";
            } catch {
              return false;
            }
          }
        );

        let recordId = 0;
        if (event) {
          const parsed = contract.interface.parseLog({
            topics: event.topics as string[],
            data: event.data,
          });
          recordId = Number(parsed?.args?.recordId || 0);
        }

        setMessage("Record created successfully!");
        return recordId;
      } catch (error) {
        console.error("Failed to create record:", error);
        setMessage(`Error: ${(error as Error).message}`);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [fhevmInstance, ethersSigner, contractAddress, chainId]
  );

  // Decrypt a field from a record
  const decryptField = useCallback(
    async (
      recordId: number,
      fieldType: "riskLevel" | "status" | "violationCode"
    ): Promise<number> => {
      if (!fhevmInstance || !ethersSigner || !contractAddress || !contractRef.current) {
        throw new Error("Not ready to decrypt");
      }

      setIsDecrypting(true);
      setMessage("Fetching encrypted value...");

      try {
        let encryptedHandle: string;

        // Get the encrypted handle based on field type
        if (fieldType === "riskLevel") {
          encryptedHandle = await contractRef.current.getEncryptedRiskLevel(recordId);
        } else if (fieldType === "status") {
          encryptedHandle = await contractRef.current.getEncryptedStatus(recordId);
        } else {
          encryptedHandle = await contractRef.current.getEncryptedViolationCode(recordId);
        }

        setMessage("Requesting wallet signature for decryption...");

        // Get or create decryption signature (requires wallet signature)
        const sig = await FhevmDecryptionSignature.loadOrSign(
          fhevmInstance,
          [contractAddress as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          throw new Error("Failed to get decryption signature");
        }

        setMessage("Decrypting with FHEVM...");

        // Call userDecrypt with the signature
        const decryptedValues = await fhevmInstance.userDecrypt(
          [{ handle: encryptedHandle, contractAddress: contractAddress as `0x${string}` }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const clearValue = decryptedValues[encryptedHandle];
        
        setMessage("Decryption successful!");
        return Number(clearValue);
      } catch (error) {
        console.error("Failed to decrypt:", error);
        setMessage(`Decryption error: ${(error as Error).message}`);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [fhevmInstance, ethersSigner, contractAddress, fhevmDecryptionSignatureStorage]
  );

  // Get all records
  const getRecords = useCallback(async () => {
    if (!contractRef.current) {
      return [];
    }

    try {
      const recordIds = await contractRef.current.getAllRecordIds();
      const records = await Promise.all(
        recordIds.map(async (id: bigint) => {
          const info = await contractRef.current!.getRecordInfo(id);
          return {
            id: Number(info.id),
            submitter: info.submitter,
            timestamp: Number(info.timestamp),
            exists: info.exists,
          };
        })
      );
      return records.filter((r) => r.exists);
    } catch (error) {
      console.error("Failed to get records:", error);
      return [];
    }
  }, []);

  return {
    isDeployed,
    contractAddress,
    isCreating,
    isDecrypting,
    message,
    createRecord,
    decryptField,
    getRecords,
    fhevmInstance,
    fhevmStatus,
    fhevmError,
  };
}
