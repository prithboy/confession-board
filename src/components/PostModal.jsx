import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const MAX = 280

export function PostModal({ onClose, onPost, txStatus, txError, isConnected, isWrongNetwork, onSwitchNetwork }) {
  const [text, setText] = useState('')
  const [step, setStep] = useState('write')

  const isPosting = txStatus === 'posting'

  const handleSubmit = async () => {
    if (step === 'write') { setStep('confirm'); return }
    if (step === 'confirm') {
      try {
        await onPost(text)
        setStep('done')
      } catch {}
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--arc-surface)',
          border: '1px solid var(--arc-border-hi)',
          borderRadius: 20, padding: '32px',
          width: '100%', maxWidth: 480,
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          position: 'relative',
          animation: 'fadeUp 0.25s ease',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: 'var(--arc-muted)', fontSize: 16,
            width: 30, height: 30, borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* Not connected */}
        {!isConnected && !isWrongNetwork && (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: 'var(--arc-text)', marginBottom: 4 }}>
              Confess something
            </h2>
            <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--arc-muted)', marginBottom: 24 }}>
              Connect your wallet to post
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ConnectButton />
            </div>
          </>
        )}

        {/* Wrong network */}
        {isWrongNetwork && (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: 'var(--arc-text)', marginBottom: 4 }}>
              Wrong Network
            </h2>
            <p style={{ fontSize: 13, color: 'var(--arc-muted)', marginBottom: 24, lineHeight: 1.6 }}>
              Please switch to Arc Testnet to post confessions.
            </p>
            <button
              onClick={onSwitchNetwork}
              style={{
                width: '100%', background: 'var(--arc-blue)', border: 'none',
                borderRadius: 10, padding: '12px',
                color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Switch to Arc Testnet
            </button>
          </>
        )}

        {/* Write step */}
        {isConnected && !isWrongNetwork && step === 'write' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: 'var(--arc-text)', marginBottom: 4 }}>
              Confess something
            </h2>
            <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--arc-muted)', marginBottom: 20, letterSpacing: '0.04em' }}>
              anonymous · permanent · $0.10 USDC
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX))}
              placeholder="I once pushed to main on a Friday and blamed the intern…"
              autoFocus
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--arc-border)',
                borderRadius: 12, padding: '14px 16px',
                color: 'rgba(255,255,255,0.85)', fontSize: 15,
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                lineHeight: 1.65, resize: 'none', height: 140,
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(91,141,238,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--arc-border)'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: text.length > MAX * 0.85 ? 'var(--arc-red)' : 'var(--arc-muted)' }}>
                {text.length}/{MAX}
              </span>
              <button
                onClick={handleSubmit}
                disabled={text.trim().length < 5}
                style={{
                  background: text.trim().length >= 5 ? 'var(--arc-blue)' : 'rgba(255,255,255,0.06)',
                  border: 'none', borderRadius: 10, padding: '9px 22px',
                  color: text.trim().length >= 5 ? '#fff' : 'var(--arc-muted)',
                  fontSize: 13, fontWeight: 500, cursor: text.trim().length >= 5 ? 'pointer' : 'default',
                }}
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {/* Confirm step */}
        {isConnected && !isWrongNetwork && step === 'confirm' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, fontWeight: 400, color: 'var(--arc-text)', marginBottom: 20 }}>
              Confirm your confession
            </h2>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--arc-border)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)' }}>
                "{text}"
              </p>
            </div>
            <div style={{ background: 'var(--arc-blue-dim)', border: '1px solid rgba(91,141,238,0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {[['Post fee', '$0.10 USDC'], ['Goes to weekly pool', '✓'], ['Author address stored', '✓ (anonymous)'], ['Reversible?', 'No — permanent']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--arc-muted)' }}>{k}</span>
                  <span style={{ color: k === 'Post fee' ? 'var(--arc-blue)' : 'rgba(255,255,255,0.4)' }}>{v}</span>
                </div>
              ))}
            </div>
            {txError && (
              <div style={{ background: 'var(--arc-red-dim)', border: '1px solid rgba(232,91,122,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--arc-red)' }}>
                {txError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('write')} disabled={isPosting} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--arc-border)', borderRadius: 10, padding: '10px', color: 'var(--arc-muted)', fontSize: 13, cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={isPosting} style={{ flex: 2, background: 'var(--arc-blue)', border: 'none', borderRadius: 10, padding: '10px', color: '#fff', fontSize: 13, fontWeight: 500, opacity: isPosting ? 0.7 : 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isPosting ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>○</span> Posting...</> : 'Approve & Post'}
              </button>
            </div>
          </>
        )}

        {/* Done step */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🕯️</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: 'var(--arc-text)', marginBottom: 8 }}>
              Confession recorded
            </h2>
            <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--arc-muted)', marginBottom: 28 }}>
              permanent · anonymous · on Arc
            </p>
            <button onClick={onClose} style={{ background: 'var(--arc-blue)', border: 'none', borderRadius: 10, padding: '10px 28px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
