import { useEffect, useRef, useState, useCallback } from 'react'
import { db, doc, collection, updateDoc, onSnapshot, addDoc } from '../firebase'

const ICE_SERVERS = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ],
}

/**
 * Conexión en vivo (voz + video) peer-to-peer con WebRTC.
 * Se pide audio+video desde el inicio para evitar renegociaciones (más estable,
 * sobre todo en iPhone). Apagar cámara o micrófono solo desactiva la pista,
 * no rehace la conexión. La señalización viaja por Firestore.
 */
export function useWebRTC({ roomId, role, enabled }) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [micMuted, setMicMuted] = useState(false)
  const [camOn, setCamOn] = useState(true)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const pcRef = useRef(null)
  const localRef = useRef(null)
  const cleanupRef = useRef([])

  const teardown = useCallback(() => {
    cleanupRef.current.forEach((fn) => fn())
    cleanupRef.current = []
    localRef.current?.getTracks().forEach((t) => t.stop())
    localRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    setConnected(false)
    setLocalStream(null)
    setRemoteStream(null)
  }, [])

  useEffect(() => {
    if (!enabled || !roomId || !role) return
    let active = true

    async function connect() {
      try {
        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          })
        } catch {
          // Si no hay cámara o la deniegan, seguimos solo con voz.
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          if (active) setCamOn(false)
        }
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        localRef.current = stream
        setLocalStream(stream)
        if (active) setCamOn(stream.getVideoTracks().length > 0)

        const pc = new RTCPeerConnection(ICE_SERVERS)
        pcRef.current = pc
        stream.getTracks().forEach((t) => pc.addTrack(t, stream))

        pc.ontrack = (e) => {
          if (e.streams && e.streams[0]) setRemoteStream(e.streams[0])
        }
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') setConnected(true)
          if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) setConnected(false)
        }

        const roomRef = doc(db, 'rooms', roomId)
        const callerC = collection(roomRef, 'callerCandidates')
        const calleeC = collection(roomRef, 'calleeCandidates')

        if (role === 'host') {
          pc.onicecandidate = (e) => {
            if (e.candidate) addDoc(callerC, e.candidate.toJSON())
          }
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          await updateDoc(roomRef, { offer: { type: offer.type, sdp: offer.sdp } })

          const unsubAns = onSnapshot(roomRef, (snap) => {
            const data = snap.data()
            if (data?.answer && !pc.currentRemoteDescription) {
              pc.setRemoteDescription(new RTCSessionDescription(data.answer))
            }
          })
          const unsubCand = onSnapshot(calleeC, (snap) => {
            snap.docChanges().forEach((c) => {
              if (c.type === 'added') pc.addIceCandidate(new RTCIceCandidate(c.doc.data()))
            })
          })
          cleanupRef.current.push(unsubAns, unsubCand)
        } else {
          pc.onicecandidate = (e) => {
            if (e.candidate) addDoc(calleeC, e.candidate.toJSON())
          }
          const unsubOffer = onSnapshot(roomRef, async (snap) => {
            const data = snap.data()
            if (data?.offer && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
              const answer = await pc.createAnswer()
              await pc.setLocalDescription(answer)
              await updateDoc(roomRef, { answer: { type: answer.type, sdp: answer.sdp } })
            }
          })
          const unsubCand = onSnapshot(callerC, (snap) => {
            snap.docChanges().forEach((c) => {
              if (c.type === 'added') pc.addIceCandidate(new RTCIceCandidate(c.doc.data()))
            })
          })
          cleanupRef.current.push(unsubOffer, unsubCand)
        }
      } catch (e) {
        if (active) setError(e.message)
      }
    }

    connect()
    return () => {
      active = false
      teardown()
    }
  }, [enabled, roomId, role, teardown])

  const toggleMic = useCallback(() => {
    const stream = localRef.current
    if (!stream) return
    const next = !micMuted
    stream.getAudioTracks().forEach((t) => (t.enabled = !next))
    setMicMuted(next)
  }, [micMuted])

  const toggleCam = useCallback(() => {
    const stream = localRef.current
    if (!stream) return
    const tracks = stream.getVideoTracks()
    if (tracks.length === 0) return
    const next = !camOn
    tracks.forEach((t) => (t.enabled = next))
    setCamOn(next)
  }, [camOn])

  return {
    connected,
    error,
    micMuted,
    toggleMic,
    camOn,
    toggleCam,
    localStream,
    remoteStream,
  }
}
