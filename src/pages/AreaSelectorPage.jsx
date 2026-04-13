import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

import { 
  Share2, 
  Palette, 
  Cpu, 
  BarChart3, 
  ArrowLeft,
  LayoutGrid
} from 'lucide-react'

const AREA_ROUTES = {
  social:   '/dashboard/social',
  diseno:   '/dashboard/diseno',
  sistemas: '/dashboard/sistemas',
  gerencia: '/dashboard/gerencia',
}

const AREA_IMAGES = {
  social:   'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
  diseno:   'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800',
  sistemas: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
  gerencia: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
}

const AREA_ICONS = {
  social:   Share2,
  diseno:   Palette,
  sistemas: Cpu,
  gerencia: BarChart3,
}

/* ─── PIN Modal ───────────────────────────────────────────── */
function PinInput({ area, onCancel }) {
  const [pin, setPin]         = useState('')
  const [error, setError]     = useState(false)
  const [loading, setLoading] = useState(false)
  const { validatePin, selectArea } = useAuth()
  const navigate  = useNavigate()
  const shakeRef  = useRef(null)

  useEffect(() => {
    if (pin.length === 4) submit(pin)
  }, [pin])

  async function submit(currentPin) {
    setLoading(true)
    const result = await validatePin(area.area_key, currentPin)
    setLoading(false)
    if (result) {
      selectArea(result)
      navigate(AREA_ROUTES[area.area_key] || '/dashboard')
    } else {
      // shake animation
      if (shakeRef.current) {
        shakeRef.current.style.animation = 'none'
        void shakeRef.current.offsetHeight          // reflow
        shakeRef.current.style.animation = 'pinShake 0.45s ease'
      }
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 2500)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading) return
      if (e.key >= '0' && e.key <= '9') setPin(p => (p.length < 4 ? p + e.key : p))
      else if (e.key === 'Backspace')   setPin(p => p.slice(0, -1))
      else if (e.key === 'Escape')      onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, onCancel])

  const accentRGB = hexToRGB(area.color) || '99,130,246'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* blurred backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      {/* glass card */}
      <div ref={shakeRef} style={{
        position: 'relative',
        width: '92%', maxWidth: 320,
        padding: '36px 24px 28px',
        borderRadius: 32,
        background: 'rgba(15, 23, 42, 0.95)', // Slightly more opaque for smaller size
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 40, marginBottom: 12,
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))',
            color: area.color
          }}>
            <AreaIcon areaKey={area.area_key} size={48} />
          </div>
          <h2 style={{
            fontSize: '1.4rem', fontWeight: 700,
            letterSpacing: '-0.5px', color: '#fff', marginBottom: 6,
          }}>
            {area.area_nombre}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 400 }}>
            Ingresá tu PIN de 4 dígitos
          </p>
        </div>

        {/* PIN dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 32 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: pin.length > i ? '#fff' : 'transparent',
              border: `1.5px solid ${pin.length > i ? '#fff' : 'rgba(255,255,255,0.2)'}`,
              transition: 'all 0.15s ease',
              boxShadow: pin.length > i ? '0 0 10px #fff' : 'none',
            }} />
          ))}
        </div>

        {/* Numpad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <PinButton key={n} label={n} color={area.color} accentRGB={accentRGB}
              onClick={() => !loading && setPin(p => p.length < 4 ? p + String(n) : p)} />
          ))}
          {/* row: cancel / 0 / backspace */}
          <button onClick={onCancel} style={{
            padding: '14px', background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.3)', fontSize: '1rem', cursor: 'pointer',
            borderRadius: 14, transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >✕</button>
          <PinButton label="0" color={area.color} accentRGB={accentRGB}
            onClick={() => !loading && setPin(p => p.length < 4 ? p + '0' : p)} />
          <button onClick={() => !loading && setPin(p => p.slice(0, -1))} style={{
            padding: '14px', background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', cursor: 'pointer',
            borderRadius: 14, transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >⌫</button>
        </div>

        {/* Feedback */}
        <div style={{ minHeight: 28, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {error && (
            <p style={{
              color: '#ff6b8a', textAlign: 'center', fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: '0.9rem' }}>✕</span> PIN incorrecto
            </p>
          )}
          {loading && (
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: `2px solid ${area.color}44`,
              borderTopColor: area.color,
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
        </div>
      </div>
    </div>
  )
}

function AreaIcon({ areaKey, size = 24 }) {
  const Icon = AREA_ICONS[areaKey] || LayoutGrid
  return <Icon size={size} />
}

/* Shared numpad button */
function PinButton({ label, color, accentRGB, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        color: '#fff',
        fontSize: '1.2rem', fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(.22,1,.36,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
        e.currentTarget.style.transform = 'scale(1.04)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)' }}
    >
      {label}
    </button>
  )
}

/* helper – convert hex colour like "#7DD3FC" → "125,211,252" */
function hexToRGB(hex) {
  if (!hex) return null
  const h = hex.replace('#','')
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0,2),16)
  const g = parseInt(h.slice(2,4),16)
  const b = parseInt(h.slice(4,6),16)
  return `${r},${g},${b}`
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function AreaSelectorPage() {
  const { areas, loading, logout } = useAuth()
  const [selectedArea, setSelectedArea] = useState(null)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative',
      background: 'transparent',
      overflow: 'hidden' // Prevent scroll
    }}>

      {/* ── Centered container ── */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: 1000, 
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        justifyContent: 'center'
      }}>

        {/* Header - More compact */}
        <div className="animate-fadeUp" style={{ textAlign: 'center', marginBottom: 'clamp(16px, 4vh, 32px)' }}>
          <p style={{
            fontSize: '0.7rem', letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: 800,
            marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <LayoutGrid size={14} /> METRICHUB
          </p>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.75rem)',
            fontWeight: 700,
            letterSpacing: '-1.5px',
            color: '#fff',
            marginBottom: 6, lineHeight: 1.1,
          }}>
            Seleccioná tu área
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', fontWeight: 400 }}>
            Panel de control avanzado
          </p>
        </div>

        {/* Responsive Grid */}
        <div style={{
          display: 'grid',
          // 4 columns on large screens, 2 columns on mobile/tablet to avoid overflow
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(160px, 20vw, 220px), 1fr))',
          gap: 'clamp(12px, 2vw, 20px)', 
          marginBottom: 'clamp(20px, 4vh, 32px)',
          width: '100%',
          justifyContent: 'center'
        }}>
          {areas.map((area, i) => (
            <AreaCard key={area.id} area={area} delay={i * 0.09}
              onSelect={() => setSelectedArea(area)} />
          ))}
        </div>

        {/* Logout - Compact */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={logout} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em', cursor: 'pointer',
            transition: 'color 0.25s',
            padding: '6px 12px',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
          >
            <ArrowLeft size={12} /> Salir
          </button>
        </div>
      </div>

      {/* PIN modal */}
      {selectedArea && (
        <PinInput area={selectedArea} onCancel={() => setSelectedArea(null)} />
      )}
    </div>
  )
}

