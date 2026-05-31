# 🕯️ Confession Board — built on Arc

Anonymous on-chain confessions. Post a secret for $0.10 USDC. Upvote others for $0.05. The top confession every week wins the entire pool.

## Stack
- **Frontend**: React + Vite
- **Wallet**: RainbowKit (MetaMask, Rabby, Coinbase, WalletConnect, + more)
- **Chain**: Arc Testnet (EVM-compatible)
- **Contract**: Solidity + Foundry

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
```
Fill in:
- `VITE_WALLETCONNECT_PROJECT_ID` — free at https://cloud.walletconnect.com
- `VITE_CONTRACT_ADDRESS` — after you deploy
- `VITE_USDC_ADDRESS` — Arc Testnet USDC (default is Circle's)

### 3. Update chain ID
In `src/lib/wagmi.js`, confirm the Arc Testnet chain ID from https://docs.arc.io

### 4. Deploy contract
```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.arc.io \
  --broadcast \
  --private-key $PRIVATE_KEY
```
Then set `VITE_CONTRACT_ADDRESS` in `.env`

### 5. Run locally
```bash
npm run dev
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Add env vars in Vercel project settings
4. Deploy — done ✓

> **Note**: The app works in demo mode with mock data before the contract is deployed. Wallet connection is fully functional once `VITE_WALLETCONNECT_PROJECT_ID` is set.
