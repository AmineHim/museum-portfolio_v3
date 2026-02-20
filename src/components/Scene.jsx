// Scene.jsx — Composition de la scène 3D complète
import { Canvas } from '@react-three/fiber'
import { Room } from './Room.jsx'
import { Artwork } from './Artwork.jsx'
import { Avatar } from './Avatar.jsx'
import { PlayerControls } from './PlayerControls.jsx'
import { ARTWORKS } from '../data/artworks.js'

export function Scene({
  locked, onLockChange,
  onNearArtwork, nearArtwork, onOpenArtwork,
  nearAvatar, onNearAvatar, onOpenAvatar,
  cameraActionRef,
}) {
  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 100 }}
      style={{ width: '100%', height: '100%' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Fond blanc (visible si on regarde vers le haut/entrée) */}
      <color attach="background" args={['#F0EEE9']} />
      {/* Brouillard très doux — profondeur sans assombrir */}
      <fog attach="fog" args={['#F0EEE9', 20, 36]} />

      <Room />

      {ARTWORKS.map((art) => (
        <Artwork
          key={art.id}
          artwork={art}
          isNear={nearArtwork?.id === art.id}
          onClick={onOpenArtwork}
        />
      ))}

      <Avatar isNear={nearAvatar} onClick={onOpenAvatar} />

      <PlayerControls
        locked={locked}
        onLockChange={onLockChange}
        onNearArtwork={onNearArtwork}
        onNearAvatar={onNearAvatar}
        cameraActionRef={cameraActionRef}
        onInteract={() => {
          if (nearAvatar)  onOpenAvatar()
          else if (nearArtwork) onOpenArtwork(nearArtwork)
        }}
      />
    </Canvas>
  )
}
