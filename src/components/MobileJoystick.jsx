// MobileJoystick.jsx — Joystick virtuel pour appareils tactiles
// Implémenté en React pur (sans lib externe) via les événements touch.
// Alimente le même objet `virtualJoy` que PlayerControls lit en useFrame.

import { useRef, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────
//  État partagé (lu par PlayerControls.jsx via import)
//  { x: -1..1, y: -1..1 }  →  x = gauche/droite, y = avant/arrière
// ─────────────────────────────────────────────────────────────────
export const virtualJoy = { x: 0, y: 0 }

const DEAD_ZONE  = 0.12   // zone morte (évite les micro-dérives)
const MAX_RADIUS = 52      // rayon max du stick en px

export function MobileJoystick({ visible }) {
  const baseRef  = useRef()
  const stickRef = useRef()
  const touchId  = useRef(null)
  const origin   = useRef({ x: 0, y: 0 })

  const resetStick = useCallback(() => {
    virtualJoy.x = 0
    virtualJoy.y = 0
    touchId.current = null
    if (stickRef.current) {
      stickRef.current.style.transform = 'translate(0px, 0px)'
    }
    if (baseRef.current) {
      baseRef.current.classList.remove('joystick__base--active')
    }
  }, [])

  const onTouchStart = useCallback((e) => {
    if (touchId.current !== null) return
    const touch = e.changedTouches[0]
    touchId.current = touch.identifier
    origin.current  = { x: touch.clientX, y: touch.clientY }
    baseRef.current?.classList.add('joystick__base--active')
    e.preventDefault()
  }, [])

  const onTouchMove = useCallback((e) => {
    if (touchId.current === null) return
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId.current)
    if (!touch) return

    const dx = touch.clientX - origin.current.x
    const dy = touch.clientY - origin.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const clamped = Math.min(dist, MAX_RADIUS)
    const angle   = Math.atan2(dy, dx)

    // Déplace visuellement le stick
    const sx = Math.cos(angle) * clamped
    const sy = Math.sin(angle) * clamped
    if (stickRef.current) {
      stickRef.current.style.transform = `translate(${sx}px, ${sy}px)`
    }

    // Calcule les valeurs normalisées [-1, 1]
    const nx = (clamped / MAX_RADIUS) * Math.cos(angle)
    const ny = (clamped / MAX_RADIUS) * Math.sin(angle)

    virtualJoy.x = Math.abs(nx) > DEAD_ZONE ? nx : 0
    virtualJoy.y = Math.abs(ny) > DEAD_ZONE ? ny : 0

    e.preventDefault()
  }, [])

  const onTouchEnd = useCallback((e) => {
    const stillDown = Array.from(e.touches).find(t => t.identifier === touchId.current)
    if (!stillDown) resetStick()
  }, [resetStick])

  // Nettoie si le composant démonte
  useEffect(() => () => resetStick(), [resetStick])

  if (!visible) return null

  return (
    <div className="joystick__wrapper" aria-hidden="true">
      <div
        ref={baseRef}
        className="joystick__base"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {/* Anneaux décoratifs */}
        <div className="joystick__ring joystick__ring--outer" />
        <div className="joystick__ring joystick__ring--inner" />
        {/* Stick (point de contrôle) */}
        <div ref={stickRef} className="joystick__stick" />
      </div>
      <p className="joystick__hint">Joystick · Déplacer</p>
    </div>
  )
}
