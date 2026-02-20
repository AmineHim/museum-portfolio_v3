// NavMenu.jsx — Navigation rapide avec raccourcis clavier
// ─────────────────────────────────────────────────────────────────
//  Raccourcis : 1 = Accueil  2 = Expérience  3 = Formation  4 = Projets
//  Tab / M    : libère la souris pour cliquer sur ce menu
// ─────────────────────────────────────────────────────────────────

export const TELEPORT_TARGETS = {
  home: {
    label: 'Accueil',
    shortcut: '1',
    position: [0, 1.8, 8],
    yaw: Math.PI,
  },
  experience: {
    label: 'Expérience',
    shortcut: '2',
    position: [-7.5, 1.8, -1.5],
    yaw: Math.PI / 2,
  },
  education: {
    label: 'Formation',
    shortcut: '3',
    position: [-3, 1.8, -6.5],
    yaw: 0,
  },
  projects: {
    label: 'Projets',
    shortcut: '4',
    position: [3, 1.8, -6.5],
    yaw: 0,
  },
}

export function NavMenu({ onTeleport, locked }) {
  return (
    <nav className="nav-menu" aria-label="Navigation rapide">
      {/* Hint Tab/M visible quand la souris est capturée */}
      {locked && (
        <div className="nav-menu__unlock-hint">
          <span className="nav-shortcut-badge">Tab</span>
          libère la souris
        </div>
      )}

      <div className="nav-menu__items">
        {Object.entries(TELEPORT_TARGETS).map(([key, dest]) => (
          <button
            key={key}
            className={`nav-menu__btn${locked ? ' nav-menu__btn--locked' : ''}`}
            onClick={() => onTeleport(dest)}
            title={`${dest.label} (touche ${dest.shortcut})`}
            // Quand la souris est capturée, le clic ne marche pas mais
            // le raccourci clavier fonctionne toujours (App.jsx)
          >
            <span className="nav-shortcut-badge">{dest.shortcut}</span>
            <span className="nav-menu__text">{dest.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
