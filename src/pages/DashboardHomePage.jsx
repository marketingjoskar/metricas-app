import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

/* ── helpers ──────────────────────────────────────────────────────────────── */
function hexToRGB(hex) {
  if (!hex) return '125,211,252'
  const h = hex.replace('#', '')
  if (h.length !== 6) return '125,211,252'
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}

/* ── Glass stat card ──────────────────────────────────────────────────────── */
function StatCard({ label, value, unit = '', color, icon, delay = 0 }) {
  return (
    <div
      className="animate-fadeUp"
      style={{
        animationDelay: `${delay}s`,
        position: 'relative', overflow: 'hidden',
        borderRadius: 24, padding: '32px 24px',
        background: '#111827', // Dark navy
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'all 0.4s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ 
          fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, 
          letterSpacing: '0.12em', textTransform: 'uppercase' 
        }}>{label}</div>
        <div style={{ 
          fontSize: 18, color: color, opacity: 0.8,
          filter: `drop-shadow(0 0 8px ${color}44)` 
        }}>{icon}</div>
      </div>

      <div style={{
        fontSize: '2.8rem', fontWeight: 700,
        color: '#fff', letterSpacing: '-1.5px', lineHeight: 1,
        marginBottom: 8,
      }}>
        {value}<span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: 6, color: 'rgba(255,255,255,0.3)' }}>{unit}</span>
      </div>
    </div>
  )
}

/* ── Glass CTA card (empty state) ─────────────────────────────────────────── */
function CtaCard({ color, rgb, icon, message, label, onClick }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 24, padding: '40px 32px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.1)',
      textAlign: 'center',
    }}>
      {icon && <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>}
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24, fontSize: '1rem', fontWeight: 400 }}>
        {message}
      </p>
      <button
        onClick={onClick}
        style={{
          padding: '12px 32px',
          background: 'var(--accent)',
          border: 'none',
          borderRadius: 14,
          color: '#080d21',
          fontSize: '0.9rem', fontWeight: 700,
          boxShadow: '0 8px 25px rgba(59,130,246,0.3)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(59,130,246,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.3)'
        }}
      >
        {label}
      </button>
    </div>
  )
}

/* ── Page title component ──────────────────────────────────────────────────── */
function PageTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h1 style={{
        fontSize: '3rem', fontWeight: 700, letterSpacing: '-1px', color: '#fff', marginBottom: 8
      }}>{title}</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', fontWeight: 400 }}>{subtitle}</p>
    </div>
  )
}

// ─── SOCIAL MEDIA ─────────────────────────────────────────────────────────────
export function SocialDashboard() {
  const { currentArea } = useAuth()
  const navigate = useNavigate()
  const color = currentArea?.color || '#7DD3FC'
  const rgb   = hexToRGB(color)

  return (
    <div className="animate-fadeIn">
      <PageTitle
        title="Social Media"
        subtitle="Resumen del mes en curso · Instagram & Campañas"
        color={color}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        <StatCard label="Seguidores totales" value="—" icon="👥" color={color} delay={0}    />
        <StatCard label="Nuevos seguidores"  value="—" icon="📈" color={color} delay={0.06} />
        <StatCard label="Engagement rate"    value="—" unit="%" icon="💬" color={color} delay={0.12} />
        <StatCard label="Alcance mensual"    value="—" icon="🌐" color={color} delay={0.18} />
        <StatCard label="Leads generados"    value="—" icon="🎯" color={color} delay={0.24} />
      </div>

      <CtaCard
        color={color} rgb={rgb}
        message="Aún no hay datos para este mes. Ingresá las métricas para verlas reflejadas aquí."
        label="✚ Ingresar métricas del mes →"
        onClick={() => navigate('/dashboard/social/ingresar')}
      />
    </div>
  )
}

// ─── DISEÑO GRÁFICO ───────────────────────────────────────────────────────────
export function DisenoDashboard() {
  const { currentArea } = useAuth()
  const navigate = useNavigate()
  const color = currentArea?.color || '#93C5FD'
  const rgb   = hexToRGB(color)

  return (
    <div className="animate-fadeIn">
      <PageTitle
        title="Diseño Gráfico"
        subtitle="Producción mensual · Flyers, video y fotografía"
        color={color}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        <StatCard label="Flyers totales"    value="0" icon="🎨" color={color} delay={0}    />
        <StatCard label="Stories"           value="0" icon="📱" color={color} delay={0.06} />
        <StatCard label="Efemérides"        value="0" icon="📅" color={color} delay={0.12} />
        <StatCard label="Colabs. en video"  value="0" icon="🎬" color={color} delay={0.18} />
        <StatCard label="Fotos de producto" value="0" icon="📸" color={color} delay={0.24} />
      </div>

      <CtaCard
        color={color} rgb={rgb}
        message="Registrá el trabajo de hoy para acumular las métricas del mes."
        label="✚ Registro de hoy →"
        onClick={() => navigate('/dashboard/diseno/ingresar')}
      />
    </div>
  )
}

// ─── SISTEMAS ─────────────────────────────────────────────────────────────────
export function SistemasDashboard() {
  const { currentArea } = useAuth()
  const navigate = useNavigate()
  const color = currentArea?.color || '#60A5FA'
  const rgb   = hexToRGB(color)

  return (
    <div className="animate-fadeIn">
      <PageTitle
        title="Sistemas / Web"
        subtitle="Incidencias, Google Analytics y gestión de imágenes"
        color={color}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        <StatCard label="Incidencias resueltas" value="0" icon="🔧" color={color} delay={0}    />
        <StatCard label="Sesiones web (GA4)"    value="—" icon="🌐" color={color} delay={0.06} />
        <StatCard label="Usuarios únicos"        value="—" icon="👤" color={color} delay={0.12} />
        <StatCard label="Imgs. con código"       value="0" icon="🏷️" color={color} delay={0.18} />
        <StatCard label="Imgs. optimizadas"      value="0" icon="⚡" color={color} delay={0.24} />
      </div>

      <CtaCard
        color={color} rgb={rgb}
        message="Registrá las actividades de hoy para llevar el historial mensual."
        label="✚ Registro de hoy →"
        onClick={() => navigate('/dashboard/sistemas/ingresar')}
      />
    </div>
  )
}

// ─── GERENCIA ─────────────────────────────────────────────────────────────────
export function GerenciaDashboard() {
  const { currentArea } = useAuth()
  const navigate = useNavigate()
  const color = currentArea?.color || '#A5B4FC'
  const rgb   = hexToRGB(color)

  return (
    <div className="animate-fadeIn">
      <PageTitle
        title="Gerencia / Contabilidad"
        subtitle="Vista ejecutiva · Jornadas médicas y ganancias por estrategia"
        color={color}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        <StatCard label="Jornadas este mes"   value="0"  icon="🏥" color={color} delay={0}    />
        <StatCard label="Gasto total jornadas" value="$0" icon="💰" color={color} delay={0.06} />
        <StatCard label="Estrategias activas"  value="0"  icon="📊" color={color} delay={0.12} />
        <StatCard label="Ingresos del mes"     value="$0" icon="💹" color={color} delay={0.18} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
      }}>
        <CtaCard
          color={color} rgb={rgb} icon="🏥"
          message="Registrar nueva jornada médica"
          label="Nueva jornada →"
          onClick={() => navigate('/dashboard/gerencia/jornadas')}
        />
        <CtaCard
          color={color} rgb={rgb} icon="📂"
          message="Importar Excel de ganancias del mes"
          label="Importar Excel →"
          onClick={() => navigate('/dashboard/gerencia/ganancias')}
        />
      </div>
    </div>
  )
}
