import { useEffect, useRef, useState, useCallback } from 'react'
import {
  db,
  doc,
  collection,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
} from '../firebase'

const ICE_SERVERS = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ],
}

/**
 * Voz peer-to-peer entre dos personas usando WebRTC.
 * La señalización (oferta/respuesta/candidatos ICE) viaja por Firestore.
 * El "host" crea la oferta; el "guest" responde.
 */
export function useWebRTC({ roomId, role, enabled }) {
  const [connected, setConnected] = useState(false)
  const [micError, setMicError] = useState(null)
  const [muted, setMuted] = useState(false)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const cleanupRef = useRef([])

  const teardown = useCallback(() => {
    cleanupRef.current.forEach((fn) => fn())
    cleanupRef.current = []
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    setConnected(false)
  }, [])

  useEffect(() => {
    if (!enabled || !roomId || !role) return
    let active = true

    async function connect() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: false,
        })
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        localStreamRef.current = stream

        const pc = new RTCPeerConnection(ICE_SERVERS)
        pcRef.current = pc
        stream.getTracks().forEach((t) => pc.addTrack(t, stream))

        // Audio remoto
        const remoteStream = new MediaStream()
        pc.ontrack = (e) => {
          e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t))
          if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream
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
        if (active) setMicError(e.message)
      }
    }

    connect()
    return () => {
      active = false
      teardown()
    }
  }, [enabled, roomId, role, teardown])

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current
    if (!stream) return
    const next = !muted
    stream.getAudioTracks().forEach((t) => (t.enabled = !next))
    setMuted(next)
  }, [muted])

  return { connected, micError, muted, toggleMute, remoteAudioRef }
}
