export function Background() {
  return (
    <>
      {/* Deep background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: -2,
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,141,238,0.08) 0%, transparent 60%), #07070f',
        pointerEvents: 'none',
      }} />

      {/* Grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
        pointerEvents: 'none',
      }} />

      {/* Soft orbs */}
      <div style={{
        position: 'fixed', top: '-10%', left: '60%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(91,141,238,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: -1,
      }} />
      <div style={{
        position: 'fixed', top: '40%', left: '-10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(232,91,122,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: -1,
      }} />
    </>
  )
}
