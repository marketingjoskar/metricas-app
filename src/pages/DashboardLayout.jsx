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
          padding: '32px 24px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent)',
              borderRadius: 8,
              boxShadow: '0 4px 12px var(--accent-glow)',
            }}>
              <span style={{ fontSize: 18, color: '#fff' }}>▦</span>
            </div>
            <span style={{
              fontWeight: 700, fontSize: '1.25rem',
              letterSpacing: '-0.5px',
              color: '#fff',
            }}>MetricHub</span>
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            marginTop: 8,
            fontWeight: 500,
          }}>
            {now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 14px', overflowY: 'auto' }}>
          <div style={{
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
            fontWeight: 700,
            padding: '0 12px',
            marginBottom: 16,
          }}>Navegación</div>

          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: 'none',
                  marginBottom: 4,
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = '#fff'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, background: 'var(--accent)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 10px var(--accent)',
                  }} />
                )}
                <span style={{ fontSize: '1rem', opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
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
          backdropFilter: 'blur(32px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 18, color: 'var(--accent)', opacity: 0.8 }}>{currentArea.icono}</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)',
            }}>
              <span>{currentArea.area_nombre.toUpperCase()}</span>
              <span>/</span>
              <span style={{ color: '#fff' }}>
                {(navItems.find(i => i.path === location.pathname)?.label || 'RESUMEN').toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}>
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'short', day: '2-digit', month: 'short'
              })}
            </div>
            
            <button style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 12px var(--accent-glow)',
            }}>
              <span style={{ fontSize: 16 }}>+</span> Registrar hoy
            </button>

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
