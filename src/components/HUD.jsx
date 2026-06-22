import { useState } from 'react'

const ACTIONS = [
  { type: 'idle', label: 'Separarse', glyph: '🌙' },
  { type: 'holdHands', label: 'Tomarse de las manos', glyph: '🤝' },
  { type: 'hug', label: 'Abrazarse', glyph: '🫂' },
  { type: 'sit', label: 'Sentarse juntos', glyph: '🛋️' },
  { type: 'gaze', label: 'Contemplar el cielo', glyph: '✨' },
]

function Round({ active, onClick, title, children, accent }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: 20,
        background: active ? accent || 'var(--ambar)' : 'var(--vidrio)',
        color: active ? 'var(--noche)' : 'var(--crema)',
        border: '1px solid var(--vidrio-borde)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'transform .15s, background .2s',
        boxShadow: active ? '0 8px 24px rgba(255,184,119,0.35)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

export default function HUD({
  interaction,
  onAction,
  partnerPresent,
  partnerName,
  inviteUrl,
  liveOn,
  onToggleLive,
  liveConnected,
  micMuted,
  onToggleMic,
  camOn,
  onToggleCam,
  musicOn,
  onToggleMusic,
  onToggleChat,
  chatOpen,
  unread,
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Refugio',
          text: 'Te espero en nuestro refugio bajo las estrellas 💫',
          url: inviteUrl,
        })
      } catch {}
    } else copy()
  }

  return (
    <>
      {/* Presencia */}
      <div style={styles.presence}>
        <span style={{ ...styles.dot, background: partnerPresent ? '#7ce0a0' : '#ffb877' }} />
        {partnerPresent ? `${partnerName || 'Tu persona'} está aquí` : 'Esperando a tu persona…'}
      </div>

      {/* Invitación cuando estás solo/a */}
      {!partnerPresent && (
        <div style={styles.invite}>
          <p style={styles.inviteTitle}>Aún estás aquí en soledad</p>
          <p style={styles.inviteSub}>Comparte este enlace para que se reúnan:</p>
          <div style={styles.linkRow}>
            <input readOnly value={inviteUrl} style={styles.linkInput} onFocus={(e) => e.target.select()} />
            <button onClick={copy} style={styles.copyBtn}>
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
          <button onClick={share} style={styles.shareBtn}>
            Compartir enlace
          </button>
        </div>
      )}

      {/* Barra de acciones íntimas */}
      <div style={styles.dock}>
        {ACTIONS.map((a) => (
          <button
            key={a.type}
            onClick={() => onAction(a.type)}
            title={a.label}
            aria-label={a.label}
            aria-pressed={interaction?.type === a.type}
            style={{
              ...styles.action,
              background:
                interaction?.type === a.type
                  ? 'linear-gradient(120deg, var(--ambar), var(--dorado))'
                  : 'var(--vidrio)',
              color: interaction?.type === a.type ? 'var(--noche)' : 'var(--crema)',
            }}
          >
            <span style={{ fontSize: 22 }}>{a.glyph}</span>
            <span style={styles.actionLabel}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Cluster de utilidades */}
      <div style={styles.utils}>
        <Round
          active={liveOn}
          onClick={onToggleLive}
          title={liveOn ? 'Terminar en vivo' : 'Conectar en vivo (voz y video)'}
          accent="#7ce0a0"
        >
          {liveOn ? (liveConnected ? '📹' : '…') : '📹'}
        </Round>
        {liveOn && (
          <Round
            active={!camOn}
            onClick={onToggleCam}
            title={camOn ? 'Apagar cámara' : 'Encender cámara'}
            accent="#b794ff"
          >
            {camOn ? '📷' : '🚫'}
          </Round>
        )}
        {liveOn && (
          <Round
            active={micMuted}
            onClick={onToggleMic}
            title={micMuted ? 'Reactivar micrófono' : 'Silenciar micrófono'}
            accent="#ff9aa8"
          >
            {micMuted ? '🔇' : '🔈'}
          </Round>
        )}
        <Round active={musicOn} onClick={onToggleMusic} title={musicOn ? 'Pausar música' : 'Música ambiental'}>
          {musicOn ? '🎵' : '🎶'}
        </Round>
        <div style={{ position: 'relative' }}>
          <Round active={chatOpen} onClick={onToggleChat} title="Chat">
            💬
          </Round>
          {unread > 0 && !chatOpen && <span style={styles.badge}>{unread}</span>}
        </div>
      </div>
    </>
  )
}

const styles = {
  presence: {
    position: 'fixed',
    top: 16,
    left: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 999,
    background: 'var(--vidrio)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--vidrio-borde)',
    fontSize: 14,
    zIndex: 15,
  },
  dot: { width: 9, height: 9, borderRadius: '50%' },
  invite: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(420px, calc(100vw - 32px))',
    background: 'var(--vidrio)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid var(--vidrio-borde)',
    borderRadius: 24,
    padding: 24,
    textAlign: 'center',
    boxShadow: 'var(--sombra)',
    zIndex: 16,
  },
  inviteTitle: { fontFamily: 'var(--display)', fontSize: 26, marginBottom: 4 },
  inviteSub: { fontSize: 14, opacity: 0.75, marginBottom: 14 },
  linkRow: { display: 'flex', gap: 8, marginBottom: 10 },
  linkInput: {
    flex: 1,
    padding: '11px 12px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--vidrio-borde)',
    color: 'var(--crema)',
    fontSize: 13,
  },
  copyBtn: { padding: '0 16px', borderRadius: 12, background: 'var(--ambar)', color: 'var(--noche)', fontWeight: 600 },
  shareBtn: {
    width: '100%',
    padding: 13,
    borderRadius: 14,
    background: 'linear-gradient(120deg, var(--dorado), var(--ambar))',
    color: 'var(--noche)',
    fontWeight: 600,
    fontSize: 15,
  },
  dock: {
    position: 'fixed',
    bottom: 18,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 8,
    padding: 8,
    borderRadius: 22,
    background: 'var(--vidrio)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid var(--vidrio-borde)',
    boxShadow: 'var(--sombra)',
    zIndex: 15,
    maxWidth: 'calc(100vw - 24px)',
    overflowX: 'auto',
  },
  action: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '8px 10px',
    minWidth: 64,
    borderRadius: 16,
    border: '1px solid var(--vidrio-borde)',
    transition: 'all .2s',
    flexShrink: 0,
  },
  actionLabel: { fontSize: 10.5, lineHeight: 1.1, textAlign: 'center', maxWidth: 70 },
  utils: {
    position: 'fixed',
    bottom: 18,
    right: 16,
    display: 'flex',
    gap: 8,
    zIndex: 15,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: 9,
    background: 'var(--rosa)',
    color: 'var(--noche)',
    fontSize: 11,
    fontWeight: 700,
    display: 'grid',
    placeItems: 'center',
  },
}
