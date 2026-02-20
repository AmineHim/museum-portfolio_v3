// ═══════════════════════════════════════════════════════════════════
//  Avatar.jsx — Avatar interactif avec animation Idle procédurale
// ═══════════════════════════════════════════════════════════════════
//
//  ╔══════════════════════════════════════════════════════════════╗
//  ║  💡 GUIDE : INTÉGRER UN VRAI MODÈLE ANIMÉ DEPUIS MIXAMO    ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║                                                              ║
//  ║  ÉTAPE 1 — Télécharger un avatar sur Mixamo                 ║
//  ║  1. Allez sur https://www.mixamo.com (compte Adobe gratuit) ║
//  ║  2. Onglet "Characters" → choisissez un personnage          ║
//  ║     (ex: "Y Bot", "X Bot", ou tout autre)                   ║
//  ║  3. Cliquez "USE THIS CHARACTER"                            ║
//  ║                                                              ║
//  ║  ÉTAPE 2 — Ajouter une animation Idle                       ║
//  ║  1. Onglet "Animations" → recherchez "Breathing Idle"       ║
//  ║  2. Cochez "In Place" si disponible                         ║
//  ║  3. DOWNLOAD → Format: FBX for Unity · Skin: With Skin      ║
//  ║                                                              ║
//  ║  ÉTAPE 3 — Convertir FBX → GLB                             ║
//  ║  Option A (en ligne) : https://products.aspose.app/3d/...   ║
//  ║  Option B (Blender)  : File → Import FBX → Export glTF 2.0 ║
//  ║                                                              ║
//  ║  ÉTAPE 4 — Intégrer dans le projet                         ║
//  ║  1. Placez le fichier dans : public/models/avatar.glb       ║
//  ║  2. Remplacez la fonction GeometricAvatar par :             ║
//  ║                                                              ║
//  ║  import { useGLTF, useAnimations } from '@react-three/drei' ║
//  ║                                                              ║
//  ║  function GeometricAvatar({ isNear }) {                     ║
//  ║    const group = useRef()                                    ║
//  ║    const { scene, animations } = useGLTF('/models/avatar.glb') ║
//  ║    const { actions, names } = useAnimations(animations, group)  ║
//  ║    useEffect(() => {                                         ║
//  ║      const idle = actions['Breathing Idle'] ?? actions[names[0]] ║
//  ║      if (idle) { idle.reset().fadeIn(0.5).play()            ║
//  ║                  return () => idle.fadeOut(0.5) }            ║
//  ║    }, [actions, names])                                      ║
//  ║    return <group ref={group}>                                ║
//  ║      <primitive object={scene} scale={0.012} />             ║
//  ║    </group>                                                  ║
//  ║  }                                                           ║
//  ║  useGLTF.preload('/models/avatar.glb')                      ║
//  ╚══════════════════════════════════════════════════════════════╝

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────
//  PLACEHOLDER GÉOMÉTRIQUE avec animation Idle procédurale
//  Respiration naturelle : torse, tête, bras animés indépendamment
// ─────────────────────────────────────────────────────────────────
function GeometricAvatar({ isNear, hovered }) {
  const torsoRef     = useRef()
  const headRef      = useRef()
  const leftArmRef   = useRef()
  const rightArmRef  = useRef()
  const leftFArmRef  = useRef()
  const rightFArmRef = useRef()
  const leftLegRef   = useRef()
  const rightLegRef  = useRef()

  const rest = useMemo(() => ({
    torso:     [0,    1.05, 0],
    head:      [0,    1.85, 0],
    leftArm:   [-0.36, 1.05, 0],
    rightArm:  [ 0.36, 1.05, 0],
    leftFArm:  [-0.38, 0.68, 0],
    rightFArm: [ 0.38, 0.68, 0],
    leftLeg:   [-0.15, 0.25, 0],
    rightLeg:  [ 0.15, 0.25, 0],
  }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Respiration (fréquence 1.1 Hz — naturel)
    const breathe = Math.sin(t * 1.1) * 0.022

    if (torsoRef.current) {
      torsoRef.current.position.y = rest.torso[1] + breathe
      torsoRef.current.rotation.x = Math.sin(t * 1.1) * 0.006
      torsoRef.current.rotation.z = Math.sin(t * 0.55) * 0.018
    }
    if (headRef.current) {
      headRef.current.position.y  = rest.head[1] + breathe * 1.15
      headRef.current.rotation.x  = Math.sin(t * 0.7)  * 0.025
      headRef.current.rotation.y  = Math.sin(t * 0.45) * 0.03
      headRef.current.rotation.z  = Math.sin(t * 0.55) * 0.015
    }

    const swingL = Math.sin(t * 0.55 + 0.3)
    const swingR = Math.sin(t * 0.55)
    if (leftArmRef.current) {
      leftArmRef.current.position.y = rest.leftArm[1] + breathe * 0.6
      leftArmRef.current.rotation.x = swingL * 0.04
      leftArmRef.current.rotation.z = 0.12 + swingL * 0.025
    }
    if (rightArmRef.current) {
      rightArmRef.current.position.y = rest.rightArm[1] + breathe * 0.6
      rightArmRef.current.rotation.x = swingR * 0.04
      rightArmRef.current.rotation.z = -0.12 - swingR * 0.025
    }
    if (leftFArmRef.current) {
      leftFArmRef.current.position.y  = rest.leftFArm[1] + breathe * 0.4
      leftFArmRef.current.rotation.x  = 0.2 + swingL * 0.05
    }
    if (rightFArmRef.current) {
      rightFArmRef.current.position.y = rest.rightFArm[1] + breathe * 0.4
      rightFArmRef.current.rotation.x = -0.2 + swingR * 0.05
    }
    const ws = Math.sin(t * 0.4) * 0.008
    if (leftLegRef.current)  leftLegRef.current.position.x  = rest.leftLeg[0]  + ws
    if (rightLegRef.current) rightLegRef.current.position.x = rest.rightLeg[0] - ws
  })

  const eColor = isNear || hovered ? '#1E4060' : '#0A1520'
  const eInt   = isNear ? 0.45 : hovered ? 0.3 : 0.08
  const mat    = { roughness: 0.3, metalness: 0.25 }

  return (
    <group>
      {/* Tête */}
      <mesh ref={headRef} position={rest.head} castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#1C2E3A" emissive={eColor} emissiveIntensity={eInt} {...mat} />
      </mesh>
      {/* Cou */}
      <mesh position={[0, 1.54, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.18, 10]} />
        <meshStandardMaterial color="#162230" {...mat} />
      </mesh>
      {/* Torse */}
      <mesh ref={torsoRef} position={rest.torso} castShadow>
        <boxGeometry args={[0.52, 0.72, 0.28]} />
        <meshStandardMaterial color="#0E2030" emissive={eColor} emissiveIntensity={eInt * 0.5} {...mat} />
      </mesh>
      {/* Bassin */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[0.48, 0.28, 0.26]} />
        <meshStandardMaterial color="#0A1828" {...mat} />
      </mesh>
      {/* Bras G */}
      <mesh ref={leftArmRef}  position={rest.leftArm}  castShadow>
        <cylinderGeometry args={[0.08, 0.07, 0.65, 8]} />
        <meshStandardMaterial color="#0E2030" {...mat} />
      </mesh>
      <mesh ref={leftFArmRef} position={rest.leftFArm} castShadow>
        <cylinderGeometry args={[0.065, 0.06, 0.55, 8]} />
        <meshStandardMaterial color="#0A1828" {...mat} />
      </mesh>
      {/* Bras D */}
      <mesh ref={rightArmRef}  position={rest.rightArm}  castShadow>
        <cylinderGeometry args={[0.08, 0.07, 0.65, 8]} />
        <meshStandardMaterial color="#0E2030" {...mat} />
      </mesh>
      <mesh ref={rightFArmRef} position={rest.rightFArm} castShadow>
        <cylinderGeometry args={[0.065, 0.06, 0.55, 8]} />
        <meshStandardMaterial color="#0A1828" {...mat} />
      </mesh>
      {/* Jambe G */}
      <mesh ref={leftLegRef} position={rest.leftLeg} castShadow>
        <cylinderGeometry args={[0.1, 0.09, 0.52, 8]} />
        <meshStandardMaterial color="#0A1828" {...mat} />
      </mesh>
      <mesh position={[-0.15, -0.08, 0.04]} rotation={[0.1,0,0]} castShadow>
        <cylinderGeometry args={[0.085, 0.08, 0.46, 8]} />
        <meshStandardMaterial color="#08141E" {...mat} />
      </mesh>
      {/* Jambe D */}
      <mesh ref={rightLegRef} position={rest.rightLeg} castShadow>
        <cylinderGeometry args={[0.1, 0.09, 0.52, 8]} />
        <meshStandardMaterial color="#0A1828" {...mat} />
      </mesh>
      <mesh position={[0.15, -0.08, 0.04]} rotation={[0.1,0,0]} castShadow>
        <cylinderGeometry args={[0.085, 0.08, 0.46, 8]} />
        <meshStandardMaterial color="#08141E" {...mat} />
      </mesh>
      {/* Yeux cyan */}
      {[[-0.1, 1.9, 0.25], [0.1, 1.9, 0.25]].map(([x,y,z], i) => (
        <mesh key={i} position={[x,y,z]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#00C8FF" emissive="#00C8FF" emissiveIntensity={3} />
        </mesh>
      ))}
      {/* Badge doré */}
      <mesh position={[0, 1.12, 0.145]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#B8924A" emissive="#B8924A" emissiveIntensity={1.2} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Composant Avatar principal
// ─────────────────────────────────────────────────────────────────
export function Avatar({ isNear, onClick }) {
  const groupRef   = useRef()
  const hoveredRef = useRef(false)
  const glowRef    = useRef()
  const ringRef    = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.9) * 0.04
      groupRef.current.rotation.y += isNear ? 0.006 : 0.002
    }
    if (ringRef.current) {
      const pulse = 0.88 + Math.sin(t * 1.8) * 0.12
      ringRef.current.scale.setScalar(pulse)
      ringRef.current.material.opacity = (isNear ? 0.5 : 0.18) * pulse
    }
    if (glowRef.current) {
      const target = isNear ? 8 : hoveredRef.current ? 5 : 2
      glowRef.current.intensity += (target - glowRef.current.intensity) * 0.07
    }
  })

  const onOver = () => { hoveredRef.current = true;  document.body.style.cursor = 'pointer' }
  const onOut  = () => { hoveredRef.current = false; document.body.style.cursor = 'auto' }
  const handleClick = (e) => { e.stopPropagation(); onClick?.() }

  return (
    <group position={[0, 0.32, 0]}>
      <mesh ref={ringRef} rotation={[-Math.PI/2, 0, 0]} position={[0, -0.3, 0]}>
        <ringGeometry args={[0.55, 1.2, 48]} />
        <meshBasicMaterial color="#00A8FF" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.31, 0]}>
        <ringGeometry args={[0.36, 0.40, 64]} />
        <meshBasicMaterial color="#00C8FF" transparent opacity={isNear ? 0.7 : 0.28} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 1.2, 0]} intensity={2} color="#3080C0" distance={6} />
      <group ref={groupRef} onPointerOver={onOver} onPointerOut={onOut} onClick={handleClick}>
        <GeometricAvatar isNear={isNear} hovered={hoveredRef.current} />
        <mesh visible={false} onClick={handleClick}>
          <boxGeometry args={[1.1, 2.4, 0.9]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </group>
  )
}
