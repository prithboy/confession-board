import { useEffect } from 'react'

const MESSAGES = {
  approving: { text: 'Approving USDC...', color: 'var(--arc-blue)', spin: true },
  posting:   { text: 'Posting confession...', color: 'var(--arc-blue)', spin: true },
  upvoting:  { text: 'Submitting upvote...', color: 'var(--arc-blue)', spin: true },
  success:   { text: 'Transaction confirmed ✓', color: 'var(--arc-green)', spin: false },
  error:     { text: 'Transaction failed', color: 'var(--arc-red)', spin: false },
}

export function TxToast({ status, error, onDismiss }) {
  const info = MESSAGES[status]
  if (!info) return null

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const t = setTimeout(onDismiss, 3000)
      return () => clearTimeout(t)
    }
  }, [status])

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      background: 'var(--arc-surface)',
      border: `1px solid ${info.color}40`,
      borderRadius: 12, padding: '12px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${info.color}20`,
      animation: 'fadeUp 0.25s ease',
      maxWidth: 300,
    }}>
      <span style={{
        display: 'inline-block',
        animation: info.spin ? 'spin 0.8s linear infinite' : 'none',
        color: info.color, fontSize: 14,
      }}>
        {info.spin ? '○' : status === 'success' ? '●' : '◉'}
      </span>
      <div>
        <div style={{ fontSize: 13, color: info.color, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          {info.text}
        </div>
        {error && (
          <div style={{ fontSize: 11, color: 'var(--arc-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
            {error.slice(0, 60)}
          </div>
        )}
      </div>
    </div>
  )
}
