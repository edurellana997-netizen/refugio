import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

// Cúpula de cielo con degradado cálido de noche que deriva lentamente.
function SkyDome() {
  const matRef = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTop: { value: new THREE.Color('#120a26') },
      uMid: { value: new THREE.Color('#3a2160') },
      uBottom: { value: new THREE.Color('#7a3b6b') },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt
  })

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[120, 32, 32]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vPos;
          uniform float uTime;
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom;
          void main() {
            float h = normalize(vPos).y * 0.5 + 0.5;
            float drift = sin(uTime * 0.05) * 0.04;
            vec3 col = mix(uBottom, uMid, smoothstep(0.0, 0.5 + drift, h));
            col = mix(col, uTop, smoothstep(0.45, 1.0, h));
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

function Moon() {
  return (
    <group position={[18, 26, -50]}>
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#fff3d6" />
      </mesh>
      <mesh>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#ffe9b8" transparent opacity={0.12} />
      </mesh>
      <pointLight color="#fff0cf" intensity={0.6} distance={120} />
    </group>
  )
}

function ShootingStars() {
  const ref = useRef()
  const data = useRef({ t: 0, next: 4 + Math.random() * 8, x: 0, y: 0 })
  useFrame((_, dt) => {
    const d = data.current
    d.t += dt
    if (!ref.current) return
    if (d.t > d.next) {
      d.t = 0
      d.next = 6 + Math.random() * 12
      d.x = -30 + Math.random() * 60
      d.y = 20 + Math.random() * 20
      ref.current.visible = true
    }
    if (ref.current.visible) {
      ref.current.position.set(d.x + d.t * 14, d.y - d.t * 6, -60)
      ref.current.material.opacity = Math.max(0, 1 - d.t * 1.6)
      if (d.t > 0.8) ref.current.visible = false
    }
  })
  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[3, 0.06]} />
      <meshBasicMaterial color="#fff6e0" transparent opacity={0} />
    </mesh>
  )
}

export default function DynamicSky() {
  return (
    <group>
      <SkyDome />
      <Stars radius={90} depth={50} count={2600} factor={3} saturation={0} fade speed={0.4} />
      <Moon />
      <ShootingStars />
    </group>
  )
}
