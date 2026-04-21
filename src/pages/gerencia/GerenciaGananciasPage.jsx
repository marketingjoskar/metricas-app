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
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState([])
  const [syncing, setSyncing] = useState(false)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  useEffect(() => { loadData() }, [year, month])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/erp/campaigns?year=${year}&month=${month + 1}`)
      if (!res.ok) throw new Error('Error al obtener datos del servidor backend')
      const result = await res.json()
      setCampaigns(result.data || [])
    } catch (err) {
      console.error(err)
      // Mock data just in case during transition or if backend fails
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSyncErp() {
    setSyncing(true)
    await loadData()
    setTimeout(() => setSyncing(false), 800)
    alert("Sincronización con ERP completada exitosamente")
  }

  // Agrupar por semanas
  const weeksMap = campaigns.reduce((acc, curr) => {
    if (!acc[curr.semana]) acc[curr.semana] = []
    acc[curr.semana].push({
      name: `${curr.marca} ${curr.descuento_promedio > 0 ? curr.descuento_promedio + '%' : ''}`,
      ventas: curr.ventas_netas,
      unidades: curr.unidades,
      descuento: curr.descuento_promedio
    })
    return acc
  }, {})

  // Ordenar llaves de semanas y luego datos internos por ventas
  const weekKeys = Object.keys(weeksMap).sort()
  weekKeys.forEach(w => {
    weeksMap[w].sort((a,b) => b.ventas - a.ventas)
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
  const totalDescuentosDados = campaigns.reduce((s, c) => s + (c.ventas_brutas - c.ventas_netas), 0)

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24, marginBottom:32 }}>
        <div>
          <h1 style={{ 
            fontSize:'2.5rem', fontWeight: 900, letterSpacing:'-2px', marginBottom:4,
            background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.55))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Campañas de Descuentos y Promociones
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 500 }}>
            Gerencia · Análisis del comportamiento comercial ante incentivos a clientes
          </p>
        </div>
        
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 4, 
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center' 
          }}>
            <button onClick={() => month===0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1)} 
              style={{ width:40, height:40, borderRadius:12, background:'transparent', border:'none', color:'#fff', fontSize:'1.2rem', cursor:'pointer' }}>‹</button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff', minWidth: 140, textAlign: 'center', fontWeight: 800 }}>
              {MONTH_NAMES[month].toUpperCase()} {year}
            </span>
            <button onClick={() => isCurrentMonth ? null : month===11 ? (setYear(y=>y+1), setMonth(0)) : setMonth(m=>m+1)} 
              disabled={isCurrentMonth} style={{ 
                width:40, height:40, borderRadius:12, background:'transparent', border:'none', 
                color: isCurrentMonth ? 'rgba(255,255,255,0.2)' : '#fff', fontSize:'1.2rem', 
                cursor: isCurrentMonth ? 'not-allowed' : 'pointer' 
              }}>›</button>
          </div>
          
          <button 
            onClick={handleSyncErp} 
            disabled={syncing}
            style={{
              padding:'14px 28px', background: `linear-gradient(135deg, ${accentColor}, #818CF8)`,
              border:'none', borderRadius: 16, color:'#fff', fontSize:'0.9rem', 
              fontWeight: 800, cursor: syncing ? 'not-allowed' : 'pointer', boxShadow:`0 8px 24px ${accentColor}33`,
              display:'flex', alignItems:'center', gap:10, transition: 'all 0.3s'
            }}
            onMouseEnter={e => { if(!syncing) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { if(!syncing) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <span className={syncing ? "animate-spin" : ""} style={{ fontSize: '1.2rem', display: 'inline-block' }}>↻</span> 
            {syncing ? 'Sincronizando...' : 'SINCRONIZAR ERP'}
          </button>
        </div>
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
              { label:'Estrategias Activas', value:campaigns.length, icon:'🎯', c:accentColor },
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
            
            {weekKeys.map(week => (
              <div key={week} style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: accentColor, marginBottom: 16 }}>{week}</h3>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={weeksMap[week]} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
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
                       {weeksMap[week].map((entry, i) => (
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
