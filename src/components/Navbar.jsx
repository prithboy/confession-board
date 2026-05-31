import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Navbar({ onConfess }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--arc-border)',
      background: 'rgba(7,7,15,0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--arc-blue) 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>🕯️</div>
          <span style={{
            fontFamily: 'var(--font-sans)', fontWeight: 500,
            fontSize: 15, color: 'var(--arc-text)', letterSpacing: '-0.01em',
          }}>
            confession<span style={{ color: 'var(--arc-muted)' }}>.arc</span>
          </span>
        </div>

        {/* Center badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--arc-blue-dim)',
          border: '1px solid rgba(91,141,238,0.2)',
          borderRadius: 20, padding: '4px 12px',
          fontSize: 11, fontFamily: 'var(--font-mono)',
          color: 'var(--arc-blue)', letterSpacing: '0.06em',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--arc-blue)',
            animation: 'pulse 2s infinite',
            display: 'inline-block',
          }} />
          ARC TESTNET
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ConnectButton
            showBalance={false}
            chainStatus="none"
            accountStatus="avatar"
            label="Connect Wallet"
          />
          <button
            onClick={onConfess}
            style={{
              background: 'var(--arc-blue)', border: 'none', borderRadius: 10,
              padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 500,
              letterSpacing: '-0.01em', transition: 'opacity 0.15s',
              whiteSpace: 'nowrap', cursor: 'pointer',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            + Confess
          </button>
        </div>
      </div>
    </nav>
  )
}
