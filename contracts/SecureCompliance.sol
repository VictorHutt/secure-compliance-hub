// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint32, externalEuint8, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SecureCompliance - Encrypted Customs Compliance Records
/// @notice A contract for managing encrypted compliance records using FHE
/// @dev All sensitive data is stored encrypted and can only be decrypted by authorized users
contract SecureCompliance is SepoliaConfig {
    /// @notice Risk level enumeration (stored as encrypted uint8)
    /// 0 = Low, 1 = Medium, 2 = High, 3 = Critical
    
    /// @notice Status enumeration (stored as encrypted uint8)
    /// 0 = Pending, 1 = Approved, 2 = Flagged

    /// @notice Structure for a compliance record (on-chain)
    struct ComplianceRecord {
        uint256 id;
        address submitter;
        uint256 timestamp;
        euint8 riskLevel;        // Encrypted risk level (0-3)
        euint8 status;           // Encrypted status (0-2)
        euint32 violationCode;   // Encrypted violation code
        bool exists;
    }

    /// @notice Mapping from record ID to ComplianceRecord
    mapping(uint256 => ComplianceRecord) private _records;

    /// @notice Array of all record IDs for enumeration
    uint256[] private _recordIds;

    /// @notice Counter for generating unique record IDs
    uint256 private _nextRecordId;

    /// @notice Event emitted when a new record is created
    event RecordCreated(uint256 indexed recordId, address indexed submitter, uint256 timestamp);

    /// @notice Event emitted when a record is updated
    event RecordUpdated(uint256 indexed recordId, address indexed updater, uint256 timestamp);
    
    /// @notice Event emitted when access is granted
    event AccessGranted(uint256 indexed recordId, address indexed granter, address indexed grantee, uint256 timestamp);

    /// @notice Returns the total number of records
    function getRecordCount() external view returns (uint256) {
        return _recordIds.length;
    }

    /// @notice Returns all record IDs
    function getAllRecordIds() external view returns (uint256[] memory) {
        return _recordIds;
    }

    /// @notice Returns basic info about a record (non-encrypted fields)
    function getRecordInfo(uint256 recordId) external view returns (
        uint256 id,
        address submitter,
        uint256 timestamp,
        bool exists
    ) {
        ComplianceRecord storage record = _records[recordId];
        return (record.id, record.submitter, record.timestamp, record.exists);
    }

    /// @notice Returns the encrypted risk level of a record
    function getEncryptedRiskLevel(uint256 recordId) external view returns (euint8) {
        require(_records[recordId].exists, "Record does not exist");
        return _records[recordId].riskLevel;
    }

    /// @notice Returns the encrypted status of a record
    function getEncryptedStatus(uint256 recordId) external view returns (euint8) {
        require(_records[recordId].exists, "Record does not exist");
        return _records[recordId].status;
    }

    /// @notice Returns the encrypted violation code of a record
    function getEncryptedViolationCode(uint256 recordId) external view returns (euint32) {
        require(_records[recordId].exists, "Record does not exist");
        return _records[recordId].violationCode;
    }

    /// @notice Creates a new compliance record with encrypted data
    /// @param encryptedRiskLevel The encrypted risk level (0-3)
    /// @param riskLevelProof The proof for the encrypted risk level
    /// @param encryptedViolationCode The encrypted violation code
    /// @param violationCodeProof The proof for the encrypted violation code
    /// @return recordId The ID of the newly created record
    function createRecord(
        externalEuint8 encryptedRiskLevel,
        bytes calldata riskLevelProof,
        externalEuint32 encryptedViolationCode,
        bytes calldata violationCodeProof
    ) external returns (uint256 recordId) {
        recordId = _nextRecordId++;
        
        euint8 riskLevel = FHE.fromExternal(encryptedRiskLevel, riskLevelProof);
        euint32 violationCode = FHE.fromExternal(encryptedViolationCode, violationCodeProof);
        
        // Determine status based on risk level
        // If riskLevel >= 2 (High or Critical), status = 2 (Flagged)
        // Otherwise status = 0 (Pending)
        euint8 two = FHE.asEuint8(2);
        euint8 zero = FHE.asEuint8(0);
        ebool isHighRisk = FHE.ge(riskLevel, two);
        euint8 status = FHE.select(isHighRisk, two, zero);

        _records[recordId] = ComplianceRecord({
            id: recordId,
            submitter: msg.sender,
            timestamp: block.timestamp,
            riskLevel: riskLevel,
            status: status,
            violationCode: violationCode,
            exists: true
        });

        _recordIds.push(recordId);

        // Allow contract and submitter to access encrypted values
        FHE.allowThis(riskLevel);
        FHE.allow(riskLevel, msg.sender);
        FHE.allowThis(status);
        FHE.allow(status, msg.sender);
        FHE.allowThis(violationCode);
        FHE.allow(violationCode, msg.sender);

        emit RecordCreated(recordId, msg.sender, block.timestamp);
    }

    /// @notice Updates the status of a record (only submitter can update)
    /// @param recordId The ID of the record to update
    /// @param encryptedStatus The new encrypted status
    /// @param statusProof The proof for the encrypted status
    function updateStatus(
        uint256 recordId,
        externalEuint8 encryptedStatus,
        bytes calldata statusProof
    ) external {
        require(_records[recordId].exists, "Record does not exist");
        require(_records[recordId].submitter == msg.sender, "Only submitter can update");

        euint8 newStatus = FHE.fromExternal(encryptedStatus, statusProof);
        _records[recordId].status = newStatus;

        FHE.allowThis(newStatus);
        FHE.allow(newStatus, msg.sender);

        emit RecordUpdated(recordId, msg.sender, block.timestamp);
    }

    /// @notice Grants decryption permission to a specific address for a record
    /// @param recordId The ID of the record
    /// @param user The address to grant permission to
    function grantAccess(uint256 recordId, address user) external {
        require(_records[recordId].exists, "Record does not exist");
        require(_records[recordId].submitter == msg.sender, "Only submitter can grant access");

        FHE.allow(_records[recordId].riskLevel, user);
        FHE.allow(_records[recordId].status, user);
        FHE.allow(_records[recordId].violationCode, user);
        
        emit AccessGranted(recordId, msg.sender, user, block.timestamp);
    }
}
