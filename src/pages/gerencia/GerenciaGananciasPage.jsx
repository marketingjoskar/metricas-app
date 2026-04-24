import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Legend, Cell, ComposedChart, Line
} from 'recharts'

const accentColor = '#C084FC' // Purple 400 - Gerencia Theme
const secondaryColor = '#F59E0B' // Amber 500 - Secondary
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function formatMoney(n) {
  if (!n && n !== 0) return '—'
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 })
}

export default function GerenciaGananciasPage() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(lastDay)
  const [providerId, setProviderId] = useState('')
  const [minDiscount, setMinDiscount] = useState('')
  const [providers, setProviders] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => { 
    loadProviders()
    loadData() 
  }, [])

  async function loadProviders() {
    try {
      const res = await fetch('/api/erp/providers')
      if (res.ok) {
        const data = await res.json()
        setProviders(data)
      }
    } catch (err) {
      console.error('Error loading providers:', err)
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(providerId && { providerId }),
        ...(minDiscount && { minDiscount })
      })
      
      const res = await fetch(`/api/erp/campaigns?${params.toString()}`)
      if (!res.ok) throw new Error('Error al obtener datos del servidor backend')
      const result = await res.json()
      setCampaigns(result.data || [])
    } catch (err) {
      console.error(err)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSyncErp() {
    setSyncing(true)
    await loadData()
    setTimeout(() => setSyncing(false), 800)
  }

  const handleApplyFilters = (e) => {
    e.preventDefault()
    loadData()
  }

  // Agrupar por semanas — ya vienen filtrados: solo proveedores con descu3 > 1
  const weeksMap = campaigns.reduce((acc, curr) => {
    const key = curr.monday_date || curr.semana;
    if (!acc[key]) acc[key] = { label: curr.semana, items: [] }
    acc[key].items.push({
      name:     `${curr.marca} (${curr.descuento_label || curr.descuento_promedio + '%'})`,
      ventas:    curr.ventas_netas,
      unidades:  curr.unidades,
      descuento: curr.descuento_max || curr.descuento_promedio,
      dMin:      curr.descuento_min,
      dMax:      curr.descuento_max,
    })
    return acc
  }, {})

  // Ordenar llaves de semanas cronológicamente y luego datos internos por ventas
  const sortedWeekKeys = Object.keys(weeksMap).sort()
  sortedWeekKeys.forEach(w => {
    weeksMap[w].items.sort((a,b) => b.ventas - a.ventas)
  })

  // Correlation Data
  const correlationData = campaigns
    .filter(c => c.descuento_promedio > 0)
    .map(c => ({
      x: c.descuento_promedio, // Descuento en el eje X
      y: c.ventas_netas,       // Ventas en el eje Y
      z: c.unidades,           // Tamaño de burbuja por unidades
      name: c.marca
    }))

  // Agrupar por proveedor (comportamiento mensual total)
  const providerSalesMap = campaigns.reduce((acc, curr) => {
    if (!acc[curr.marca]) acc[curr.marca] = 0
    acc[curr.marca] += curr.ventas_netas
    return acc
  }, {})

  const providerSalesData = Object.keys(providerSalesMap)
    .map(key => ({ name: key, ventas: providerSalesMap[key] }))
    .sort((a,b) => b.ventas - a.ventas)
    .slice(0, 10) // Top 10 proveedores del mes

  const totalIngresos = campaigns.reduce((s, c) => s + c.ventas_netas, 0)
  const totalDescuentosDados = campaigns.reduce((s, c) => s + (c.descuento_usd || 0), 0)

  // Una estrategia activa es una combinación única de marca y descuento (> 0) en el mes
  const estrategiasActivas = new Set(
    campaigns.filter(c => c.descuento_promedio > 0).map(c => `${c.marca}-${c.descuento_promedio}`)
  ).size

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ 
          fontSize:'2.5rem', fontWeight: 900, letterSpacing:'-2px', marginBottom:4,
          background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.55))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Filtro Inteligente de Campañas
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 500, marginBottom: 24 }}>
          Analiza el rendimiento comercial cruzando proveedores, fechas y descuentos.
        </p>

        {/* Filter Bar */}
        <form 
          onSubmit={handleApplyFilters}
          style={{ 
            background: 'var(--glass-bg)', 
            backdropFilter: 'blur(32px)', 
            border: '1px solid var(--glass-border)',
            borderRadius: 24,
            padding: '24px',
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Proveedor</label>
            <select 
              value={providerId} 
              onChange={e => setProviderId(e.target.value)}
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', 
                borderRadius: 12, padding: '10px 16px', color: '#fff', outline: 'none' 
              }}
            >
              <option value="" style={{ background: '#1a1a1a' }}>Todos los proveedores</option>
              {providers.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#1a1a1a' }}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Desde</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', 
                borderRadius: 12, padding: '10px 16px', color: '#fff', outline: 'none' 
              }} 
            />
          </div>

          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Hasta</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', 
                borderRadius: 12, padding: '10px 16px', color: '#fff', outline: 'none' 
              }} 
            />
          </div>

          <div style={{ width: 120 }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Desc. Mín</label>
            <input 
              type="number" 
              placeholder="%" 
              value={minDiscount} 
              onChange={e => setMinDiscount(e.target.value)}
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', 
                borderRadius: 12, padding: '10px 16px', color: '#fff', outline: 'none' 
              }} 
            />
          </div>

          <button 
            type="submit"
            style={{
              padding: '12px 24px', background: `linear-gradient(135deg, ${accentColor}, #818CF8)`,
              border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, cursor: 'pointer',
              boxShadow: `0 4px 12px ${accentColor}33`, height: 44
            }}
          >
            APLICAR FILTROS
          </button>

          <button 
            type="button"
            onClick={handleSyncErp}
            disabled={syncing}
            style={{
              width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)', color: accentColor, cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <span className={syncing ? "animate-spin" : ""} style={{ fontSize: '1.2rem' }}>↻</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:120 }}>
          <div className="animate-spin" style={{ width:48, height:48, borderRadius:'50%', border:'4px solid rgba(255,255,255,0.1)', borderTopColor: accentColor }} />
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ 
          textAlign:'center', padding:'80px 40px', border:`2px dashed rgba(255,255,255,0.1)`, 
          borderRadius:32, background:'var(--glass-bg)', backdropFilter: 'blur(32px) saturate(1.8)', WebkitBackdropFilter: 'blur(32px) saturate(1.8)', boxShadow:'var(--glass-shadow)'
        }}>
          <div style={{ fontSize:64, marginBottom:24, filter: 'grayscale(1) opacity(0.5)' }}>📊</div>
          <h2 style={{ color:'#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom:8 }}>Cero Registros</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'1rem', marginBottom:32, maxWidth: 400, marginInline: 'auto' }}>
            No se han sincronizado ventas ni descuentos para el periodo {MONTH_NAMES[month]} {year}.
          </p>
        </div>
      ) : (
        <div className="animate-fadeUp">
          
          {/* Main KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:20, marginBottom:40 }}>
            {[
              { label:'Facturación Consolidada', value:formatMoney(totalIngresos), icon:'💵', c:'#10B981' },
              { label:'Costo de Promoción', value:formatMoney(totalDescuentosDados), icon:'📉', c:'#F43F5E' },
              { label:'Estrategias Activas', value:estrategiasActivas, icon:'🎯', c:accentColor },
              { label:'Eficiencia (ROI Promocional)', value: totalDescuentosDados > 0 ? ((totalIngresos / totalDescuentosDados)).toFixed(1) + 'x' : 'N/A', icon:'⚖️', c:'#FDBA74' },
            ].map((k,i) => (
              <div key={i} className="animate-fadeUp" style={{
                animationDelay:`${i*0.1}s`, background:'var(--glass-bg)',
                backdropFilter: 'blur(32px) saturate(1.8)', WebkitBackdropFilter: 'blur(32px) saturate(1.8)', border:'1px solid var(--border)',
                borderRadius:24, padding:'28px', position:'relative', overflow:'hidden',
                boxShadow:'var(--glass-shadow)', transition: 'all 0.3s'
              }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:k.c, opacity:0.8 }} />
                <div style={{ fontSize:28, marginBottom:16, filter: `drop-shadow(0 0 8px ${k.c}44)` }}>{k.icon}</div>
                <div style={{ 
                  fontFamily:'var(--font-mono)', fontSize:'1.8rem', fontWeight: 900, 
                  color:'#fff', letterSpacing:'-1px', lineHeight:1, marginBottom:8 
                }}>{k.value}</div>
                <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Gráfico de comportamiento por semanas */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 32, marginBottom: 40, background: 'var(--glass-bg)', backdropFilter: 'blur(28px)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 32, letterSpacing: '-0.5px', color: '#fff' }}>Rendimiento de las estrategias por Semana</h2>
            
            {sortedWeekKeys.map(week => (
              <div key={week} style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: accentColor, marginBottom: 16 }}>{weeksMap[week].label}</h3>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={weeksMap[week].items} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickFormatter={v => '$'+(v/1000).toFixed(0)+'k'} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(32px)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--glass-shadow)', color: '#fff' }} 
                        itemStyle={{ fontWeight: 800 }} 
                        formatter={(value, name) => [name === 'ventas' ? formatMoney(value) : value, name === 'ventas' ? 'Facturación' : 'Descuento %']}
                      />
                      <Bar dataKey="ventas" name="ventas" radius={[8, 8, 0, 0]} maxBarSize={60}>
                       {weeksMap[week].items.map((entry, i) => (
                         <Cell key={`cell-${i}`} fill={entry.descuento > 10 ? '#10B981' : entry.descuento > 5 ? secondaryColor : accentColor} />
                       ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Analytics: Correlación Descuento vs Facturación */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr)', gap: 32, marginBottom: 40 }}>
            {correlationData.length > 0 && (
              <div className="glass-panel" style={{ padding: '32px', borderRadius: 32, background: 'var(--glass-bg)', backdropFilter: 'blur(28px)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.5px', color: '#fff' }}>Correlación Promocional (Dispersión)</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 24 }}>Distribución de facturación en función de la profundidad del descuento otorgado.</p>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" dataKey="x" name="Descuento" stroke="rgba(255,255,255,0.5)" tickFormatter={v => v + '%'} />
                      <YAxis type="number" dataKey="y" name="Facturación" stroke="rgba(255,255,255,0.5)" tickFormatter={v => '$'+(v/1000).toFixed(0)+'k'} />
                      <ZAxis type="number" dataKey="z" range={[50, 400]} name="Unidades" />
                      <Tooltip 
                        cursor={{strokeDasharray: '3 3'}}
                        contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 12 }} 
                        wrapperStyle={{ color: '#fff' }}
                        formatter={(val, name, props) => [name === 'Facturación' ? formatMoney(val) : val + (name==='Descuento'?'%':''), name]}
                      />
                      <Scatter name="Estrategias" data={correlationData} fill={secondaryColor} opacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Ventas Consolidadas por Proveedor */}
            {providerSalesData.length > 0 && (
              <div className="glass-panel" style={{ padding: '32px', borderRadius: 32, background: 'var(--glass-bg)', backdropFilter: 'blur(28px)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.5px', color: '#fff' }}>Top Facturación Mensual por Proveedor</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 24 }}>Ventas totales acumuladas en el mes actual.</p>
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart layout="vertical" data={providerSalesData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="rgba(255,255,255,0.2)" tickFormatter={v => '$'+(v/1000).toFixed(0)+'k'} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.6)" fontSize={11} width={80} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(32px)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--glass-shadow)', color: '#fff' }} 
                        itemStyle={{ fontWeight: 800 }} 
                        formatter={(value) => [formatMoney(value), 'Total Facturado']}
                      />
                      <Bar dataKey="ventas" radius={[0, 8, 8, 0]} maxBarSize={30}>
                        {providerSalesData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={i < 3 ? '#10B981' : accentColor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
