import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import DynamicSky from './environment/DynamicSky'
import Terrace from './environment/Terrace'
import Candles from './environment/Candles'
import Particles from './environment/Particles'
import Avatar from './Avatar'

function Loveseat() {
  return (
    <group position={[0, 0, -0.45]}>
      {/* Cojín del asiento */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.35, 1.2]} />
        <meshStandardMaterial color="#6e2f47" roughness={0.9} />
      </mesh>
      {/* Respaldo */}
      <mesh position={[0, 0.95, -0.5]} castShadow>
        <boxGeometry args={[2.8, 0.9, 0.3]} />
        <meshStandardMaterial color="#5e2740" roughness={0.9} />
      </mesh>
      {/* Apoyabrazos */}
      {[-1.45, 1.45].map((x) => (
        <mesh key={x} position={[x, 0.6, 0]} castShadow>
          <boxGeometry args={[0.3, 0.7, 1.2]} />
          <meshStandardMaterial color="#5e2740" roughness={0.9} />
        </mesh>
      ))}
      {/* Cojines decorativos */}
      <mesh position={[-0.9, 0.7, -0.2]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.5, 0.5, 0.18]} />
        <meshStandardMaterial color="#ffb877" roughness={0.8} />
      </mesh>
      <mesh position={[0.9, 0.7, -0.2]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.5, 0.5, 0.18]} />
        <meshStandardMaterial color="#ff9aa8" roughness={0.8} />
      </mesh>
    </group>
  )
}

function FlowerVase({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 12]} />
        <meshStandardMaterial color="#e8d8c0" roughness={0.7} />
      </mesh>
      {[...Array(7)].map((_, i) => {
        const a = (i / 7) * Math.PI * 2
        return (
          <Float key={i} speed={2} floatIntensity={0.15} rotationIntensity={0.2}>
            <mesh position={[Math.cos(a) * 0.12, 0.55 + Math.sin(i) * 0.05, Math.sin(a) * 0.12]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshStandardMaterial
                color={i % 2 ? '#ff9aa8' : '#ffd27a'}
                emissive={i % 2 ? '#ff7a90' : '#ffb877'}
                emissiveIntensity={0.3}
              />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

export default function Scene({ meAvatar, partnerAvatar, mySide, interaction }) {
  const partnerSide = mySide === 'left' ? 'right' : 'left'
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 2.1, 6.5], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#100a22']} />
      <fog attach="fog" args={['#1a1230', 8, 30]} />

      <Suspense fallback={null}>
        <DynamicSky />

        {/* Iluminación cálida y suave */}
        <ambientLight intensity={0.25} color="#5b4a7a" />
        <hemisphereLight intensity={0.3} color="#ffd9b0" groundColor="#2a1a40" />
        <directionalLight
          position={[4, 8, 4]}
          intensity={0.4}
          color="#ffd9a8"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <Terrace />
        <Loveseat />
        <Candles />
        <FlowerVase position={[-2.0, 0, 1.6]} />
        <FlowerVase position={[2.1, 0, 1.5]} />
        <Particles />

        {/* Avatares */}
        {meAvatar && <Avatar avatar={meAvatar} side={mySide} interaction={interaction} />}
        {partnerAvatar && (
          <Avatar avatar={partnerAvatar} side={partnerSide} interaction={interaction} />
        )}

        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.75} />
        </EffectComposer>
      </Suspense>

      <OrbitControls
        target={[0, 1, -0.2]}
        enablePan={false}
        minDistance={3.5}
        maxDistance={9}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.25}
      />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
