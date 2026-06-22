import { useEffect, useRef, useState } from 'react'
import Scene from './Scene'
import HUD from './HUD'
import TextChat from './TextChat'
import LiveVideo from './LiveVideo'
import { useRoom } from '../hooks/useRoom'
import { useWebRTC } from '../hooks/useWebRTC'
import { useChat } from '../hooks/useChat'
import { startAmbient, stopAmbient } from '../lib/ambient'

export default function Room({ roomId, uid, profile, inviteUrl, onLeave }) {
  const {
    role,
    ready,
    error,
    roomFull,
    partner,
    partnerUid,
    me,
    interaction,
    setSharedInteraction,
  } = useRoom({ roomId, uid, profile })

  const [liveOn, setLiveOn] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const {
    connected,
    micMuted,
    toggleMic,
    camOn,
    toggleCam,
    localStream,
    remoteStream,
    error: liveError,
  } = useWebRTC({ roomId, role, enabled: liveOn })

  const { messages, send } = useChat({ roomId, uid, name: profile.name })

  const toggleMusic = () => {
    if (!musicOn) {
      startAmbient(-15)
      setMusicOn(true)
    } else {
      stopAmbient()
      setMusicOn(false)
    }
  }
  useEffect(() => () => stopAmbient(), [])

  const lastCount = useRef(0)
  useEffect(() => {
    if (chatOpen) {
      setUnread(0)
      lastCount.current = messages.length
      return
    }
    const diff = messages.length - lastCount.current
    if (diff > 0) {
      const newOnes = messages.slice(-diff).filter((m) => m.uid !== uid).length
      if (newOnes > 0) setUnread((u) => u + newOnes)
    }
    lastCount.current = messages.length
  }, [messages, chatOpen, uid])

  const mySide = role === 'guest' ? 'right' : 'left'
  const meAvatar = me?.avatar || profile.avatar
  const partnerAvatar = partner?.avatar
  const partnerPresent = Boolean(partnerUid)

  if (roomFull) {
    return (
      <Centered>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 34 }}>Este refugio ya está completo</h2>
        <p style={{ opacity: 0.8, marginTop: 8 }}>Es un espacio solo para dos personas.</p>
        <button style={leaveBtn} onClick={onLeave}>Crear el mío</button>
      </Centered>
    )
  }

  if (error) {
    return (
      <Centered>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 30 }}>Algo se interpuso</h2>
        <p style={{ opacity: 0.8, marginTop: 8, maxWidth: 360 }}>{error}</p>
        <button style={leaveBtn} onClick={onLeave}>Volver</button>
      </Centered>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Scene
        meAvatar={meAvatar}
        partnerAvatar={partnerAvatar}
        mySide={mySide}
        interaction={interaction}
      />

      {liveOn && (
        <LiveVideo
          localStream={localStream}
          remoteStream={remoteStream}
          myName={profile.name}
          partnerName={partner?.name}
        />
      )}

      {ready && (
        <HUD
          interaction={interaction}
          onAction={setSharedInteraction}
          partnerPresent={partnerPresent}
          partnerName={partner?.name}
          inviteUrl={inviteUrl}
          liveOn={liveOn}
          onToggleLive={() => setLiveOn((v) => !v)}
          liveConnected={connected}
          micMuted={micMuted}
          onToggleMic={toggleMic}
          camOn={camOn}
          onToggleCam={toggleCam}
          musicOn={musicOn}
          onToggleMusic={toggleMusic}
          onToggleChat={() => setChatOpen((c) => !c)}
          chatOpen={chatOpen}
          unread={unread}
        />
      )}

      <TextChat
        messages={messages}
        onSend={send}
        myUid={uid}
        open={chatOpen}
        onToggle={() => setChatOpen(false)}
      />

      {liveError && <div style={micErr}>No pude acceder a la cámara/micrófono: {liveError}</div>}
    </div>
  )
}

function Centered({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>{children}</div>
    </div>
  )
}

const leaveBtn = {
  marginTop: 20,
  padding: '13px 26px',
  borderRadius: 14,
  background: 'linear-gradient(120deg, var(--dorado), var(--ambar))',
  color: 'var(--noche)',
  fontWeight: 600,
  fontSize: 15,
}

const micErr = {
  position: 'fixed',
  top: 70,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255,154,168,0.15)',
  border: '1px solid var(--rosa)',
  padding: '10px 16px',
  borderRadius: 12,
  fontSize: 13,
  zIndex: 30,
}
