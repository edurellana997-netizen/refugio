import { useEffect, useRef, useState, useCallback } from 'react'
import {
  db,
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from '../firebase'

// Genera un id de sala corto y legible.
export function makeRoomId() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let id = ''
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

/**
 * Gestiona una sala privada para dos personas:
 *  - el primero en entrar es "host" (oferente de WebRTC), el segundo es "guest".
 *  - sincroniza el perfil/avatar de cada quien y el estado de interacción compartido.
 */
export function useRoom({ roomId, uid, profile }) {
  const [role, setRole] = useState(null) // 'host' | 'guest'
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [participants, setParticipants] = useState({}) // { uid: {name, avatar, presence} }
  const [interaction, setInteraction] = useState({ type: 'idle', by: null })
  const [roomFull, setRoomFull] = useState(false)
  const profileRef = useRef(profile)
  profileRef.current = profile

  // Entrar a la sala
  useEffect(() => {
    if (!roomId || !uid || !profile) return
    let active = true

    async function join() {
      try {
        const roomRef = doc(db, 'rooms', roomId)
        const snap = await getDoc(roomRef)

        let myRole
        if (!snap.exists()) {
          await setDoc(roomRef, {
            createdAt: serverTimestamp(),
            hostUid: uid,
            guestUid: null,
            interaction: { type: 'idle', by: null },
          })
          myRole = 'host'
        } else {
          const data = snap.data()
          if (data.hostUid === uid) {
            myRole = 'host'
          } else if (data.guestUid === uid) {
            myRole = 'guest'
          } else if (!data.guestUid) {
            await updateDoc(roomRef, { guestUid: uid })
            myRole = 'guest'
          } else {
            if (active) setRoomFull(true)
            return
          }
        }
        if (!active) return
        setRole(myRole)

        // Escribir mi perfil
        await setDoc(doc(db, 'rooms', roomId, 'participants', uid), {
          name: profileRef.current.name,
          avatar: profileRef.current.avatar,
          presence: 'online',
          lastSeen: serverTimestamp(),
        })
        if (active) setReady(true)
      } catch (e) {
        if (active) setError(e.message)
      }
    }
    join()
    return () => {
      active = false
    }
  }, [roomId, uid, profile])

  // Escuchar participantes
  useEffect(() => {
    if (!roomId || !ready) return
    const unsub = onSnapshot(collection(db, 'rooms', roomId, 'participants'), (snap) => {
      const next = {}
      snap.forEach((d) => (next[d.id] = d.data()))
      setParticipants(next)
    })
    return unsub
  }, [roomId, ready])

  // Escuchar estado de interacción compartido
  useEffect(() => {
    if (!roomId || !ready) return
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      const data = snap.data()
      if (data?.interaction) setInteraction(data.interaction)
    })
    return unsub
  }, [roomId, ready])

  // Latido de presencia
  useEffect(() => {
    if (!roomId || !uid || !ready) return
    const beat = setInterval(() => {
      updateDoc(doc(db, 'rooms', roomId, 'participants', uid), {
        lastSeen: serverTimestamp(),
        presence: 'online',
      }).catch(() => {})
    }, 15000)
    const bye = () => {
      updateDoc(doc(db, 'rooms', roomId, 'participants', uid), { presence: 'away' }).catch(() => {})
    }
    window.addEventListener('beforeunload', bye)
    return () => {
      clearInterval(beat)
      window.removeEventListener('beforeunload', bye)
      bye()
    }
  }, [roomId, uid, ready])

  const setSharedInteraction = useCallback(
    (type) => {
      if (!roomId) return
      updateDoc(doc(db, 'rooms', roomId), {
        interaction: { type, by: uid },
      }).catch(() => {})
    },
    [roomId, uid],
  )

  const updateAvatar = useCallback(
    (avatar) => {
      if (!roomId || !uid) return
      updateDoc(doc(db, 'rooms', roomId, 'participants', uid), { avatar }).catch(() => {})
    },
    [roomId, uid],
  )

  const partnerUid = Object.keys(participants).find((id) => id !== uid) || null
  const partner = partnerUid ? participants[partnerUid] : null
  const me = uid ? participants[uid] : null

  return {
    role,
    ready,
    error,
    roomFull,
    participants,
    me,
    partner,
    partnerUid,
    interaction,
    setSharedInteraction,
    updateAvatar,
  }
}
