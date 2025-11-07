# 🔐 Secure Compliance Hub

**Encrypted Customs Compliance Records on Blockchain**

A decentralized application for managing customs compliance records with end-to-end encryption using Fully Homomorphic Encryption (FHE). Built with FHEVM by Zama, this platform ensures sensitive compliance data remains private while maintaining transparency and auditability.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://secure-compliance-hub.vercel.app/)
[![License](https://img.shields.io/badge/License-BSD--3--Clause--Clear-green?style=for-the-badge)](LICENSE)

## 🎥 Demo Video

Watch the full demonstration: **[Video.mp4](./Video.mp4)**

## ✨ Features

- 🔒 **End-to-End Encryption**: All sensitive data (risk levels, violation codes, status) encrypted using FHE
- 🔐 **Privacy-Preserving**: Perform computations on encrypted data without decryption
- 📊 **Transparent Compliance**: Maintain audit trails while protecting sensitive information
- 🎯 **Access Control**: Granular permission system for data access
- 🌐 **Decentralized**: Deployed on Ethereum Sepolia testnet
- 💼 **Modern UI**: Beautiful, responsive interface built with Next.js and TailwindCSS

## 🚀 Live Demo

Experience the application live at: **[https://secure-compliance-hub.vercel.app/](https://secure-compliance-hub.vercel.app/)**

## 🏗️ Architecture

### Smart Contract Layer
- **SecureCompliance.sol**: Main contract managing encrypted compliance records
  - Encrypted storage of risk levels (euint8)
  - Encrypted violation codes (euint32)
  - Encrypted status tracking
  - Access control and permission management
  - Event emission for audit trails

### Frontend Layer
- **Next.js 15**: Modern React framework with App Router
- **TailwindCSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **RainbowKit**: Wallet connection
- **Wagmi**: Ethereum interactions
- **FHEVM SDK**: FHE encryption/decryption

## 🛠️ Tech Stack

**Blockchain:**
- Solidity ^0.8.24
- FHEVM by Zama
- Hardhat
- Ethers.js v6

**Frontend:**
- Next.js 15.5.6
- React 19
- TypeScript
- TailwindCSS
- Lucide Icons

**Testing:**
- Hardhat Tests
- Chai Assertions
- FHEVM Mock Environment

## 📦 Installation & Setup

### Prerequisites

- **Node.js**: Version 20 or higher
- **MetaMask**: Browser wallet extension
- **Sepolia ETH**: For testnet deployment

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/VictorHutt/secure-compliance-hub.git
cd secure-compliance-hub

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Environment Setup

```bash
# Set up Hardhat variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run coverage
```

### Deploy Contract

```bash
# Deploy to local network
npx hardhat node
npx hardhat deploy --network localhost

# Deploy to Sepolia testnet
npx hardhat deploy --network sepolia
```

### Run Frontend

```bash
cd frontend

# Generate ABI files
npm run genabi

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
secure-compliance-hub/
├── contracts/
│   └── SecureCompliance.sol      # Main FHE compliance contract
├── deploy/
│   └── deploy.ts                 # Deployment scripts
├── test/
│   ├── SecureCompliance.ts       # Contract tests
│   └── SecureComplianceSepolia.ts
├── tasks/
│   ├── accounts.ts               # Account management
│   └── SecureCompliance.ts       # Contract interaction tasks
├── frontend/
│   ├── app/                      # Next.js app directory
│   │   ├── page.tsx              # Main page
│   │   ├── layout.tsx            # Root layout
│   │   └── providers.tsx         # Web3 providers
│   ├── components/
│   │   ├── ComplianceForm.tsx    # Record creation form
│   │   ├── ComplianceRecordCard.tsx
│   │   ├── EncryptedField.tsx    # FHE field display
│   │   ├── Header.tsx            # App header
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/
│   │   ├── useSecureCompliance.tsx
│   │   └── metamask/             # MetaMask hooks
│   ├── fhevm/                    # FHEVM utilities
│   └── abi/                      # Generated ABIs
├── hardhat.config.ts             # Hardhat configuration
└── package.json
```

## 📜 Available Scripts

### Backend (Root)

| Script             | Description                    |
| ------------------ | ------------------------------ |
| `npm run compile`  | Compile smart contracts        |
| `npm run test`     | Run contract tests             |
| `npm run coverage` | Generate test coverage report  |
| `npm run lint`     | Run Solidity linting           |
| `npm run deploy`   | Deploy to configured network   |

### Frontend

| Script          | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start development server   |
| `npm run build` | Build for production       |
| `npm run start` | Start production server    |
| `npm run genabi`| Generate ABI files         |
| `npm run lint`  | Run ESLint checks          |

## � Key Concepts

### Fully Homomorphic Encryption (FHE)

This project leverages FHE to enable computations on encrypted data without ever decrypting it. This means:

- **Privacy**: Sensitive compliance data never exposed in plaintext on-chain
- **Computation**: Smart contracts can process encrypted values (e.g., auto-flagging high-risk records)
- **Selective Disclosure**: Only authorized parties can decrypt specific fields

### Use Cases

1. **Customs Compliance**: Encrypted violation codes and risk assessments
2. **Regulatory Reporting**: Maintain privacy while proving compliance
3. **Audit Trails**: Transparent record-keeping with confidential details
4. **Access Control**: Grant decryption rights to specific auditors or authorities

## 🎯 How It Works

1. **Create Record**: User encrypts sensitive data (risk level, violation code) client-side
2. **Submit Transaction**: Encrypted data sent to smart contract
3. **On-Chain Processing**: Contract performs computations on encrypted data (e.g., auto-flagging)
4. **Storage**: Encrypted records stored on blockchain
5. **Decryption**: Only authorized users can decrypt specific fields using their private keys

## 🔒 Security Features

- **Client-Side Encryption**: Data encrypted before leaving user's browser
- **Zero-Knowledge Proofs**: Validate encrypted inputs without revealing values
- **Access Control Lists**: Granular permissions for data access
- **Event Logging**: All actions logged for audit purposes
- **Immutable Records**: Blockchain ensures data integrity

## �� Documentation & Resources

### FHEVM Documentation
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)

### Project Resources
- [Live Demo](https://secure-compliance-hub.vercel.app/)
- [Smart Contract](./contracts/SecureCompliance.sol)
- [Frontend Code](./frontend)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama**: For the FHEVM protocol and tooling
- **Ethereum Foundation**: For the Sepolia testnet
- **Vercel**: For hosting and deployment

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with 🔐 FHE Technology by Zama**
