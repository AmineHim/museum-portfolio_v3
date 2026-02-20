// App.jsx — Orchestrateur principal
//
// ── Raccourcis clavier ───────────────────────────────────────────
//   1 / 2 / 3 / 4  → Téléportation (Accueil / Expérience / Formation / Projets)
//   Tab  ou  M     → Libère la souris (pour cliquer dans l'UI)
//   E  ou  Espace  → Interagir (tableau ou avatar)
//   Échap          → Déverrouille le PointerLock
//   Clic droit     → Ferme la modale / le dialogue ouverte
// ────────────────────────────────────────────────────────────────
import { useState, useCallback, useRef, useEffect } from 'react'
import { Scene }          from './components/Scene.jsx'
import { HUD }            from './components/HUD.jsx'
import { Modal }          from './components/Modal.jsx'
import { AvatarDialog }   from './components/AvatarDialog.jsx'
import { NavMenu, TELEPORT_TARGETS } from './components/NavMenu.jsx'
import { MobileJoystick } from './components/MobileJoystick.jsx'

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])
  return isTouch
}

// Tableau ordonné des destinations (indice = touche - 1)
const TELEPORT_ORDER = ['home', 'experience', 'education', 'projects']

export default function App() {
  const [phase, setPhase]             = useState('entry')
  const [locked, setLocked]           = useState(false)
  const [nearArtwork, setNearArtwork] = useState(null)
  const [openArtwork, setOpenArtwork] = useState(null)
  const [nearAvatar,  setNearAvatar]  = useState(false)

  const cameraActionRef = useRef(null)
  const isTouch = useIsTouchDevice()

  // Dérivés
  const isExploring  = phase === 'exploring'
  const isModal      = phase === 'modal'      && !!openArtwork
  const isAvatarOpen = phase === 'avatarDialog'
  const isAnyOverlay = isModal || isAvatarOpen
  const sceneVisible = phase !== 'entry'

  // ── Téléportation ─────────────────────────────────────────────
  const handleTeleport = useCallback((dest) => {
    cameraActionRef.current?.(dest)
    // S'assure qu'on est en mode exploration après téléport
    setPhase('exploring')
  }, [])

  // ── Entrée ───────────────────────────────────────────────────
  const handleEnter = useCallback(() => setPhase('exploring'), [])

  // ── Lock ─────────────────────────────────────────────────────
  const handleLockChange = useCallback((v) => setLocked(v), [])

  // ── Proximité ────────────────────────────────────────────────
  const handleNearArtwork = useCallback((art) => setNearArtwork(art), [])
  const handleNearAvatar  = useCallback((v)   => setNearAvatar(v),   [])

  // ── Ouvrir tableau ────────────────────────────────────────────
  const handleOpenArtwork = useCallback((art) => {
    setOpenArtwork(art)
    setPhase('modal')
    document.exitPointerLock?.()         // ← libère la souris systématiquement
  }, [])

  // ── Fermer tableau ────────────────────────────────────────────
  const handleCloseModal = useCallback(() => {
    setOpenArtwork(null)
    setPhase('exploring')
  }, [])

  // ── Ouvrir avatar ─────────────────────────────────────────────
  const handleOpenAvatar = useCallback(() => {
    setPhase('avatarDialog')
    document.exitPointerLock?.()         // ← libère la souris systématiquement
  }, [])

  // ── Fermer avatar ─────────────────────────────────────────────
  const handleCloseAvatar = useCallback(() => setPhase('exploring'), [])

  // ── Raccourcis clavier globaux ────────────────────────────────
  useEffect(() => {
    if (!sceneVisible) return

    const handleKey = (e) => {
      // ── Tab / M → libère la souris volontairement ──────────
      if (e.code === 'Tab' || e.code === 'KeyM') {
        e.preventDefault()
        document.exitPointerLock?.()
        return
      }

      // ── Touches 1–4 → téléportation directe ────────────────
      // Fonctionne même quand le pointeur EST verrouillé
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 4 && !isAnyOverlay) {
        const key  = TELEPORT_ORDER[num - 1]
        const dest = TELEPORT_TARGETS[key]
        if (dest) {
          document.exitPointerLock?.()    // libère d'abord
          handleTeleport(dest)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [sceneVisible, isAnyOverlay, handleTeleport])

  // ── Clic droit → ferme la modale / dialogue ouverte ──────────
  useEffect(() => {
    if (!isAnyOverlay) return

    const handleContext = (e) => {
      e.preventDefault()
      if (isModal)      handleCloseModal()
      if (isAvatarOpen) handleCloseAvatar()
    }

    window.addEventListener('contextmenu', handleContext)
    return () => window.removeEventListener('contextmenu', handleContext)
  }, [isAnyOverlay, isModal, isAvatarOpen, handleCloseModal, handleCloseAvatar])

  return (
    <>
      {/* ══ ÉCRAN D'ACCUEIL ══════════════════════════════════ */}
      {phase === 'entry' && (
        <div className="entry-overlay">
          <div className="entry-overlay__eyebrow">Portfolio Interactif · Data Science & IA</div>
          <div className="entry-overlay__name">Amine</div>
          <h1 className="entry-overlay__title">Musée<br />Virtuel</h1>
          <p className="entry-overlay__subtitle">
            Data Scientist · IA Générative · Développement
          </p>
          <div className="entry-overlay__divider" />
          <button className="entry-btn" onClick={handleEnter}>
            Entrer dans le musée
          </button>
          <p className="entry-overlay__hint">
            Cliquez pour capturer la souris · ZQSD pour se déplacer
          </p>
        </div>
      )}

      {/* ══ SCÈNE 3D ═════════════════════════════════════════ */}
      {sceneVisible && (
        <>
          <Scene
            locked={locked}
            onLockChange={handleLockChange}
            onNearArtwork={handleNearArtwork}
            nearArtwork={nearArtwork}
            onOpenArtwork={handleOpenArtwork}
            nearAvatar={nearAvatar}
            onNearAvatar={handleNearAvatar}
            onOpenAvatar={handleOpenAvatar}
            cameraActionRef={cameraActionRef}
          />

          {/* HUD */}
          <HUD nearArtwork={nearArtwork} nearAvatar={nearAvatar} locked={locked} />

          {/* Menu de navigation — toujours visible, interactif quand souris libre */}
          <NavMenu onTeleport={handleTeleport} locked={locked} />

          {/* Joystick mobile */}
          <MobileJoystick visible={isTouch} />
        </>
      )}

      {/* ══ OVERLAY "CLIQUER POUR CAPTURER" ═════════════════ */}
      {isExploring && !locked && (
        <div className="resume-overlay">
          <div className="resume-overlay__content">
            <p className="resume-overlay__title">Cliquez dans la scène pour reprendre l'exploration</p>
            <p className="resume-overlay__sub">
              Z Q S D · Déplacer &nbsp;·&nbsp; Souris · Regarder &nbsp;·&nbsp;
              E · Interagir &nbsp;·&nbsp; Tab · Libérer souris
            </p>
          </div>
        </div>
      )}

      {/* ══ MODAL TABLEAU ════════════════════════════════════ */}
      {isModal      && <Modal artwork={openArtwork} onClose={handleCloseModal} />}

      {/* ══ DIALOGUE AVATAR ══════════════════════════════════ */}
      {isAvatarOpen && <AvatarDialog onClose={handleCloseAvatar} />}
    </>
  )
}
