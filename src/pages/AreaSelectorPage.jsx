import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const AREA_ROUTES = {
  social:   '/dashboard/social',
  diseno:   '/dashboard/diseno',
  sistemas: '/dashboard/sistemas',
  gerencia: '/dashboard/gerencia',
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
          }}>
            {area.icono}
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
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative',
      background: 'transparent',
    }}>

      {/* ── Centered glass container ── */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 720, zIndex: 1 }}>

        {/* Header */}
        <div className="animate-fadeUp" style={{ textAlign: 'center', marginBottom: 'clamp(32px, 8vh, 52px)' }}>
          <p style={{
            fontSize: '0.75rem', letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: 800,
            marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>▦</span> METRICHUB
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 10vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-2px',
            color: '#fff',
            marginBottom: 10, lineHeight: 1.1,
          }}>
            Seleccioná tu área
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', fontWeight: 400 }}>
            Cada área tiene su propio PIN de acceso
          </p>
        </div>

        {/* Area cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16, marginBottom: 44,
        }}>
          {areas.map((area, i) => (
            <AreaCard key={area.id} area={area} delay={i * 0.09}
              onSelect={() => setSelectedArea(area)} />
          ))}
        </div>

        {/* Logout */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={logout} style={{
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em', cursor: 'pointer',
            transition: 'color 0.25s',
            padding: '6px 12px',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
          >
            ← Cerrar sesión
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
        borderRadius: 22,
        padding: '30px 26px 26px',
        textAlign: 'left', cursor: 'pointer',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(28px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
        border: `1px solid rgba(${accentRGB},0.3)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition: 'transform 0.35s cubic-bezier(.22,1,.36,1), border-color 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)'
        e.currentTarget.style.borderColor = `rgba(${accentRGB},0.5)`
        e.currentTarget.style.boxShadow = `0 24px 56px rgba(${accentRGB},0.22), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.borderColor = `rgba(${accentRGB},0.18)`
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)`
      }}
    >
      {/* top gradient accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${area.color}, transparent)`,
        opacity: 0.9,
      }} />

      {/* subtle inner glow at top-left corner */}
      <div style={{
        position: 'absolute', top: -40, left: -40,
        width: 120, height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRGB},0.18) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* icon */}
      <div style={{
        fontSize: 36, marginBottom: 16, lineHeight: 1,
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
      }}>
        {area.icono}
      </div>

      {/* name */}
      <h3 style={{
        fontSize: '1.05rem', fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.3px', marginBottom: 4,
        textShadow: '0 1px 6px rgba(0,0,0,0.4)',
      }}>
        {area.area_nombre}
      </h3>

      {/* PIN dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20 }}>
        {[0,1,2,3].map(d => (
          <div key={d} style={{
            width: 7, height: 7, borderRadius: '50%',
            border: `1.5px solid ${area.color}70`,
            background: 'transparent',
          }} />
        ))}
        <span style={{
          marginLeft: 6, fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          PIN requerido
        </span>
      </div>
    </button>
  )
}
