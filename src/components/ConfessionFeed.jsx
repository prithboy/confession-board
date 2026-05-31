import { useState } from 'react'
import { useAccount } from 'wagmi'

function timeAgo(ts) {
  const diff = Date.now() / 1000 - Number(ts)
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--arc-surface)', border: '1px solid var(--arc-border)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 10,
    }}>
      <div style={{
        height: 14, borderRadius: 4, marginBottom: 12,
        background: 'linear-gradient(90deg, var(--arc-subtle) 25%, rgba(255,255,255,0.06) 50%, var(--arc-subtle) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        width: '85%',
      }} />
      <div style={{
        height: 14, borderRadius: 4, marginBottom: 12,
        background: 'linear-gradient(90deg, var(--arc-subtle) 25%, rgba(255,255,255,0.06) 50%, var(--arc-subtle) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite 0.1s',
        width: '60%',
      }} />
      <div style={{ height: 10, borderRadius: 4, width: '30%',
        background: 'var(--arc-subtle)', }} />
    </div>
  )
}

function ConfessionCard({ post, rank, onUpvote, hasVoted, isLeading, txStatus }) {
  const [hover, setHover] = useState(false)
  const [localVoting, setLocalVoting] = useState(false)
  const { isConnected } = useAccount()

  const handleUpvote = async () => {
    if (hasVoted || localVoting) return
    setLocalVoting(true)
    try { await onUpvote(post.id) } catch {}
    setLocalVoting(false)
  }

  const isVoting = localVoting || (txStatus === 'upvoting')

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: hover ? 'rgba(255,255,255,0.025)' : 'var(--arc-surface)',
        border: isLeading
          ? '1px solid rgba(232,184,91,0.25)'
          : `1px solid ${hover ? 'var(--arc-border-hi)' : 'var(--arc-border)'}`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 10,
        transition: 'all 0.18s ease',
        animation: 'fadeUp 0.35s ease both',
        boxShadow: isLeading ? '0 0 0 1px rgba(232,184,91,0.08), 0 4px 20px rgba(232,184,91,0.04)' : 'none',
      }}
    >
      {/* Leading badge */}
      {isLeading && (
        <div style={{
          position: 'absolute', top: -1, right: 20,
          background: 'linear-gradient(135deg, #e8b85b, #e87b5b)',
          color: '#000', fontSize: 10, fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          padding: '2px 10px', borderRadius: '0 0 8px 8px',
          letterSpacing: '0.1em',
        }}>LEADING</div>
      )}

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Rank */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13, fontWeight: 500,
          color: rank === 1 ? 'var(--arc-gold)'
               : rank === 2 ? 'rgba(255,255,255,0.4)'
               : rank === 3 ? 'rgba(205,127,50,0.7)'
               : 'rgba(255,255,255,0.12)',
          minWidth: 24, paddingTop: 2, lineHeight: 1.4,
          letterSpacing: '0.03em',
        }}>
          #{rank}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 14px 0',
            fontSize: 15, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.82)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
          }}>
            "{post.text}"
          </p>

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{
              fontSize: 11, fontFamily: 'var(--font-mono)',
              color: 'var(--arc-muted)', letterSpacing: '0.04em',
            }}>
              anon#{String(post.id).padStart(4, '0')} · {timeAgo(post.timestamp)}
            </span>

            {/* Upvote */}
            <button
              onClick={handleUpvote}
              disabled={hasVoted || isVoting || !isConnected}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: hasVoted
                  ? 'rgba(91,141,238,0.08)'
                  : hover ? 'rgba(91,141,238,0.12)' : 'rgba(255,255,255,0.04)',
                border: hasVoted
                  ? '1px solid rgba(91,141,238,0.25)'
                  : '1px solid var(--arc-border)',
                borderRadius: 8, padding: '5px 12px',
                color: hasVoted ? 'var(--arc-blue)' : 'var(--arc-muted)',
                fontSize: 12, fontFamily: 'var(--font-mono)',
                cursor: hasVoted || !isConnected ? 'default' : 'pointer',
                transition: 'all 0.15s',
                opacity: isVoting ? 0.5 : 1,
              }}
            >
              {isVoting
                ? <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>○</span>
                : <span>{hasVoted ? '✓' : '▲'}</span>
              }
              <span>{post.upvotes}</span>
              {!hasVoted && isConnected && (
                <span style={{ fontSize: 10, opacity: 0.5 }}>$0.05</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConfessionFeed({ posts, sortBy, setSortBy, votedPosts, onUpvote, loading, txStatus }) {
  const sorted = [...posts].sort((a, b) =>
    sortBy === 'top' ? b.upvotes - a.upvotes : b.timestamp - a.timestamp
  )
  const topPost = [...posts].sort((a, b) => b.upvotes - a.upvotes)[0]

  return (
    <div>
      {/* Sort bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16,
        gap: 12, flexWrap: 'wrap',
      }}>
        <h2 style={{
          fontSize: 13, fontFamily: 'var(--font-mono)',
          color: 'var(--arc-muted)', letterSpacing: '0.08em',
          fontWeight: 400, textTransform: 'uppercase',
        }}>
          {posts.length} confession{posts.length !== 1 ? 's' : ''}
        </h2>

        <div style={{
          display: 'flex', gap: 2,
          background: 'var(--arc-surface)',
          border: '1px solid var(--arc-border)',
          borderRadius: 10, padding: 3,
        }}>
          {['top', 'new'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                padding: '5px 14px', borderRadius: 8, border: 'none',
                background: sortBy === s ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: sortBy === s ? 'var(--arc-text)' : 'var(--arc-muted)',
                fontSize: 12, fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                transition: 'all 0.15s',
              }}
            >
              {s === 'top' ? '▲ Top' : '◎ New'}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </>
      ) : sorted.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: 'var(--arc-muted)', fontFamily: 'var(--font-serif)',
          fontStyle: 'italic', fontSize: 18,
        }}>
          No confessions yet. Be the first.
        </div>
      ) : (
        sorted.map((post, i) => (
          <ConfessionCard
            key={post.id}
            post={post}
            rank={i + 1}
            onUpvote={onUpvote}
            hasVoted={votedPosts.has(post.id)}
            isLeading={sortBy === 'top' && i === 0 && post.upvotes > 0}
            txStatus={txStatus}
          />
        ))
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center', paddingTop: 48,
        fontSize: 12, fontFamily: 'var(--font-mono)',
        color: 'rgba(255,255,255,0.15)', lineHeight: 2,
        letterSpacing: '0.04em',
      }}>
        <div>post $0.10 · upvote $0.05 · winner takes pool every sunday</div>
        <div style={{ marginTop: 4 }}>
          built on{' '}
          <a href="https://arc.io" target="_blank" rel="noreferrer"
            style={{ color: 'var(--arc-blue)', opacity: 0.6 }}>arc network</a>
          {' '}· all confessions permanent on-chain
        </div>
      </div>
    </div>
  )
}
