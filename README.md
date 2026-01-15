# Payrail 🚀

> **The programmable payment rail for the global economy**

A hybrid on-chain subscription platform that supports both traditional Web3 wallet-based payments and innovative deposit vault mechanisms for seamless, gasless transactions with automated fee splitting.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Frontend Usage](#frontend-usage)
- [Backend Services](#backend-services)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

Payrail is a modern subscription billing platform built for Web3. It offers merchants two payment methods:

1. **Wallet-Based (Pull)** - Users connect their crypto wallets and authorize recurring payments
2. **Deposit Vaults (Push)** - Users receive unique deposit addresses and send funds manually or from exchanges

Every transaction is split automatically: **99% to merchants, 1% protocol fee**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│         (Merchant Dashboard + Subscriber Portal)             │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼─────┐    ┌────▼──────────┐
    │ Supabase │    │   FastAPI     │
    │   (Auth) │    │  (Vault API)  │
    └────┬─────┘    └────┬──────────┘
         │                │
         └───────┬────────┘
                 │
         ┌───────▼────────────────┐
         │  Ethereum / Base Chain │
         │  (Smart Contract)      │
         └───────────────────────┘
                 │
         ┌───────▼──────────┐
         │  Python Watcher  │
         │  (Monitor Vaults)│
         └──────────────────┘
```

---

## Key Features

### For Merchants

- 🎯 **Create Subscription Plans** - Set price, interval, and token type
- 💰 **Automatic Revenue Splits** - 99% arrives at treasury wallet automatically
- 📊 **Real-Time Dashboard** - Track subscriptions, vaults, and transactions
- 🔌 **API Integration** - Embed checkout widget on your site
- 🔐 **Secure Keys** - API keys and webhook secrets for backend integration

### For Subscribers

- 🪙 **Two Payment Methods**
  - Connect wallet for automatic recurring charges
  - Use unique deposit vault for manual payments
- 📱 **Subscriber Portal** - Manage all subscriptions in one place
- ✨ **Gasless Experience** - Merchant sponsors transaction fees
- 🔄 **Full Control** - Cancel subscriptions anytime

### Protocol

- 🛡️ **Deterministic Vaults** - CREATE2 deployed per user/plan combo
- 🚀 **Scalable** - Minimal on-chain footprint
- 🏛️ **Protocol Treasury** - 1% fee for sustainability
- 📝 **Full Transparency** - All transactions auditable on-chain

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Ethers.js v6** - Web3 integration
- **Supabase** - Authentication & real-time DB
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python async API
- **Supabase** - PostgreSQL + Auth
- **Web3.py** - Ethereum interaction
- **Python-dotenv** - Environment management

### Smart Contracts
- **Solidity ^0.8.20**
- **OpenZeppelin** - Token & access control
- **CREATE2** - Deterministic deployments

### Blockchain
- **Ethereum / Base** (configurable)
- **USDC** (primary stablecoin)

---

## Project Structure

```
payrail/
├── frontend/                           # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthPage.tsx        # Login/signup
│   │   │   │   ├── MerchantOnboarding.tsx
│   │   │   │   └── MerchantOnboarding.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Overview.tsx        # Revenue & subscriptions
│   │   │   │   ├── Plans.tsx           # Create/manage plans
│   │   │   │   ├── DepositVaults.tsx   # Monitor vaults
│   │   │   │   ├── Settings.tsx        # API credentials
│   │   │   │   └── MerchantDashboard.tsx
│   │   │   ├── Checkout/
│   │   │   │   └── CheckoutWidget.tsx  # Payment UI
│   │   │   └── Subscriber/
│   │   │       └── SubscriberPortal.tsx # Manage subscriptions
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx         # Auth state
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── abis.ts                 # Contract ABIs
│   │   ├── types/
│   │   │   └── database.ts             # TypeScript types
│   │   └── App.tsx
│   └── index.html
│
├── backend/                            # Python FastAPI
│   ├── main.py                         # FastAPI routes
│   ├── database.py                     # Supabase client
│   ├── security.py                     # Key hashing
│   ├── watcher.py                      # Vault monitoring
│   ├── requirements.txt
│   └── .env
│
├── contracts/                          # Solidity
│   ├── PayrailEngine.sol               # Main subscription contract
│   ├── SubscriptionVault.sol           # Deposit vault template
│   └── deployments/
│       └── [chain]/
│           └── addresses.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MetaMask or compatible wallet
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-key
RPC_URL=https://base-sepolia-rpc.publicnode.com
CONTRACT_ADDRESS=0x...
USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
PRIVATE_KEY=your-deployer-key
```

Start the API:
```bash
uvicorn main:app --reload
```

Start the watcher:
```bash
python watcher.py
```

### Smart Contract Deployment

```bash
# Using Hardhat or Foundry
npx hardhat run scripts/deploy.js --network base-sepolia

# Update CONTRACT_ADDRESS in .env
# Update ENGINE_ADDRESS in frontend/lib/abis.ts
```

---

## Configuration

### Environment Variables

#### Frontend (`.env.local`)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_API_URL` | FastAPI backend URL |

#### Backend (`.env`)
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |
| `RPC_URL` | Ethereum RPC endpoint |
| `CONTRACT_ADDRESS` | Deployed PayrailEngine address |
| `USDC_ADDRESS` | USDC token address |
| `PRIVATE_KEY` | Deployer/watcher wallet private key |

### Supabase Setup

Create these tables in your Supabase database:

```sql
-- Merchants
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  treasury_address TEXT NOT NULL,
  api_key TEXT UNIQUE,
  api_key_hash TEXT UNIQUE,
  webhook_secret TEXT UNIQUE,
  total_revenue DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES merchants,
  onchain_plan_id INT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  token VARCHAR(10),
  token_address TEXT,
  interval VARCHAR(10),
  interval_count INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES plans,
  merchant_id UUID REFERENCES merchants,
  subscriber_address TEXT,
  payment_method VARCHAR(20),
  status VARCHAR(20),
  next_billing_date TIMESTAMP,
  started_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deposit Vaults
CREATE TABLE deposit_vaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions,
  merchant_id UUID REFERENCES merchants,
  vault_address TEXT UNIQUE,
  balance DECIMAL DEFAULT 0,
  total_received DECIMAL DEFAULT 0,
  last_sweep_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions,
  merchant_id UUID REFERENCES merchants,
  amount DECIMAL NOT NULL,
  token VARCHAR(10),
  tx_hash TEXT,
  transaction_type VARCHAR(50),
  merchant_revenue DECIMAL,
  protocol_fee DECIMAL,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Documentation

### Authentication
All endpoints require the `X-Payrail-Secret` header with the merchant's API key.

```bash
curl -H "X-Payrail-Secret: sk_live_abc123..." http://localhost:8000/vaults/predict
```

### Endpoints

#### Register Merchant
```http
POST /merchants/register
Content-Type: application/json

{
  "name": "My Business",
  "wallet": "0x..."
}

Response:
{
  "secret_key": "sk_live_abc123..."  // Show once, then hash it
}
```

#### Predict Vault Address
```http
GET /vaults/predict?user_wallet=0x...&plan_id=1
Headers: X-Payrail-Secret: sk_live_...

Response:
{
  "vault_address": "0xDeterministicAddress"
}
```

---

## Smart Contract

### PayrailEngine

**Main contract managing subscriptions and payments.**

#### Key Functions

```solidity
// Create a subscription plan
function createPlan(
  address _token,
  uint256 _amount,
  uint256 _frequency
) external

// Subscribe via wallet (pull payment)
function subscribe(uint256 _planId) external

// Execute recurring payment (called by keepers/backend)
function executeRecurringPayment(address _user, uint256 _planId) external

// Process deposit vault payment (called by backend watcher)
function processDeposit(address _user, uint256 _planId) external nonReentrant

// Get predicted vault address for user/plan
function getDepositAddress(address _user, uint256 _planId) public view returns (address)

// Check if subscription is active
function isSubscriptionActive(address _user, uint256 _planId) external view returns (bool)
```

#### Events

```solidity
event PlanCreated(uint256 indexed planId, address indexed merchant, uint256 amount);
event PaymentExecuted(address indexed user, uint256 indexed planId, uint256 amount, uint256 fee);
event SubscriptionCancelled(address indexed user, uint256 indexed planId);
```

### SubscriptionVault

**Deterministic mini-contracts deployed via CREATE2 per user/plan combo.**

Holds USDC temporarily until backend sweeps it to the engine.

```solidity
function sweep(address token, address to) external
```

---

## Frontend Usage

### Auth Context

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, signUp, signIn, signOut, merchantProfile } = useAuth();
  
  // Use auth state and functions
}
```

### Create Subscription Plan

```typescript
// User fills form in Plans component
// Frontend calls smart contract:
const engineContract = new ethers.Contract(ENGINE_ADDRESS, ENGINE_ABI, signer);
const tx = await engineContract.createPlan(USDC_ADDRESS, amountInWei, frequencyInSeconds);
const receipt = await tx.wait();

// Extract on-chain planId from event
// Save to Supabase with onchain_plan_id link
```

### Checkout Widget

```typescript
<CheckoutWidget
  planId="plan-uuid"
  onClose={() => {}}
  onSuccess={(subscriptionId) => {}}
/>
```

Supports two payment methods:
- **Wallet**: Connect and auto-approve, then subscribe
- **Deposit Vault**: Get unique address, user sends funds

---

## Backend Services

### FastAPI (`main.py`)

Handles:
- Merchant registration
- Vault address prediction
- API key validation
- User session verification

### Watcher (`watcher.py`)

Monitors deposit vaults every 15 seconds:
1. Polls all PENDING vaults
2. Checks USDC balance at vault address
3. If balance ≥ plan price:
   - Calls `engine.processDeposit()`
   - Updates vault status to ACTIVE
   - Creates subscription record

---

## Database Schema

### Core Tables

**merchants**
- id (UUID)
- user_id (FK to auth.users)
- name, treasury_address
- api_key, api_key_hash, webhook_secret
- total_revenue

**plans**
- id (UUID)
- merchant_id (FK)
- onchain_plan_id (links to smart contract)
- name, description, price, token, token_address
- interval, interval_count, is_active

**subscriptions**
- id (UUID)
- plan_id, merchant_id (FKs)
- subscriber_address, payment_method
- status, next_billing_date
- started_at, cancelled_at

**deposit_vaults**
- id (UUID)
- subscription_id, merchant_id (FKs)
- vault_address (unique, deterministic)
- balance, total_received
- last_sweep_at

**transactions**
- id (UUID)
- subscription_id, merchant_id (FKs)
- amount, token, tx_hash
- transaction_type, merchant_revenue, protocol_fee, status

---

## Deployment

### Frontend (Vercel)

```bash
# Connect repo to Vercel
# Set environment variables in Vercel dashboard
# Auto-deploys on push to main
```

### Backend (Railway / Render)

```bash
# Deploy FastAPI + Python watcher
# Set environment variables
# Enable auto-scaling if needed
```

### Smart Contract (Base Mainnet)

```bash
# Use Hardhat or Foundry
npx hardhat run scripts/deploy.js --network base-mainnet

# Verify on Basescan
npx hardhat verify --network base-mainnet <address> <args>
```

---

## Troubleshooting

### Common Issues

**"Invalid API Key"**
- Ensure X-Payrail-Secret header is set
- Check API key hasn't been regenerated
- Verify key hash in database

**"Vault address doesn't match"**
- Frontend and backend must use same salt calculation
- Ensure token addresses are identical
- Check plan IDs are correct

**"Insufficient deposit"**
- Deposit must be ≥ plan.amount in smallest units
- USDC has 6 decimals (1 USDC = 1000000)
- Check user sent to correct vault address

**"Subscription not created"**
- Verify transaction confirmed on-chain
- Check Supabase connectivity
- Review watcher logs for errors

---

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - See LICENSE file for details

---

## Support

- 📧 Email: support@payrail.io
- 💬 Discord: [Join Community](https://discord.gg/payrail)
- 📖 Docs: [payrail.io/docs](https://payrail.io/docs)
- 🐛 Issues: [GitHub Issues](https://github.com/payrail/payrail/issues)

---

## Roadmap

- [ ] Recurring payment automation (Gelato keepers)
- [ ] Multi-chain support (Polygon, Optimism, Arbitrum)
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] Fiat on-ramps (Stripe integration)
- [ ] Mobile app
- [ ] DAO governance

---

**Built with ❤️ by the Payrail Team**

*Making global subscriptions frictionless, transparent, and programmable.*