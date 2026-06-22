import { useEffect, useRef, useState } from 'react'

export default function TextChat({ messages, onSend, myUid, open, onToggle }) {
  const [text, setText] = useState('')
  const endRef = useRef()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const submit = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <div style={{ ...styles.panel, transform: open ? 'translateX(0)' : 'translateX(calc(100% + 20px))' }}>
      <div style={styles.header}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 22 }}>Susurros</span>
        <button onClick={onToggle} style={styles.close} aria-label="Cerrar chat">
          ✕
        </button>
      </div>

      <div style={styles.list}>
        {messages.length === 0 && (
          <p style={styles.empty}>Escríbele algo lindo. Solo ustedes dos verán esto.</p>
        )}
        {messages.map((m) => {
          const mine = m.uid === myUid
          return (
            <div key={m.id} style={{ ...styles.bubbleRow, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{ ...styles.bubble, ...(mine ? styles.mine : styles.theirs) }}>
                {!mine && <div style={styles.who}>{m.name}</div>}
                {m.text}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={text}
          placeholder="Escribe…"
          maxLength={500}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button onClick={submit} style={styles.send} aria-label="Enviar">
          ➤
        </button>
      </div>
    </div>
  )
}

const styles = {
  panel: {
    position: 'fixed',
    right: 16,
    bottom: 96,
    top: 76,
    width: 'min(340px, calc(100vw - 32px))',
    background: 'var(--vidrio)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid var(--vidrio-borde)',
    borderRadius: 22,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform .35s cubic-bezier(.2,.8,.2,1)',
    boxShadow: 'var(--sombra)',
    zIndex: 20,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid var(--vidrio-borde)',
  },
  close: { fontSize: 16, opacity: 0.7, width: 30, height: 30 },
  list: { flex: 1, overflowY: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  empty: { opacity: 0.55, fontSize: 14, textAlign: 'center', margin: 'auto', lineHeight: 1.5 },
  bubbleRow: { display: 'flex' },
  bubble: { maxWidth: '78%', padding: '9px 13px', borderRadius: 16, fontSize: 15, lineHeight: 1.4, wordBreak: 'break-word' },
  mine: { background: 'linear-gradient(120deg, var(--ambar), var(--dorado))', color: 'var(--noche)', borderBottomRightRadius: 4 },
  theirs: { background: 'rgba(255,255,255,0.08)', color: 'var(--crema)', borderBottomLeftRadius: 4 },
  who: { fontSize: 11, opacity: 0.6, marginBottom: 2 },
  inputRow: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--vidrio-borde)' },
  input: {
    flex: 1,
    padding: '11px 14px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--vidrio-borde)',
    color: 'var(--crema)',
    fontSize: 15,
  },
  send: {
    width: 44,
    borderRadius: 12,
    background: 'var(--ambar)',
    color: 'var(--noche)',
    fontSize: 16,
  },
}
