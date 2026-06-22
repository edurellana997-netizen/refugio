import { useEffect, useMemo, useState } from 'react'
import Lobby from './components/Lobby'
import Room from './components/Room'
import { ensureAuth, isFirebaseConfigured } from './firebase'
import { makeRoomId } from './hooks/useRoom'

export default function App() {
  // Lee ?room= de la URL para distinguir crear vs. unirse.
  const initialRoom = useMemo(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('room')
  }, [])

  const [roomId, setRoomId] = useState(initialRoom)
  const [uid, setUid] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stage, setStage] = useState('lobby') // 'lobby' | 'room'
  const [authError, setAuthError] = useState(false)

  const mode = initialRoom ? 'join' : 'create'

  const enter = async ({ name, avatar }) => {
    let id = roomId
    if (!id) {
      id = makeRoomId()
      setRoomId(id)
      // refleja la sala en la URL sin recargar
      const url = new URL(window.location.href)
      url.searchParams.set('room', id)
      window.history.replaceState({}, '', url)
    }
    try {
      const u = await ensureAuth()
      setUid(u)
      setProfile({ name, avatar })
      setStage('room')
    } catch {
      setAuthError(true)
    }
  }

  const leave = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('room')
    window.location.href = url.origin
  }

  const inviteUrl = useMemo(() => {
    if (!roomId) return ''
    const url = new URL(window.location.origin)
    url.searchParams.set('room', roomId)
    return url.toString()
  }, [roomId])

  // Pantalla completa estable en móvil
  useEffect(() => {
    const setVh = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
    setVh()
    window.addEventListener('resize', setVh)
    return () => window.removeEventListener('resize', setVh)
  }, [])

  if (stage === 'room' && uid && profile && roomId) {
    return <Room roomId={roomId} uid={uid} profile={profile} inviteUrl={inviteUrl} onLeave={leave} />
  }

  return <Lobby mode={mode} onEnter={enter} configError={!isFirebaseConfigured || authError} />
}
