import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useConfessionBoard } from './hooks/useConfessionBoard'
import { Navbar } from './components/Navbar'
import { HeroStats } from './components/HeroStats'
import { PostModal } from './components/PostModal'
import { ConfessionFeed } from './components/ConfessionFeed'
import { TxToast } from './components/TxToast'
import { Background } from './components/Background'
import { arcTestnet } from './lib/wagmi'

export default function App() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const board = useConfessionBoard()
  const [showModal, setShowModal] = useState(false)
  const [sortBy, setSortBy] = useState('top')

  const isWrongNetwork = isConnected && chainId !== arcTestnet.id

  const handleConfessClick = () => setShowModal(true)

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Background />
      <Navbar onConfess={handleConfessClick} />

      {/* Wrong network banner */}
      {isWrongNetwork && (
        <div style={{
          background: 'rgba(232,91,122,0.1)',
          border: '1px solid rgba(232,91,122,0.3)',
          borderRadius: 0,
          padding: '10px 24px',
          textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: 'var(--arc-red)', fontFamily: 'var(--font-mono)' }}>
            ⚠ Wrong network — please switch to Arc Testnet
          </span>
          <button
            onClick={() => switchChain({ chainId: arcTestnet.id })}
            style={{
              background: 'var(--arc-red)', border: 'none', borderRadius: 8,
              padding: '5px 14px', color: '#fff', fontSize: 12,
              fontFamily: 'var(--font-mono)', cursor: 'pointer',
            }}
          >
            Switch Network
          </button>
        </div>
      )}

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 100px' }}>
        <HeroStats
          pool={board.pool}
          timeLeft={board.timeLeft}
          currentWeek={board.currentWeek}
          postCount={board.posts.length}
          onConfess={handleConfessClick}
        />

        <ConfessionFeed
          posts={board.posts}
          sortBy={sortBy}
          setSortBy={setSortBy}
          votedPosts={board.votedPosts}
          onUpvote={board.upvotePost}
          loading={board.loading}
          txStatus={board.txStatus}
        />
      </main>

      {showModal && (
        <PostModal
          onClose={() => { setShowModal(false); board.setTxStatus(null) }}
          onPost={board.postConfession}
          txStatus={board.txStatus}
          txError={board.txError}
          isConnected={isConnected && !isWrongNetwork}
          isWrongNetwork={isWrongNetwork}
          onSwitchNetwork={() => switchChain({ chainId: arcTestnet.id })}
        />
      )}

      {board.txStatus && (
        <TxToast
          status={board.txStatus}
          error={board.txError}
          onDismiss={() => board.setTxStatus(null)}
        />
      )}
    </div>
  )
}
