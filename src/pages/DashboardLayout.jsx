import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const NAV_ITEMS = {
  social: [
    { path: '/dashboard/social',           label: 'Resumen del mes',    icon: '◎' },
    { path: '/dashboard/social/ingresar',  label: 'Ingresar métricas',  icon: '✚' },
    { path: '/dashboard/social/campanas',  label: 'Campañas',           icon: '📢' },
    { path: '/dashboard/social/comparar',  label: 'Comparar meses',     icon: '⇄' },
  ],
  diseno: [
    { path: '/dashboard/diseno',           label: 'Resumen del mes',    icon: '◎' },
    { path: '/dashboard/diseno/ingresar',  label: 'Registro diario',    icon: '✚' },
    { path: '/dashboard/diseno/comparar',  label: 'Comparar meses',     icon: '⇄' },
  ],
  sistemas: [
    { path: '/dashboard/sistemas',          label: 'Resumen del mes',   icon: '◎' },
    { path: '/dashboard/sistemas/ingresar', label: 'Registro diario',   icon: '✚' },
    { path: '/dashboard/sistemas/ga4',      label: 'Google Analytics',  icon: '📈' },
    { path: '/dashboard/sistemas/comparar', label: 'Comparar meses',    icon: '⇄' },
  ],
  gerencia: [
    { path: '/dashboard/gerencia',              label: 'Vista general',       icon: '◎' },
    { path: '/dashboard/gerencia/jornadas',     label: 'Jornadas médicas',    icon: '🏥' },
    { path: '/dashboard/gerencia/ganancias',    label: 'Ganancias / Excel',   icon: '💹' },
    { path: '/dashboard/gerencia/comparar',     label: 'Comparar meses',      icon: '⇄' },
  ],
}

/* Module accent colours (hex) */
const MODULE_COLORS = {
  social:   { hex: '#7DD3FC', rgb: '125,211,252' },
  diseno:   { hex: '#93C5FD', rgb: '147,197,253' },
  sistemas: { hex: '#60A5FA', rgb: '96,165,250'  },
  gerencia: { hex: '#A5B4FC', rgb: '165,180,252' },
}

export default function DashboardLayout() {
  const { currentArea, exitArea, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!currentArea) {
    navigate('/areas')
    return null
  }

  const key   = currentArea.area_key
  const mod   = MODULE_COLORS[key] || MODULE_COLORS.sistemas
  const hex   = mod.hex
  const rgb   = mod.rgb
  const navItems = NAV_ITEMS[key] || []

  const now = new Date()
  const monthLabel = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'transparent',
      position: 'relative',
    }}>

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(32px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
        borderRight: `1px solid var(--border)`,
        boxShadow: `1px 0 0 rgba(${rgb},0.08)`,
        zIndex: 20,
      }}>

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${hex}, transparent)`,
          opacity: 0.7,
        }} />

        {/* Logo */}
        <div style={{
          padding: '28px 20px 18px',
          borderBottom: `1px solid rgba(${rgb},0.10)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 18, filter: `drop-shadow(0 0 6px ${hex}88)` }}>▦</span>
            <span style={{
              fontWeight: 700, fontSize: '1rem',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>MetricHub</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
          }}>
            {monthLabel}
          </div>
        </div>

        {/* Area badge */}
        <div style={{
          margin: '14px 12px',
          padding: '10px 14px',
          background: `rgba(${rgb},0.10)`,
          border: `1px solid rgba(${rgb},0.22)`,
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: `0 4px 16px rgba(${rgb},0.08)`,
        }}>
          <span style={{ fontSize: 18 }}>{currentArea.icono}</span>
          <div>
            <div style={{
              fontSize: '0.78rem', fontWeight: 700,
              color: hex, lineHeight: 1.2,
              letterSpacing: '-0.2px',
            }}>{currentArea.area_nombre}</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}>área activa</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto' }}>
          <div style={{
            fontSize: '0.58rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 700,
            padding: '0 8px',
            marginBottom: 8,
          }}>Navegación</div>

          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: isActive ? `1px solid rgba(${rgb},0.25)` : '1px solid transparent',
                  marginBottom: 2,
                  background: isActive ? `rgba(${rgb},0.12)` : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  cursor: 'pointer',
                  borderLeft: isActive ? `2px solid ${hex}` : '2px solid transparent',
                  boxShadow: isActive ? `0 2px 12px rgba(${rgb},0.12)` : 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <span style={{ fontSize: '0.85rem', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{
          padding: '12px',
          borderTop: `1px solid rgba(${rgb},0.10)`,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <button
            onClick={exitArea}
            style={{
              width: '100%',
              padding: '9px 12px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.18s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.background = `rgba(${rgb},0.1)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            ⇦ Cambiar área
          </button>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '9px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.73rem',
              textAlign: 'left',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'color 0.18s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0436a'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ✕ Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────── */}
      <main style={{
        flex: 1, minWidth: 0,
        overflowY: 'auto',
        background: 'transparent',
      }}>

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--topbar-bg)',
          backdropFilter: 'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          borderBottom: `1px solid var(--border)`,
          padding: '13px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: `0 1px 0 var(--border)`,
        }}>
          <div style={{
            height: 8, width: 8, borderRadius: '50%',
            background: hex,
            boxShadow: `0 0 10px ${hex}`,
            marginRight: 12,
            animation: 'pulse-glow 2s ease infinite',
          }} />
          <div style={{ flex: 1 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              fontWeight: 700,
            }}>
              {currentArea.icono} {currentArea.area_nombre.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}>
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'short', day: '2-digit',
                month: 'short', year: 'numeric'
              })}
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
