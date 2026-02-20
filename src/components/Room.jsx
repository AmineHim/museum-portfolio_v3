// Room.jsx — Galerie d'art moderne · Style minimaliste & lumineux
import { useMemo } from 'react'
import * as THREE from 'three'

// ── Sol béton ciré (texture procédurale claire) ────────────────
function useFloorTexture() {
  return useMemo(() => {
    const W = 512, H = 512
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    // Base béton clair
    ctx.fillStyle = '#E8E6E2'
    ctx.fillRect(0, 0, W, H)

    // Micro-grain béton
    for (let i = 0; i < 8000; i++) {
      const alpha = Math.random() * 0.04
      const light = Math.random() > 0.5
      ctx.fillStyle = light
        ? `rgba(255,255,255,${alpha})`
        : `rgba(100,95,90,${alpha})`
      const s = Math.random() * 1.2
      ctx.fillRect(Math.random() * W, Math.random() * H, s, s)
    }

    // Légères variations de teinte (dalles)
    const TILE = 128
    for (let row = 0; row < W / TILE; row++) {
      for (let col = 0; col < H / TILE; col++) {
        const v = (Math.random() - 0.5) * 6
        ctx.fillStyle = `rgba(${120 + v},${115 + v},${110 + v},0.06)`
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
        // Joint discret
        ctx.fillStyle = 'rgba(160,155,150,0.18)'
        ctx.fillRect(col * TILE, row * TILE, TILE, 1)
        ctx.fillRect(col * TILE, row * TILE, 1, TILE)
      }
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 3)
    return tex
  }, [])
}

// ── Spot tableau (warm sur mur blanc = rendu galerie) ──────────
function ArtSpot({ position }) {
  return (
    <spotLight
      position={position}
      intensity={80}
      angle={0.28}
      penumbra={0.55}
      castShadow
      color="#FFF0D0"
      distance={11}
    />
  )
}

// ─────────────────────────────────────────────────────────────
export function Room() {
  const ROOM = { w: 24, h: 7, d: 22 }
  const floorTex = useFloorTexture()

  // Blanc légèrement chaud (papier japonais)
  const WALL_COLOR  = '#F6F4F1'
  const CEIL_COLOR  = '#FFFFFF'
  const BASE_COLOR  = '#DEDAD5'   // plinthe légèrement plus foncée

  return (
    <group>

      {/* ═══════════════════════════════════════════
          ÉCLAIRAGE — Galerie d'art contemporaine
          Lumière abondante, blanche, sans ombres dures
      ═══════════════════════════════════════════ */}

      {/* Ambiance générale très lumineuse */}
      <ambientLight intensity={2.8} color="#FFFFFF" />

      {/* Hémisphérique neutre */}
      <hemisphereLight skyColor="#FFFFFF" groundColor="#D0CCC8" intensity={1.4} />

      {/* Directionnelles (simulent éclairage zénithal de musée) */}
      <directionalLight position={[0, 9, 2]}   intensity={2.5} color="#FFFAF5" castShadow />
      <directionalLight position={[0, 9, -4]}  intensity={1.8} color="#FFFAF5" />
      <directionalLight position={[-6, 7, 0]}  intensity={1.2} color="#F8F8FF" />
      <directionalLight position={[ 6, 7, 0]}  intensity={1.2} color="#F8F8FF" />

      {/* Points de remplissage pour éliminer les zones sombres */}
      <pointLight position={[0, 5.5,  4]}  intensity={20} color="#FFFFFF" distance={24} />
      <pointLight position={[0, 5.5, -4]}  intensity={16} color="#FFFFFF" distance={24} />
      <pointLight position={[-7, 5,   0]}  intensity={12} color="#F8FAFF" distance={20} />
      <pointLight position={[ 7, 5,   0]}  intensity={12} color="#F8FAFF" distance={20} />
      <pointLight position={[-7, 5,  -7]}  intensity={8}  color="#F8FAFF" distance={16} />
      <pointLight position={[ 7, 5,  -7]}  intensity={8}  color="#F8FAFF" distance={16} />
      <pointLight position={[-7, 5,   6]}  intensity={6}  color="#F8FAFF" distance={14} />
      <pointLight position={[ 7, 5,   6]}  intensity={6}  color="#F8FAFF" distance={14} />

      {/* Spots directionnels sur chaque tableau */}
      <ArtSpot position={[-10.5, 6.2, -1.5]} />
      <ArtSpot position={[-3,    6.2, -10.0]} />
      <ArtSpot position={[ 3,    6.2, -10.0]} />
      <ArtSpot position={[10.5,  6.2, -1.5]} />

      {/* ═══════════════════════════════════════════
          GÉOMÉTRIE — Salle épurée
      ═══════════════════════════════════════════ */}

      {/* Sol béton ciré */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial map={floorTex} roughness={0.85} />
      </mesh>

      {/* Plafond blanc mat */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.h, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color={CEIL_COLOR} roughness={1} />
      </mesh>

      {/* Mur gauche */}
      <mesh position={[-ROOM.w/2, ROOM.h/2, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.d, ROOM.h]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Mur droit */}
      <mesh position={[ROOM.w/2, ROOM.h/2, 0]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.d, ROOM.h]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Mur du fond */}
      <mesh position={[0, ROOM.h/2, -ROOM.d/2]} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.h]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Mur d'entrée */}
      <mesh position={[0, ROOM.h/2, ROOM.d/2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.h]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Plinthes (bande horizontale en bas des murs) */}
      {[
        { pos:[0, 0.075, ROOM.d/2 - 0.04],  rot:[0,0,0],           args:[ROOM.w, 0.15, 0.05] },
        { pos:[0, 0.075, -ROOM.d/2 + 0.04], rot:[0,0,0],           args:[ROOM.w, 0.15, 0.05] },
        { pos:[-ROOM.w/2+0.04, 0.075, 0],   rot:[0,Math.PI/2, 0],  args:[ROOM.d, 0.15, 0.05] },
        { pos:[ ROOM.w/2-0.04, 0.075, 0],   rot:[0,Math.PI/2, 0],  args:[ROOM.d, 0.15, 0.05] },
      ].map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot}>
          <boxGeometry args={p.args} />
          <meshStandardMaterial color={BASE_COLOR} roughness={0.7} />
        </mesh>
      ))}

    </group>
  )
}
