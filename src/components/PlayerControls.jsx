// PlayerControls.jsx — Déplacement FPS + téléportation + joystick virtuel
import { useEffect, useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { ARTWORKS, PROXIMITY_THRESHOLD } from '../data/artworks.js'
import { virtualJoy } from './MobileJoystick.jsx'

const MOVE_SPEED   = 6
const PLAYER_HEIGHT = 1.8
const BOUNDS = { xMin: -10.5, xMax: 10.5, zMin: -10.5, zMax: 10 }

// Position de l'avatar
const AVATAR_POSITION  = new THREE.Vector3(0, 1, 0)
const AVATAR_PROXIMITY = 3.8

const keys = {}

export function PlayerControls({
  locked, onLockChange,
  onNearArtwork, onNearAvatar, onInteract,
  cameraActionRef,        // ← ref impérative pour téléportation depuis App
}) {
  const { camera } = useThree()
  const controlsRef = useRef()

  const frontVec = useRef(new THREE.Vector3())
  const sideVec  = useRef(new THREE.Vector3())
  const moveDir  = useRef(new THREE.Vector3())

  // ── Expose une action caméra (téléportation) à l'extérieur ──────
  useEffect(() => {
    if (!cameraActionRef) return
    cameraActionRef.current = ({ position, yaw }) => {
      camera.position.set(...position)
      camera.rotation.set(0, yaw, 0, 'YXZ')
      // Déverrouille le pointer lock : l'utilisateur devra re-cliquer
      // Cela permet à PointerLockControls de réinitialiser avec le bon yaw
      document.exitPointerLock?.()
    }
  }, [camera, cameraActionRef])

  // ── Clavier ──────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e) => { keys[e.code] = true }
    const up   = (e) => { delete keys[e.code] }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
    }
  }, [])

  useEffect(() => {
    const h = (e) => {
      if ((e.code === 'KeyE' || e.code === 'Space') && locked) onInteract?.()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [locked, onInteract])

  // ── PointerLock ──────────────────────────────────────────────────
  const handleLock   = useCallback(() => onLockChange(true),  [onLockChange])
  const handleUnlock = useCallback(() => onLockChange(false), [onLockChange])

  // ── Position initiale ────────────────────────────────────────────
  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, 8)
    camera.lookAt(0, PLAYER_HEIGHT, -1)
  }, [camera])

  // ── Boucle mouvement ─────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) {
      checkProximity()
      return
    }

    // Inputs clavier
    const fwd  = keys['KeyW'] || keys['KeyZ'] || keys['ArrowUp']
    const bwd  = keys['KeyS'] || keys['ArrowDown']
    const left = keys['KeyA'] || keys['KeyQ'] || keys['ArrowLeft']
    const rgt  = keys['KeyD'] || keys['ArrowRight']

    // Inputs joystick virtuel (mobile)
    // virtualJoy.y < 0 → haut du joystick → avancer
    const jFwd  = virtualJoy.y < -0.1
    const jBwd  = virtualJoy.y >  0.1
    const jLeft = virtualJoy.x < -0.1
    const jRgt  = virtualJoy.x >  0.1

    const anyFwd  = fwd  || jFwd
    const anyBwd  = bwd  || jBwd
    const anyLeft = left || jLeft
    const anyRgt  = rgt  || jRgt

    if (!anyFwd && !anyBwd && !anyLeft && !anyRgt) {
      checkProximity()
      return
    }

    // Combine joystick + clavier
    const fx = (anyLeft ? 1 : 0) - (anyRgt ? 1 : 0)
    const fz = (anyBwd  ? 1 : 0) - (anyFwd ? 1 : 0)

    // Si joystick actif, affine avec la valeur analogique
    const analogX = jLeft ? -Math.abs(virtualJoy.x) : jRgt ? Math.abs(virtualJoy.x) : fx
    const analogZ = jBwd  ?  Math.abs(virtualJoy.y) : jFwd ? -Math.abs(virtualJoy.y) : fz

    frontVec.current.set(0, 0, analogZ)
    sideVec.current .set(analogX, 0, 0)

    moveDir.current
      .subVectors(frontVec.current, sideVec.current)
      .normalize()
      .multiplyScalar(MOVE_SPEED * delta)
      .applyEuler(camera.rotation)

    moveDir.current.y = 0
    camera.position.add(moveDir.current)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, BOUNDS.xMin, BOUNDS.xMax)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, BOUNDS.zMin, BOUNDS.zMax)
    camera.position.y = PLAYER_HEIGHT

    checkProximity()
  })

  // ── Détection de proximité ────────────────────────────────────────
  const nearArtworkRef = useRef(null)
  const nearAvatarRef  = useRef(false)

  function checkProximity() {
    let nearest = null, minDist = Infinity
    ARTWORKS.forEach((art) => {
      const [ax, ay, az] = art.position
      const d = camera.position.distanceTo(new THREE.Vector3(ax, ay, az))
      if (d < PROXIMITY_THRESHOLD && d < minDist) { minDist = d; nearest = art }
    })
    if (nearest?.id !== nearArtworkRef.current?.id) {
      nearArtworkRef.current = nearest
      onNearArtwork(nearest)
    }

    const avatarDist = camera.position.distanceTo(AVATAR_POSITION)
    const nowNear = avatarDist < AVATAR_PROXIMITY
    if (nowNear !== nearAvatarRef.current) {
      nearAvatarRef.current = nowNear
      onNearAvatar?.(nowNear)
    }
  }

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={handleLock}
      onUnlock={handleUnlock}
    />
  )
}
