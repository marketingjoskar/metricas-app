import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const color = '#9b59f7'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getPeriodo(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`
}
function formatMoney(n) {
  if (!n && n !== 0) return '—'
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 })
}

function StatCard({ label, value, icon, c, sub, delay = 0 }) {
  return (
    <div className="animate-fadeUp" style={{
      animationDelay: `${delay}s`,
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c, opacity: 0.7 }} />
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 600, color: c, letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function SectionHeader({ title, linkLabel, onClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</h2>
      {linkLabel && (
        <button onClick={onClick} style={{ background: 'none', border: 'none', color: color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
          {linkLabel} →
        </button>
      )}
    </div>
  )
}

export default function GerenciaDashboardPage() {
  const now = new Date()
  const navigate = useNavigate()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  useEffect(() => { loadAll() }, [year, month])

  async function loadAll() {
    setLoading(true)
    const periodo = getPeriodo(year, month)

    const [
      { data: jornadas },
      { data: ganancias },
      { data: diseno },
      { data: ga4 },
      { data: sistemas },
    ] = await Promise.all([
      supabase.from('jornadas_medicas').select('id,nombre,fecha,gasto_total,tipo_apoyo').eq('periodo', periodo).order('fecha', { ascending: false }),
      supabase.from('ganancias_estrategia').select('*').eq('periodo', periodo).order('ingresos', { ascending: false }),
      supabase.from('diseno_grafico_diario').select('total_flyers,video,fotos_producto').eq('periodo', periodo),
      supabase.from('ga4_metrics').select('sesiones,usuarios_activos,pageviews').eq('periodo', periodo).maybeSingle(),
      supabase.from('sistemas_diario').select('incidencias_resueltas').eq('periodo', periodo),
    ])

    // Aggregate
    const totalGastoJornadas = (jornadas || []).reduce((s, j) => s + (j.gasto_total || 0), 0)
    const totalIngresos      = (ganancias || []).reduce((s, g) => s + (g.ingresos || 0), 0)
    const totalFlyers        = (diseno || []).reduce((s, d) => s + (d.total_flyers || 0), 0)
    const totalIncidencias   = (sistemas || []).reduce((s, s2) => s + (s2.incidencias_resueltas || 0), 0)

    setData({
      jornadas: jornadas || [],
      ganancias: ganancias || [],
      totalGastoJornadas,
      totalIngresos,
      totalFlyers,
      totalIncidencias,
      ga4: ga4 || null,
      disenosDias: (diseno || []).length,
    })
    setLoading(false)
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 4 }}>Vista ejecutiva</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Gerencia · resumen consolidado del mes</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => { if (month===0){setYear(y=>y-1);setMonth(11)}else setMonth(m=>m-1) }}
            style={{ width:34,height:34,borderRadius:8,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:'var(--text-secondary)',fontSize:'1rem',cursor:'pointer' }}>‹</button>
          <span style={{ fontFamily:'var(--font-mono)',fontSize:'0.82rem',color:'var(--text-primary)',minWidth:130,textAlign:'center' }}>{MONTHS_ES[month]} {year}</span>
          <button onClick={() => { if(isCurrentMonth)return; if(month===11){setYear(y=>y+1);setMonth(0)}else setMonth(m=>m+1) }}
            disabled={isCurrentMonth} style={{ width:34,height:34,borderRadius:8,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:isCurrentMonth?'var(--text-muted)':'var(--text-secondary)',fontSize:'1rem',cursor:isCurrentMonth?'not-allowed':'pointer' }}>›</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-bright)', borderTopColor: color, animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Top KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard label="Ingresos del mes"        value={formatMoney(data.totalIngresos)}   icon="💵" c="#10b981" delay={0} />
            <StatCard label="Gasto en jornadas"       value={formatMoney(data.totalGastoJornadas)} icon="💰" c="#f59e0b" delay={0.05} />
            <StatCard label="Jornadas médicas"        value={data.jornadas.length}              icon="🏥" c={color}    delay={0.1} />
            <StatCard label="Productos en estrategia" value={data.ganancias.length}             icon="📊" c="#3b82f6"  delay={0.15} />
          </div>

          {/* 2-col: ganancias top + jornadas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

            {/* Top ganancias */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>TOP ESTRATEGIAS</span>
                <button onClick={() => navigate('/dashboard/gerencia/ganancias')} style={{ background: 'none', border: 'none', color: color, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Ver todo →</button>
              </div>
              {data.ganancias.length === 0 ? (
                <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Sin datos — <button onClick={() => navigate('/dashboard/gerencia/ganancias')} style={{ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>importar Excel</button>
                </div>
              ) : (
                <div style={{ padding: '12px 0' }}>
                  {data.ganancias.slice(0, 5).map((g, i) => {
                    const total = data.totalIngresos
                    const pct = total > 0 ? (g.ingresos / total * 100) : 0
                    return (
                      <div key={g.id} style={{ padding: '9px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 18, textAlign: 'right' }}>{i+1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{g.nombre_estrategia}</div>
                          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#10b981', borderRadius: 99 }} />
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#10b981', flexShrink: 0 }}>{formatMoney(g.ingresos)}</span>
                      </div>
                    )
                  })}
                  {data.ganancias.length > 5 && (
                    <div style={{ padding: '8px 20px', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      + {data.ganancias.length - 5} más
                    </div>
                  )}
                  <div style={{ margin: '8px 20px 4px', paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>{formatMoney(data.totalIngresos)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Jornadas recientes */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>JORNADAS MÉDICAS</span>
                <button onClick={() => navigate('/dashboard/gerencia/jornadas')} style={{ background: 'none', border: 'none', color, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Ver todo →</button>
              </div>
              {data.jornadas.length === 0 ? (
                <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Sin jornadas este mes — <button onClick={() => navigate('/dashboard/gerencia/jornadas')} style={{ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>registrar</button>
                </div>
              ) : (
                <div style={{ padding: '10px 0' }}>
                  {data.jornadas.slice(0, 4).map((j) => (
                    <div key={j.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.nombre}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                            {j.fecha?.slice(8)}/{j.fecha?.slice(5,7)}
                          </div>
                        </div>
                        {j.gasto_total > 0 && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>{formatMoney(j.gasto_total)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.jornadas.length > 4 && (
                    <div style={{ padding: '8px 20px', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      + {data.jornadas.length - 4} más
                    </div>
                  )}
                  <div style={{ margin: '4px 20px', paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Gasto total</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>{formatMoney(data.totalGastoJornadas)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cross-area KPIs */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
            <SectionHeader title="Resumen otras áreas" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {[
                { label: 'Flyers creados', value: data.totalFlyers || '—', icon: '🎨', c: '#0eb8d4', sub: 'Diseño Gráfico' },
                { label: 'Sesiones web', value: data.ga4?.sesiones?.toLocaleString('es-AR') || '—', icon: '🌐', c: '#10b981', sub: 'Sistemas / GA4' },
                { label: 'Usuarios activos', value: data.ga4?.usuarios_activos?.toLocaleString('es-AR') || '—', icon: '👤', c: '#8b5cf6', sub: 'Sistemas / GA4' },
                { label: 'Incidencias resueltas', value: data.totalIncidencias || '—', icon: '🔧', c: '#f5c518', sub: 'Sistemas' },
              ].map((k, i) => (
                <div key={i} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 8 }}>{k.icon}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 600, color: k.c, marginBottom: 4 }}>{k.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{k.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
