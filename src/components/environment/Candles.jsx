import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Candle({ position }) {
  const flame = useRef()
  const light = useRef()
  const seed = useRef(Math.random() * 10)

  useFrame((state) => {
    const t = state.clock.elapsedTime + seed.current
    const flicker = 0.85 + Math.sin(t * 12) * 0.08 + Math.sin(t * 27) * 0.05
    if (light.current) light.current.intensity = 1.4 * flicker
    if (flame.current) {
      flame.current.scale.y = 1 + Math.sin(t * 14) * 0.12
      flame.current.scale.x = 0.9 + Math.sin(t * 9) * 0.06
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.36, 12]} />
        <meshStandardMaterial color="#fdeccb" roughness={0.6} />
      </mesh>
      <mesh ref={flame} position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffd27a" />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 0.5, 0]}
        color="#ffb060"
        intensity={1.4}
        distance={4.5}
        decay={2}
      />
    </group>
  )
}

export default function Candles() {
  const spots = [
    [-1.6, 0, 1.3],
    [1.7, 0, 1.1],
    [-2.4, 0, -0.4],
    [2.5, 0, -0.2],
    [0, 0, 2.0],
  ]
  return (
    <group>
      {spots.map((p, i) => (
        <Candle key={i} position={p} />
      ))}
    </group>
  )
}
