import { useEffect, useState, useCallback } from 'react'
import {
  db,
  doc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from '../firebase'

/** Chat de texto en tiempo real (subcolección de la sala). */
export function useChat({ roomId, uid, name }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!roomId) return
    const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [roomId])

  const send = useCallback(
    (text) => {
      const t = text.trim()
      if (!t || !roomId) return
      addDoc(collection(db, 'rooms', roomId, 'messages'), {
        uid,
        name,
        text: t.slice(0, 500),
        createdAt: serverTimestamp(),
      }).catch(() => {})
    },
    [roomId, uid, name],
  )

  return { messages, send }
}
