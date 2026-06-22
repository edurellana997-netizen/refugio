import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Pose objetivo según la interacción compartida y el lado del avatar.
// El landscape/cielo está en -Z; la cámara mira desde +Z. Por eso "contemplar"
// los gira de espaldas a nosotros, mirando juntos las estrellas.
function poseFor(type, side) {
  const s = side === 'left' ? -1 : 1
  const inner = side === 'left' ? 'right' : 'left' // brazo hacia la pareja
  const base = {
    pos: [s * 1.2, 0, 0.7],
    rotY: -s * 0.25,
    lean: 0,
    armRaise: 0.1,
    innerArm: 0.1,
    inner,
    heart: false,
    sitting: false,
  }
  switch (type) {
    case 'holdHands':
      return { ...base, pos: [s * 0.55, 0, 0.7], rotY: -s * 0.12, innerArm: -0.5, armRaise: 0.1 }
    case 'hug':
      return {
        ...base,
        pos: [s * 0.32, 0, 0.55],
        rotY: s * (Math.PI / 2 - 0.25),
        lean: 0.18,
        armRaise: -1.15,
        innerArm: -1.3,
        heart: true,
      }
    case 'sit':
      return { ...base, pos: [s * 0.55, -0.15, -0.3], rotY: -s * 0.1, sitting: true, armRaise: 0.05 }
    case 'gaze':
      return {
        ...base,
        pos: [s * 0.55, -0.15, -0.3],
        rotY: Math.PI + s * 0.05,
        sitting: true,
        armRaise: 0.05,
      }
    default:
      return base
  }
}

function Heart({ visible }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.visible = visible
    if (visible) {
      ref.current.position.y = 1.9 + Math.sin(t * 2) * 0.08
      const pulse = 1 + Math.sin(t * 4) * 0.12
      ref.current.scale.setScalar(0.18 * pulse)
    }
  })
  return (
    <group ref={ref} visible={false} position={[0, 1.9, 0]}>
      <mesh position={[-0.25, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#ff7a90" toneMapped={false} />
      </mesh>
      <mesh position={[0.25, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#ff7a90" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.72, 0.72, 0.05]} />
        <meshBasicMaterial color="#ff7a90" toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function Avatar({ avatar, side, interaction }) {
  const group = useRef()
  const torso = useRef()
  const leftArm = useRef()
  const rightArm = useRef()
  const glow = useRef()
  const seed = useRef(side === 'left' ? 0 : 3.1)

  const target = useMemo(() => poseFor(interaction?.type || 'idle', side), [interaction?.type, side])
  const affectionate = ['hug', 'holdHands'].includes(interaction?.type)
  const tall = avatar?.shape === 'alto'

  useFrame((state, dt) => {
    if (!group.current) return
    const t = state.clock.elapsedTime + seed.current
    const k = Math.min(1, dt * 3) // suavizado

    // Posición y rotación hacia la pose objetivo
    const breathe = Math.sin(t * 1.4) * 0.02
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, target.pos[0], k)
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      target.pos[1] + breathe,
      k,
    )
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, target.pos[2], k)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.rotY, k)

    // Inclinación del torso + leve balanceo en reposo
    if (torso.current) {
      const sway = interaction?.type === 'idle' ? Math.sin(t * 0.8) * 0.04 : 0
      torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, target.lean, k)
      torso.current.rotation.z = THREE.MathUtils.lerp(torso.current.rotation.z, sway, k)
    }

    // Brazos
    const innerIsRight = target.inner === 'right'
    const rTarget = innerIsRight ? target.innerArm : target.armRaise
    const lTarget = innerIsRight ? target.armRaise : target.innerArm
    if (rightArm.current)
      rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, rTarget, k)
    if (leftArm.current)
      leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, lTarget, k)

    // Resplandor que crece con la cercanía
    if (glow.current) {
      const tgt = affectionate ? 2.2 : 1.0
      glow.current.intensity = THREE.MathUtils.lerp(glow.current.intensity, tgt, k)
    }
  })

  const bodyColor = avatar?.bodyColor || '#ff9aa8'
  const glowColor = avatar?.glowColor || '#ffd27a'
  const bodyH = tall ? 1.0 : 0.8
  const headY = tall ? 1.55 : 1.35

  return (
    <group ref={group} position={[side === 'left' ? -1.2 : 1.2, 0, 0.7]}>
      <pointLight ref={glow} position={[0, 1.2, 0]} color={glowColor} intensity={1} distance={3.5} decay={2} />

      <group ref={torso}>
        {/* Cuerpo */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <capsuleGeometry args={[0.34, bodyH, 8, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.05} />
        </mesh>
        {/* Cabeza */}
        <mesh position={[0, headY, 0]} castShadow>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial color={bodyColor} roughness={0.4} />
        </mesh>
        {/* Brillo de mejillas */}
        <mesh position={[0, headY, 0.28]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#ff8aa0" transparent opacity={0.5} />
        </mesh>

        {/* Brazos (pivote en el hombro, cuelgan hacia abajo) */}
        <group ref={leftArm} position={[-0.36, 1.0, 0]}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 6, 10]} />
            <meshStandardMaterial color={bodyColor} roughness={0.5} />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.36, 1.0, 0]}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 6, 10]} />
            <meshStandardMaterial color={bodyColor} roughness={0.5} />
          </mesh>
        </group>

        {/* Accesorio */}
        {avatar?.accessory === 'flor' && (
          <mesh position={[0.22, headY + 0.18, 0.05]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffb877" emissiveIntensity={0.4} />
          </mesh>
        )}
        {avatar?.accessory === 'corona' && (
          <mesh position={[0, headY + 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.04, 8, 20]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffd27a" emissiveIntensity={0.6} metalness={0.6} />
          </mesh>
        )}
        {avatar?.accessory === 'estrella' && (
          <mesh position={[0, headY + 0.34, 0]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial color="#fff3d6" emissive="#ffd27a" emissiveIntensity={1} toneMapped={false} />
          </mesh>
        )}
      </group>

      <Heart visible={target.heart} />
    </group>
  )
}
