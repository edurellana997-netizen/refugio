import { useMemo } from 'react'
import * as THREE from 'three'

function StringLights() {
  // Foquitos cálidos colgando a lo largo del barandal del fondo.
  const bulbs = useMemo(() => {
    const arr = []
    for (let i = 0; i <= 14; i++) {
      const x = -6 + i * (12 / 14)
      const y = 3.2 + Math.sin(i * 0.9) * 0.15 - Math.abs(i - 7) * 0.05
      arr.push([x, y, -4.4])
    }
    return arr
  }, [])
  return (
    <group>
      {bulbs.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial
              color="#ffce8a"
              emissive="#ffb877"
              emissiveIntensity={1}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.4, 12]} />
        <meshStandardMaterial color="#7a5a48" roughness={0.9} />
      </mesh>
      {[...Array(6)].map((_, i) => (
        <mesh
          key={i}
          position={[Math.sin(i) * 0.12, 0.6 + i * 0.04, Math.cos(i) * 0.12]}
          rotation={[Math.sin(i), i, 0]}
        >
          <coneGeometry args={[0.06, 0.5, 5]} />
          <meshStandardMaterial color="#3f6b4a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export default function Terrace() {
  return (
    <group>
      {/* Piso de madera */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#5a3d2e" roughness={0.85} />
      </mesh>
      {/* Tablones */}
      {[...Array(10)].map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -6 + i * 1.3]}>
          <planeGeometry args={[16, 0.04]} />
          <meshBasicMaterial color="#3f2a1e" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Alfombra cálida bajo el área de estar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.3]}>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#7a2f4a" roughness={0.95} />
      </mesh>

      {/* Barandal trasero (pared baja) */}
      <mesh position={[0, 0.6, -4.6]} castShadow>
        <boxGeometry args={[16, 1.2, 0.25]} />
        <meshStandardMaterial color="#4a3326" roughness={0.85} />
      </mesh>
      {/* Postes */}
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, 1.6, -4.6]}>
          <cylinderGeometry args={[0.08, 0.08, 2.6, 10]} />
          <meshStandardMaterial color="#3a281e" roughness={0.8} />
        </mesh>
      ))}

      <StringLights />
      <Plant position={[-6.5, 0, -3.8]} />
      <Plant position={[6.5, 0, -3.8]} />
    </group>
  )
}
