import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

// Arc Testnet chain definition
export const arcTestnet = defineChain({
  id: 1338,  // Update with actual Arc Testnet chain ID from https://docs.arc.io
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.io'], // Update from https://docs.arc.io
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
})

export const wagmiConfig = getDefaultConfig({
  appName: 'Confession Board',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [arcTestnet],
  ssr: false,
})
