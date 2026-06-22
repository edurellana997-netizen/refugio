import { useState } from 'react'
import AvatarPicker from './AvatarPicker'

export default function Lobby({ mode, onEnter, configError }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState({
    bodyColor: '#ff9aa8',
    glowColor: '#ffd27a',
    shape: 'redondo',
    accessory: 'ninguno',
  })

  const canEnter = name.trim().length > 0 && !configError

  return (
    <div style={styles.wrap}>
      <div style={styles.aura} />
      <div style={styles.card}>
        <p style={styles.eyebrow}>{mode === 'join' ? 'Te invitaron a un' : 'Crea un'}</p>
        <h1 style={styles.title}>Refugio</h1>
        <p style={styles.sub}>
          Un lugar privado para dos, bajo las estrellas. El cielo se enciende cuando se acercan.
        </p>

        {configError ? (
          <div style={styles.warn}>
            <strong>Falta configurar Firebase.</strong>
            <br />
            Copia <code>.env.example</code> a <code>.env</code> y agrega tus claves para activar la
            voz y la sincronización entre dos personas.
          </div>
        ) : (
          <>
            <label style={styles.label} htmlFor="nombre">
              Tu nombre
            </label>
            <input
              id="nombre"
              style={styles.input}
              placeholder="¿Cómo te llamas?"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canEnter && onEnter({ name: name.trim(), avatar })}
            />

            <div style={{ margin: '22px 0 26px' }}>
              <AvatarPicker avatar={avatar} onChange={setAvatar} />
            </div>

            <button
              style={{ ...styles.cta, opacity: canEnter ? 1 : 0.5 }}
              disabled={!canEnter}
              onClick={() => onEnter({ name: name.trim(), avatar })}
            >
              {mode === 'join' ? 'Unirme al refugio' : 'Crear el refugio'}
            </button>
            <p style={styles.privacy}>
              Privado entre ustedes dos. La voz va directo de un dispositivo al otro.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    padding: 20,
    overflow: 'auto',
  },
  aura: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,154,168,0.18), transparent 60%)',
    filter: 'blur(40px)',
    top: '-10%',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: 'min(560px, 100%)',
    background: 'var(--vidrio)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid var(--vidrio-borde)',
    borderRadius: 28,
    padding: '34px 30px',
    boxShadow: 'var(--sombra)',
  },
  eyebrow: { fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7 },
  title: {
    fontFamily: 'var(--display)',
    fontSize: 'clamp(48px, 10vw, 76px)',
    fontWeight: 500,
    lineHeight: 1,
    margin: '4px 0 10px',
    background: 'linear-gradient(120deg, #fff4e6, #ffd27a 60%, #ff9aa8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  sub: { fontSize: 16, opacity: 0.85, lineHeight: 1.5, marginBottom: 24, maxWidth: 420 },
  label: { display: 'block', fontSize: 13, letterSpacing: 1, opacity: 0.7, marginBottom: 8 },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 16,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--vidrio-borde)',
    color: 'var(--crema)',
  },
  cta: {
    width: '100%',
    padding: '16px',
    fontSize: 17,
    fontWeight: 600,
    borderRadius: 16,
    color: 'var(--noche)',
    background: 'linear-gradient(120deg, var(--dorado), var(--ambar))',
    boxShadow: '0 12px 30px rgba(255,184,119,0.3)',
    transition: 'transform .15s',
  },
  privacy: { fontSize: 13, opacity: 0.6, textAlign: 'center', marginTop: 14 },
  warn: {
    background: 'rgba(255,154,168,0.12)',
    border: '1px solid var(--rosa)',
    borderRadius: 14,
    padding: 16,
    fontSize: 14,
    lineHeight: 1.5,
  },
}
