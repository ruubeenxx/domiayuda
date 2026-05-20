import { useRef, useEffect, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

function DonutChart({ data }) {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    const total = data.reduce((a, d) => a + d.val, 0)
    ctx.clearRect(0, 0, 90, 90)
    if (total === 0) {
      ctx.beginPath(); ctx.arc(45, 45, 35, 0, Math.PI * 2)
      ctx.strokeStyle = '#f0f0f3'; ctx.lineWidth = 10; ctx.stroke(); return
    }
    let start = -Math.PI / 2
    data.forEach(({ val, color }) => {
      if (!val) return
      const slice = (val / total) * Math.PI * 2
      ctx.beginPath(); ctx.moveTo(45, 45)
      ctx.arc(45, 45, 38, start, start + slice)
      ctx.closePath(); ctx.fillStyle = color; ctx.fill()
      start += slice
    })
    ctx.beginPath(); ctx.arc(45, 45, 26, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
  }, [data])
  return <canvas ref={ref} width={90} height={90} />
}

function Calendario() {
  const { state } = useApp()
  const hoy = new Date()
  const mes = hoy.getMonth(), anio = hoy.getFullYear(), dia = hoy.getDate()
  const primerDia = new Date(anio, mes, 1).getDay()
  const diasMes = new Date(anio, mes + 1, 0).getDate()
  const offset = primerDia === 0 ? 6 : primerDia - 1
  const dias = ['L','M','X','J','V','S','D']

  return (
    <div className="card">
      <div className="card-title">Calendario del mes</div>
      <div className="cal-header">{dias.map(d => <div key={d}>{d}</div>)}</div>
      <div className="cal-grid">
        {Array(offset).fill(null).map((_, i) => <div key={'e'+i} className="cal-day" style={{ background: 'transparent' }} />)}
        {Array(diasMes).fill(null).map((_, i) => {
          const d = i + 1
          const key = `${anio}-${mes+1}-${d}`
          let cls = 'cal-day'
          if (d === dia) cls += ' today'
          else if (d < dia) {
            const val = state.calendario[key]
            if (val === true) cls += ' good'
            else if (val === false) cls += ' bad'
            else cls += Math.random() > 0.35 ? ' good' : ' bad'
          }
          return <div key={d} className={cls}>{d}</div>
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        {[['#eaf3de','Meta cumplida'],['#fcebeb','No cumplida'],['#534AB7','Hoy']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Finanzas() {
  const { state, dispatch, ganado, gastadoHoy } = useApp()
  const [showAddFijo, setShowAddFijo] = useState(false)
  const [fijoNombre, setFijoNombre] = useState('')
  const [fijoMonto, setFijoMonto] = useState('')
  const [fijoIcono, setFijoIcono] = useState('💰')

  const g = state.gastosPorCategoria
  const donutData = [
    { val: g.gas, color: '#534AB7' },
    { val: g.comida, color: '#2ea86a' },
    { val: g.datos, color: '#c07c10' },
    { val: g.otros, color: '#bbb' },
  ]

  const hoy = new Date()
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  const diaActual = hoy.getDate()
  const ritmo = diaActual > 0 ? (ganado / diaActual) * diasMes : 0
  const pctProj = Math.min(100, (ritmo / state.metaMensual) * 100)

  const maxSem = Math.max(...state.semActual, ...state.semAnterior, 1)
  const diasSem = ['L','M','X','J','V','S','D']

  const totalFijos = state.gastosFijos.reduce((a, g) => a + g.monto, 0)
  const disponible = ganado - totalFijos

  const agregarFijo = () => {
    const m = parseFloat(fijoMonto)
    if (!fijoNombre.trim() || isNaN(m) || m <= 0) return
    dispatch({ type: 'ADD_GASTO_FIJO', payload: { nombre: fijoNombre.trim(), monto: m, icono: fijoIcono } })
    setFijoNombre(''); setFijoMonto(''); setFijoIcono('💰'); setShowAddFijo(false)
  }

  return (
    <div>
      <div className="section-head">Mis finanzas</div>

      {/* Proyección */}
      <div className="proj-card">
        <div style={{ fontSize: 10, color: '#3C3489', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 6, fontWeight: 700 }}>Proyección fin de mes</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--purple)' }}>{fmt(ritmo)}</div>
        <div style={{ fontSize: 11, color: '#7F77DD', marginTop: 3, fontWeight: 600 }}>
          {ritmo >= state.metaMensual ? '🎉 Vas a cumplir tu meta!' : 'Si sigues este ritmo...'}
        </div>
        <div className="progress-wrap" style={{ marginTop: 8 }}>
          <div className="pb" style={{ width: pctProj + '%' }} />
        </div>
      </div>

      {/* Gastos fijos mensuales */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Gastos fijos mensuales</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddFijo(true)}>+ Agregar</button>
        </div>
        {state.gastosFijos.map(g => (
          <div key={g.id} className="fijo-item">
            <div className="li-left"><span className="li-icon">{g.icono}</span>{g.nombre}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>{fmt(g.monto)}</span>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16 }}
                onClick={() => dispatch({ type: 'REMOVE_GASTO_FIJO', payload: g.id })}>×</button>
            </div>
          </div>
        ))}
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Total comprometido</span>
          <span style={{ fontWeight: 800, color: 'var(--red)' }}>{fmt(totalFijos)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Disponible real</span>
          <span style={{ fontWeight: 800, color: disponible >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(disponible)}</span>
        </div>
      </div>

      {/* División */}
      <div className="card">
        <div className="card-title">Cómo dividir lo que ganas</div>
        {[['🐷','Ahorro 40%',ganado*0.4,'var(--purple)'],['🏠','Gastos fijos 35%',ganado*0.35,'var(--green)'],['👛','Libre 25%',ganado*0.25,'var(--amber)']].map(([i,l,v,c]) => (
          <div className="list-item" key={l}>
            <div className="li-left"><span className="li-icon">{i}</span>{l}</div>
            <span style={{ fontWeight: 700, fontSize: 13, color: c }}>{fmt(v)}</span>
          </div>
        ))}
      </div>

      {/* Semana vs semana */}
      <div className="card">
        <div className="card-title">Semana actual vs anterior</div>
        <div className="week-compare">
          {diasSem.map((d, i) => {
            const h1 = Math.max(3, Math.round((state.semActual[i] / maxSem) * 44))
            const h2 = Math.max(3, Math.round((state.semAnterior[i] / maxSem) * 44))
            return (
              <div className="wc-col" key={d}>
                <div className="wc-bars">
                  <div className="wc-bar" style={{ height: h2, background: '#CECBF6' }} />
                  <div className="wc-bar" style={{ height: h1, background: 'var(--purple)' }} />
                </div>
                <div className="wc-label">{d}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          {[['var(--purple)','Esta semana',state.semActual.reduce((a,b)=>a+b,0)],['#CECBF6','Semana anterior',state.semAnterior.reduce((a,b)=>a+b,0)]].map(([c,l,v]) => (
            <div key={l}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text3)', fontWeight: 600, marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{fmt(v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Torta de gastos */}
      <div className="card">
        <div className="card-title">En qué gasto mi plata</div>
        <div className="donut-wrap">
          <DonutChart data={donutData} />
          <div className="donut-legend">
            {[['#534AB7','Gasolina',g.gas],['#2ea86a','Comida',g.comida],['#c07c10','Datos/Plan',g.datos],['#bbb','Otros',g.otros]].map(([c,l,v]) => (
              <div className="legend-row" key={l}>
                <div className="legend-dot" style={{ background: c }} />
                <span style={{ flex: 1 }}>{l}</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="card">
        <div className="card-title">Historial de gastos</div>
        {state.historialGastos.length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: 8, fontWeight: 600 }}>Sin gastos aún</div>
          : state.historialGastos.map(h => (
            <div className="list-item" key={h.id}>
              <div className="li-left"><span className="li-icon">🧾</span>{h.desc}</div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>{fmt(h.monto)}</span>
            </div>
          ))
        }
      </div>

      <Calendario />

      {/* Modal agregar gasto fijo */}
      {showAddFijo && (
        <div className="modal-overlay" onClick={() => setShowAddFijo(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Agregar gasto fijo</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {['🏠','🏍️','📱','💡','🛒','💰'].map(e => (
                <button key={e} onClick={() => setFijoIcono(e)}
                  style={{ fontSize: 20, background: fijoIcono === e ? 'var(--purple-light)' : 'transparent', border: '1px solid', borderColor: fijoIcono === e ? 'var(--purple)' : 'transparent', borderRadius: 8, padding: 4, cursor: 'pointer' }}>
                  {e}
                </button>
              ))}
            </div>
            <input className="inp" style={{ marginBottom: 8 }} value={fijoNombre} onChange={e => setFijoNombre(e.target.value)} placeholder="Nombre (ej: Arriendo)" />
            <input className="inp" style={{ marginBottom: 12 }} type="number" value={fijoMonto} onChange={e => setFijoMonto(e.target.value)} placeholder="Monto mensual" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowAddFijo(false)}>Cancelar</button>
              <button className="btn btn-primary btn-full" onClick={agregarFijo}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
