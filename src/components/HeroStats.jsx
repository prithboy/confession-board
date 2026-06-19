import { useState, useEffect } from 'react'
import { formatUnits } from 'viem'
import { useWriteContract, usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESS, CONFESSION_ABI } from '../lib/contract'

function formatUSDC(raw) {
  try { return Number(formatUnits(raw, 18)).toFixed(2) } catch { return '0.00' }
}

function formatCountdown(secs) {
  const s = Number(secs)
  if (s <= 0) return 'Settling...'
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${sec}s`
  return `${m}m ${sec}s`
}

function StatBox({ label, value, accent }) {
  return (
    <div style={{
      flex: 1, minWidth: 120,
      padding: '20px 24px',
      background: 'var(--arc-surface)',
      border: '1px solid var(--arc-border)',
      borderRadius: 16,
    }}>
      <div style={{
        fontSize: 11, fontFamily: 'var(--font-mono)',
        color: 'var(--arc-muted)', letterSpacing: '0.08em',
        marginBottom: 8, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontSize: 26, fontWeight: 300,
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        color: accent || 'var(--arc-text)',
        lineHeight: 1.1,
        letterSpacing: '-0.01em',
      }}>{value}</div>
    </div>
  )
}

export function HeroStats({ pool, timeLeft, currentWeek, postCount, onConfess, onRefresh }) {
  const [live, setLive] = useState(timeLeft)
  const [settling, setSettling] = useState(false)
  const [settled, setSettled] = useState(false)
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  useEffect(() => { setLive(timeLeft) }, [timeLeft])
  useEffect(() => {
    const t = setInterval(() => setLive(v => (Number(v) > 0 ? v - 1n : 0n)), 1000)
    return () => clearInterval(t)
  }, [])

  const isOver = Number(live) <= 0

  const handleSettle = async () => {
    try {
      setSettling(true)
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONFESSION_ABI,
        functionName: 'settle',
        gas: BigInt(200000),
      })
      await publicClient.waitForTransactionReceipt({ hash })
      setSettled(true)
      if (onRefresh) onRefresh()
    } catch (e) {
      console.error(e)
      alert('Settle failed: ' + (e.shortMessage || e.message))
    }
    setSettling(false)
  }

  return (
    <div style={{ paddingTop: 64, paddingBottom: 48 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontFamily: 'var(--font-mono)',
          color: 'var(--arc-muted)', letterSpacing: '0.12em',
          marginBottom: 16,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--arc-border)',
          borderRadius: 20, padding: '5px 14px',
          textTransform: 'uppercase',
        }}>
          Week #{Number(currentWeek)} · On-chain · Arc Testnet
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 'clamp(40px, 7vw, 64px)',
          fontWeight: 400, lineHeight: 1.1,
          color: 'var(--arc-text)',
          letterSpacing: '-0.02em', marginBottom: 16,
        }}>
          Confess something.<br />
          <span style={{ color: 'var(--arc-muted)', fontStyle: 'normal', fontFamily: 'var(--font-sans)', fontSize: '60%', fontWeight: 300 }}>
            Win the pool.
          </span>
        </h1>

        <p style={{
          fontSize: 15, color: 'var(--arc-muted)',
          fontWeight: 300, lineHeight: 1.6,
          maxWidth: 460, margin: '0 auto 32px',
        }}>
          Post an anonymous confession for $0.10 USDC. Upvote others for $0.05.
          The top confession every week wins the entire pool.
        </p>

        {/* Settle banner when week is over */}
        {isOver && !settled && (
          <div style={{
            background: 'rgba(232,184,91,0.08)',
            border: '1px solid rgba(232,184,91,0.25)',
            borderRadius: 14, padding: '16px 24px',
            marginBottom: 24,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--arc-gold)', marginBottom: 2 }}>
                🏆 Week #{Number(currentWeek)} is over!
              </div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--arc-muted)' }}>
                Anyone can trigger the payout — winner gets all the USDC instantly
              </div>
            </div>
            <button
              onClick={handleSettle}
              disabled={settling}
              style={{
                background: 'linear-gradient(135deg, var(--arc-gold), #e87b5b)',
                border: 'none', borderRadius: 10,
                padding: '10px 22px',
                color: '#000', fontSize: 13, fontWeight: 700,
                cursor: settling ? 'default' : 'pointer',
                opacity: settling ? 0.6 : 1,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}
            >
              {settling ? '⏳ Settling...' : '🏆 Settle & Pay Winner'}
            </button>
          </div>
        )}

        {settled && (
          <div style={{
            background: 'rgba(91,232,160,0.08)',
            border: '1px solid rgba(91,232,160,0.2)',
            borderRadius: 14, padding: '14px 24px',
            marginBottom: 24,
            fontSize: 13, fontFamily: 'var(--font-mono)',
            color: 'var(--arc-green)', textAlign: 'center',
          }}>
            ✓ Week settled! Winner has been paid. New week started.
          </div>
        )}

        <button
          onClick={onConfess}
          style={{
            background: 'var(--arc-blue)', border: 'none', borderRadius: 12,
            padding: '12px 28px', color: '#fff', fontSize: 15, fontWeight: 500,
            letterSpacing: '-0.01em', cursor: 'pointer',
            boxShadow: '0 0 0 1px rgba(91,141,238,0.3), 0 8px 24px rgba(91,141,238,0.2)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
        >
          Post a confession →
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatBox label="This week's pool" value={`$${formatUSDC(pool)} USDC`} accent="var(--arc-text)" />
        <StatBox label="Time remaining" value={formatCountdown(live)} accent={isOver ? 'var(--arc-gold)' : 'var(--arc-blue)'} />
        <StatBox label="Confessions" value={postCount} accent="var(--arc-muted)" />
      </div>
    </div>
  )
}