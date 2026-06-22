import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Pétalos que caen suavemente y se reciclan al llegar al piso.
function Petals({ count = 60 }) {
  const ref = useRef()
  const seeds = useMemo(
    () =>
      [...Array(count)].map(() => ({
        x: (Math.random() - 0.5) * 14,
        y: Math.random() * 8,
        z: (Math.random() - 0.5) * 10,
        speed: 0.2 + Math.random() * 0.4,
        sway: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI,
      })),
    [count],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    seeds.forEach((s, i) => {
      s.y -= s.speed * dt
      if (s.y < 0) {
        s.y = 8
        s.x = (Math.random() - 0.5) * 14
      }
      dummy.position.set(s.x + Math.sin(t * 0.5 + s.sway) * 0.6, s.y, s.z)
      dummy.rotation.set(s.rot + t * 0.5, s.sway + t * 0.3, 0)
      dummy.scale.setScalar(0.07)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <planeGeometry args={[1, 1.4]} />
      <meshStandardMaterial
        color="#ff9aa8"
        emissive="#ff7a90"
        emissiveIntensity={0.25}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  )
}

// Luciérnagas: puntos cálidos que parpadean y vagan.
function Fireflies({ count = 40 }) {
  const ref = useRef()
  const seeds = useMemo(
    () =>
      [...Array(count)].map(() => ({
        x: (Math.random() - 0.5) * 12,
        y: 0.5 + Math.random() * 3,
        z: (Math.random() - 0.5) * 8,
        phase: Math.random() * Math.PI * 2,
        rad: 0.5 + Math.random(),
      })),
    [count],
  )

  const positions = useMemo(() => new Float32Array(count * 3), [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    seeds.forEach((s, i) => {
      positions[i * 3] = s.x + Math.cos(t * 0.4 + s.phase) * s.rad
      positions[i * 3 + 1] = s.y + Math.sin(t * 0.6 + s.phase) * 0.4
      positions[i * 3 + 2] = s.z + Math.sin(t * 0.3 + s.phase) * s.rad
    })
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.material.opacity = 0.6 + Math.sin(t * 3) * 0.25
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#ffe6a0"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

export default function Particles() {
  return (
    <group>
      <Petals />
      <Fireflies />
    </group>
  )
}