/* ─── Area glass card ─────────────────────────────────────── */
function AreaCard({ area, delay, onSelect }) {
  const accentRGB = hexToRGB(area.color) || '125,211,252'

  return (
    <button
      className="animate-fadeUp area-card"
      onClick={onSelect}
      style={{
        animationDelay: `${delay}s`,
        '--card-accent': accentRGB,
        '--card-color': area.color,
        position: 'relative', overflow: 'hidden',
        borderRadius: 'clamp(20px, 3vw, 28px)',
        padding: 0,
        textAlign: 'left', cursor: 'pointer',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--glass-shadow)',
        transition: 'all 0.4s cubic-bezier(.16,1,.3,1)',
        aspectRatio: '1 / 1', // Perfect square to save vertical space
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)'
        e.currentTarget.style.borderColor = `rgba(${accentRGB},0.5)`
        e.currentTarget.style.boxShadow = `0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(${accentRGB},0.2)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'var(--glass-shadow)'
      }}
    >
      {/* Top half with Image - Height reduced to 40% */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        overflow: 'hidden'
      }}>
        <img 
          src={AREA_IMAGES[area.area_key]} 
          alt="" 
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'brightness(0.75) contrast(1.1)',
            transition: 'transform 0.6s ease',
          }}
          className="card-image"
        />
        {/* Label - Smaller */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          padding: '3px 8px', borderRadius: 6,
          fontSize: '0.6rem', fontWeight: 700, color: '#fff',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          APP
        </div>
      </div>

      {/* Bottom section with Notch divider - Height increased to 68% for overlap */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '68%',
        background: 'var(--bg-surface)',
        clipPath: 'polygon(0% 24px, 45% 24px, 55% 0%, 100% 0%, 100% 100%, 0% 100%)',
        padding: 'clamp(24px, 5vh, 32px) clamp(16px, 3vw, 24px) clamp(16px, 3vh, 24px)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'background 0.3s ease',
      }}>
        <div>
          {/* Main Module Name - Adjusted position */}
          <div style={{
            position: 'absolute', top: -3, left: 'clamp(16px, 3vw, 24px)',
            fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px'
          }}>
            {area.area_nombre}
          </div>

          <div style={{ marginTop: 'clamp(8px, 2vh, 12px)' }}>
            <p style={{ 
              fontSize: '0.65rem', color: 'var(--text-muted)', 
              marginBottom: 'clamp(8px, 2vh, 12px)', fontWeight: 500 
            }}>
              {area.area_key === 'gerencia' ? 'Control & Análisis' : 'Métricas & Gestión'}
            </p>
            
            {/* Visual Icon - More compact */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: area.color
            }}>
              <div style={{
                width: 'clamp(32px, 5vw, 40px)', 
                height: 'clamp(32px, 5vw, 40px)', 
                borderRadius: 12,
                background: `rgba(${accentRGB}, 0.1)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 15px rgba(${accentRGB}, 0.05)`
              }}>
                <AreaIcon areaKey={area.area_key} size={18} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Panel v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Stats footer - More compact */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          borderTop: '1px solid var(--border)', paddingTop: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {area.area_key === 'social' ? '24' : area.area_key === 'sistemas' ? '12' : '08'}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              METRICS
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              ESTADO: OK
            </span>
          </div>
        </div>
      </div>

    </button>
  )
}
