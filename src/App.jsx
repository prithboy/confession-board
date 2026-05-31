import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useConfessionBoard } from './hooks/useConfessionBoard'
import { Navbar } from './components/Navbar'
import { HeroStats } from './components/HeroStats'
import { PostModal } from './components/PostModal'
import { ConfessionFeed } from './components/ConfessionFeed'
import { TxToast } from './components/TxToast'
import { Background } from './components/Background'

export default function App() {
  const { isConnected } = useAccount()
  const board = useConfessionBoard()
  const [showModal, setShowModal] = useState(false)
  const [sortBy, setSortBy] = useState('top')

  const handleConfessClick = () => {
    setShowModal(true)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Background />

      <Navbar onConfess={handleConfessClick} />

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
          isConnected={isConnected}
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
