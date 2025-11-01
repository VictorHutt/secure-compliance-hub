import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { SecureCompliance, SecureCompliance__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("SecureCompliance")) as SecureCompliance__factory;
  const secureComplianceContract = (await factory.deploy()) as SecureCompliance;
  const secureComplianceContractAddress = await secureComplianceContract.getAddress();

  return { secureComplianceContract, secureComplianceContractAddress };
}

describe("SecureCompliance", function () {
  let signers: Signers;
  let secureComplianceContract: SecureCompliance;
  let secureComplianceContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ secureComplianceContract, secureComplianceContractAddress } = await deployFixture());
  });

  it("should have zero records after deployment", async function () {
    const recordCount = await secureComplianceContract.getRecordCount();
    expect(recordCount).to.eq(0);
  });

  it("should create a compliance record with encrypted data", async function () {
    // Encrypt risk level (Low = 0)
    const clearRiskLevel = 0;
    const encryptedRiskLevel = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add8(clearRiskLevel)
      .encrypt();

    // Encrypt violation code
    const clearViolationCode = 1001;
    const encryptedViolationCode = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add32(clearViolationCode)
      .encrypt();

    // Create record
    const tx = await secureComplianceContract
      .connect(signers.alice)
      .createRecord(
        encryptedRiskLevel.handles[0],
        encryptedRiskLevel.inputProof,
        encryptedViolationCode.handles[0],
        encryptedViolationCode.inputProof
      );
    await tx.wait();

    // Verify record count
    const recordCount = await secureComplianceContract.getRecordCount();
    expect(recordCount).to.eq(1);

    // Verify record info
    const recordInfo = await secureComplianceContract.getRecordInfo(0);
    expect(recordInfo.id).to.eq(0);
    expect(recordInfo.submitter).to.eq(signers.alice.address);
    expect(recordInfo.exists).to.eq(true);
  });

  it("should decrypt risk level correctly", async function () {
    // Create a record with High risk (2)
    const clearRiskLevel = 2;
    const encryptedRiskLevel = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add8(clearRiskLevel)
      .encrypt();

    const clearViolationCode = 2002;
    const encryptedViolationCode = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add32(clearViolationCode)
      .encrypt();

    const tx = await secureComplianceContract
      .connect(signers.alice)
      .createRecord(
        encryptedRiskLevel.handles[0],
        encryptedRiskLevel.inputProof,
        encryptedViolationCode.handles[0],
        encryptedViolationCode.inputProof
      );
    await tx.wait();

    // Get encrypted risk level handle
    const encryptedRiskLevelHandle = await secureComplianceContract.getEncryptedRiskLevel(0);
    expect(encryptedRiskLevelHandle).to.not.eq(ethers.ZeroHash);

    // Decrypt risk level
    const decryptedRiskLevel = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedRiskLevelHandle,
      secureComplianceContractAddress,
      signers.alice,
    );
    expect(decryptedRiskLevel).to.eq(clearRiskLevel);
  });

  it("should decrypt violation code correctly", async function () {
    const clearRiskLevel = 1;
    const encryptedRiskLevel = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add8(clearRiskLevel)
      .encrypt();

    const clearViolationCode = 3003;
    const encryptedViolationCode = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add32(clearViolationCode)
      .encrypt();

    const tx = await secureComplianceContract
      .connect(signers.alice)
      .createRecord(
        encryptedRiskLevel.handles[0],
        encryptedRiskLevel.inputProof,
        encryptedViolationCode.handles[0],
        encryptedViolationCode.inputProof
      );
    await tx.wait();

    // Get encrypted violation code handle
    const encryptedViolationCodeHandle = await secureComplianceContract.getEncryptedViolationCode(0);
    expect(encryptedViolationCodeHandle).to.not.eq(ethers.ZeroHash);

    // Decrypt violation code
    const decryptedViolationCode = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedViolationCodeHandle,
      secureComplianceContractAddress,
      signers.alice,
    );
    expect(decryptedViolationCode).to.eq(clearViolationCode);
  });

  it("should set status to flagged for high risk records", async function () {
    // Create a record with High risk (2) - should be flagged
    const clearRiskLevel = 2;
    const encryptedRiskLevel = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add8(clearRiskLevel)
      .encrypt();

    const encryptedViolationCode = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();

    const tx = await secureComplianceContract
      .connect(signers.alice)
      .createRecord(
        encryptedRiskLevel.handles[0],
        encryptedRiskLevel.inputProof,
        encryptedViolationCode.handles[0],
        encryptedViolationCode.inputProof
      );
    await tx.wait();

    // Get and decrypt status
    const encryptedStatusHandle = await secureComplianceContract.getEncryptedStatus(0);
    const decryptedStatus = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedStatusHandle,
      secureComplianceContractAddress,
      signers.alice,
    );
    
    // Status should be 2 (Flagged) for high risk
    expect(decryptedStatus).to.eq(2);
  });

  it("should set status to pending for low risk records", async function () {
    // Create a record with Low risk (0) - should be pending
    const clearRiskLevel = 0;
    const encryptedRiskLevel = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add8(clearRiskLevel)
      .encrypt();

    const encryptedViolationCode = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();

    const tx = await secureComplianceContract
      .connect(signers.alice)
      .createRecord(
        encryptedRiskLevel.handles[0],
        encryptedRiskLevel.inputProof,
        encryptedViolationCode.handles[0],
        encryptedViolationCode.inputProof
      );
    await tx.wait();

    // Get and decrypt status
    const encryptedStatusHandle = await secureComplianceContract.getEncryptedStatus(0);
    const decryptedStatus = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedStatusHandle,
      secureComplianceContractAddress,
      signers.alice,
    );
    
    // Status should be 0 (Pending) for low risk
    expect(decryptedStatus).to.eq(0);
  });

  it("should allow submitter to update status", async function () {
    // Create a record
    const encryptedRiskLevel = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add8(0)
      .encrypt();

    const encryptedViolationCode = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();

    let tx = await secureComplianceContract
      .connect(signers.alice)
      .createRecord(
        encryptedRiskLevel.handles[0],
        encryptedRiskLevel.inputProof,
        encryptedViolationCode.handles[0],
        encryptedViolationCode.inputProof
      );
    await tx.wait();

    // Update status to Approved (1)
    const newStatus = 1;
    const encryptedNewStatus = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add8(newStatus)
      .encrypt();

    tx = await secureComplianceContract
      .connect(signers.alice)
      .updateStatus(0, encryptedNewStatus.handles[0], encryptedNewStatus.inputProof);
    await tx.wait();

    // Verify new status
    const encryptedStatusHandle = await secureComplianceContract.getEncryptedStatus(0);
    const decryptedStatus = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedStatusHandle,
      secureComplianceContractAddress,
      signers.alice,
    );
    expect(decryptedStatus).to.eq(newStatus);
  });

  it("should not allow non-submitter to update status", async function () {
    // Create a record as alice
    const encryptedRiskLevel = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add8(0)
      .encrypt();

    const encryptedViolationCode = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();

    const tx = await secureComplianceContract
      .connect(signers.alice)
      .createRecord(
        encryptedRiskLevel.handles[0],
        encryptedRiskLevel.inputProof,
        encryptedViolationCode.handles[0],
        encryptedViolationCode.inputProof
      );
    await tx.wait();

    // Try to update status as bob (should fail)
    const encryptedNewStatus = await fhevm
      .createEncryptedInput(secureComplianceContractAddress, signers.bob.address)
      .add8(1)
      .encrypt();

    await expect(
      secureComplianceContract
        .connect(signers.bob)
        .updateStatus(0, encryptedNewStatus.handles[0], encryptedNewStatus.inputProof)
    ).to.be.revertedWith("Only submitter can update");
  });
});
