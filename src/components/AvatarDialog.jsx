// AvatarDialog.jsx — Panneau de dialogue de l'avatar central
import { useEffect, useCallback } from 'react'

const AVATAR_TEXT = `Actuellement en fin de Master Data Scientist, je construis mon profil en alliant bagage académique et réalité du terrain. Grâce à mon parcours professionnel (notamment dans l'industrie et la supply chain), j'ai pu travailler sur des sujets concrets : du déploiement d'IA générative sur le Cloud à l'analyse de données logistiques.

J'aime comprendre les besoins d'une équipe pour développer des outils utiles et fiables. Polyvalent et habitué aux méthodes agiles, je cherche aujourd'hui une opportunité pour appliquer mes compétences techniques au service de vos projets.`

export function AvatarDialog({ onClose }) {
  // Fermer avec Échap
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const stopProp    = useCallback((e) => e.stopPropagation(), [])
  const handleCtx   = useCallback((e) => { e.preventDefault(); onClose() }, [onClose])
  const stopCtxProp = useCallback((e) => { e.stopPropagation(); e.preventDefault() }, [])

  return (
    <div className="avatar-backdrop" onClick={onClose} onContextMenu={handleCtx}>
      <div className="avatar-dialog" onClick={stopProp} onContextMenu={stopCtxProp}>

        {/* ── Déco : cercle lumineux derrière le texte ── */}
        <div className="avatar-dialog__glow" />

        {/* ── Entête ── */}
        <div className="avatar-dialog__header">
          {/* Mini avatar icon */}
          <div className="avatar-dialog__icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="14" r="7" stroke="#00C8FF" strokeWidth="1.5"/>
              <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14"
                stroke="#00C8FF" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="16.5" cy="13" r="1.5" fill="#00C8FF"/>
              <circle cx="23.5" cy="13" r="1.5" fill="#00C8FF"/>
              <circle cx="20" cy="38" r="2" fill="#B8924A"/>
            </svg>
          </div>
          <div className="avatar-dialog__header-text">
            <div className="avatar-dialog__eyebrow">À propos de moi</div>
            <div className="avatar-dialog__name">Data Scientist &amp; Développeur</div>
          </div>
          <button className="avatar-dialog__close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Séparateur animé ── */}
        <div className="avatar-dialog__sep" />

        {/* ── Corps du texte ── */}
        <div className="avatar-dialog__body">
          {AVATAR_TEXT.split('\n\n').map((para, i) => (
            <p key={i} className="avatar-dialog__para">{para}</p>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="avatar-dialog__footer">
          <div className="avatar-dialog__shortcuts">
            <span className="avatar-shortcut-hint">Échap · Fermer</span>
            <span className="avatar-shortcut-hint">Clic droit · Fermer</span>
          </div>
          <button className="avatar-dialog__btn" onClick={onClose}>
            Continuer l'exploration
          </button>
        </div>

      </div>
    </div>
  )
}
