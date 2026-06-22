import { useEffect, useRef } from 'react'

function Tile({ stream, muted, mirror, label, variant }) {
  const ref = useRef()
  useEffect(() => {
    const el = ref.current
    if (el && stream) {
      el.srcObject = stream
      el.play?.().catch(() => {})
    }
  }, [stream])

  return (
    <div style={{ ...styles.tile, ...(variant === 'pip' ? styles.pip : styles.main) }}>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: mirror ? 'scaleX(-1)' : 'none',
          display: 'block',
        }}
      />
      <span style={styles.label}>{label}</span>
    </div>
  )
}

export default function LiveVideo({ localStream, remoteStream, myName, partnerName }) {
  return (
    <>
      {remoteStream && (
        <Tile stream={remoteStream} muted={false} mirror={false} label={partnerName || 'Tu persona'} variant="main" />
      )}
      {localStream && (
        <Tile stream={localStream} muted mirror label={myName || 'Tú'} variant="pip" />
      )}
    </>
  )
}

const styles = {
  tile: {
    position: 'fixed',
    overflow: 'hidden',
    background: 'rgba(0,0,0,0.4)',
    border: '2px solid var(--vidrio-borde)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,184,119,0.15)',
    zIndex: 14,
  },
  main: {
    top: 70,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(340px, 70vw)',
    aspectRatio: '4 / 3',
    borderRadius: 22,
  },
  pip: {
    bottom: 90,
    left: 16,
    width: 'min(150px, 34vw)',
    aspectRatio: '4 / 3',
    borderRadius: 16,
    borderColor: 'var(--dorado)',
  },
  label: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    padding: '2px 9px',
    borderRadius: 999,
    fontSize: 12,
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(6px)',
    color: 'var(--crema)',
  },
}
