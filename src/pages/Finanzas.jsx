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

// Modal detalle de un día del historial
function DetalleDia({ dia, onClose }) {
  if (!dia) return null
  const fecha = new Date(dia.fecha)
  const nombreDia = fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  const balance = dia.ganado - dia.gastado

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 28 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, textTransform: 'capitalize' }}>{nombreDia}</div>
        </div>

        <div style={{ background: 'var(--purple-light)', borderRadius: 14, padding: 13, marginBottom: 12, border: '1px solid var(--purple-mid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Domicilios hechos</span>
            <span style={{ fontWeight: 800, color: 'var(--purple)' }}>{dia.domis} domis</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Total ganado</span>
            <span style={{ fontWeight: 800, color: 'var(--green)' }}>{fmt(dia.ganado)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Total gastado</span>
            <span style={{ fontWeight: 800, color: 'var(--red)' }}>{fmt(dia.gastado)}</span>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Balance del día</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(balance)}</span>
          </div>
        </div>

        {dia.movimientos && dia.movimientos.length > 0 && (
          <div className="card">
            <div className="card-title">Movimientos del día</div>
            {dia.movimientos.map((m, i) => (
              <div className="list-item" key={i}>
                <div className="li-left">
                  <span>{m.tipo === 'propina' ? '🪙' : m.monto > 0 ? '✅' : '🔴'}</span>
                  {m.desc}
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: m.monto >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {m.monto >= 0 ? '+' : '-'}{fmt(Math.abs(m.monto))}
                </span>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}

// Wrapped del mes
function WrappedMes({ state, ganado, gastadoMesTotal, onClose }) {
  const historial = state.historialMensual || []
  const mejorDia = historial.length > 0 ? historial.reduce((a, b) => a.ganado > b.ganado ? a : b) : null
  const peorDia = historial.length > 0 ? historial.reduce((a, b) => a.ganado < b.ganado ? a : b) : null
  const diasTrabajados = historial.filter(d => d.domis > 0).length
  const totalDomis = historial.reduce((a, d) => a + d.domis, 0)
  const promedioDiario = diasTrabajados > 0 ? Math.round(ganado / diasTrabajados) : 0
  const g = state.gastosMes || { gas: 0, comida: 0, datos: 0, otros: 0 }
  const mayorGasto = Object.entries(g).sort((a, b) => b[1] - a[1])[0]
  const nombreGasto = { gas: 'Gasolina', comida: 'Comida', datos: 'Datos/Plan', otros: 'Otros' }
  const mes = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  const maxGanado = Math.max(...historial.map(d => d.ganado), 1)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh', overflowY: 'auto', background: 'linear-gradient(135deg, #534AB7 0%, #7c6fef 100%)', borderRadius: '24px 24px 0 0' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Tu mes en resumen</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'capitalize' }}>{mes}</div>
        </div>

        {/* Total ganado */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, marginBottom: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Ganaste este mes</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{fmt(ganado)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{totalDomis} domicilios en {diasTrabajados} días</div>
        </div>

        {/* Mejor y peor día */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>🏆</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 4 }}>MEJOR DÍA</div>
            {mejorDia ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{fmt(mejorDia.ganado)}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                  {new Date(mejorDia.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                </div>
              </>
            ) : <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>—</div>}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>📉</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 4 }}>DÍA MÁS FLOJO</div>
            {peorDia ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{fmt(peorDia.ganado)}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                  {new Date(peorDia.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                </div>
              </>
            ) : <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>—</div>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 13, marginBottom: 12 }}>
          {[
            ['💰', 'Promedio por día trabajado', fmt(promedioDiario)],
            ['🛵', 'Total domicilios', totalDomis + ' domis'],
            ['⬇️', 'Total gastado', fmt(gastadoMesTotal)],
            ['📊', 'Mayor gasto', mayorGasto && mayorGasto[1] > 0 ? nombreGasto[mayorGasto[0]] : '—'],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                <span>{icon}</span>{label}
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Gráfica de barras del mes */}
        {historial.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 13, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.6px' }}>Ganancias por día</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
              {historial.slice(-20).map((d, i) => {
                const h = Math.max(3, Math.round((d.ganado / maxGanado) * 55))
                const esMejor = mejorDia && d.fecha === mejorDia.fecha
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: '100%', height: h, borderRadius: '3px 3px 0 0', background: esMejor ? '#FFD700' : 'rgba(255,255,255,0.5)' }} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Motivación */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 13, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
            {ganado >= 2000000
              ? '🎯 Cumpliste la meta! Eso es disciplina pura, Luis Rubén!'
              : ganado >= 1000000
              ? '💪 Más de un millón! Vas por buen camino bro!'
              : '🔥 Cada domi cuenta. El próximo mes lo rompes!'}
          </div>
        </div>

        <button className="btn btn-full" style={{ background: '#fff', color: 'var(--purple)', fontWeight: 800 }} onClick={onClose}>
          Cerrar resumen
        </button>
      </div>
    </div>
  )
}

function Calendario({ onVerDia }) {
  const { state, dispatch } = useApp()
  const hoy = new Date()
  const mes = hoy.getMonth(), anio = hoy.getFullYear(), dia = hoy.getDate()
  const primerDia = new Date(anio, mes, 1).getDay()
  const diasMes = new Date(anio, mes + 1, 0).getDate()
  const offset = primerDia === 0 ? 6 : primerDia - 1
  const dias = ['L','M','X','J','V','S','D']
  const historial = state.historialMensual || []

  const marcarDia = (d, estadoActual) => {
    const key = `${anio}-${mes+1}-${d}`
    let nuevo
    if (estadoActual === undefined) nuevo = true
    else if (estadoActual === true) nuevo = 'off'
    else nuevo = undefined
    dispatch({ type: 'SET_CAL_DIA', payload: { fecha: key, cumplido: nuevo } })
  }

  const getDiaDatos = (d) => {
    const fechaStr = new Date(anio, mes, d).toDateString()
    return historial.find(h => h.fecha === fechaStr)
  }

  return (
    <div className="card">
      <div className="card-title">Calendario del mes</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 8 }}>
        Toca un día pasado para ver el detalle o marcarlo
      </div>
      <div className="cal-header">{dias.map(d => <div key={d}>{d}</div>)}</div>
      <div className="cal-grid">
        {Array(offset).fill(null).map((_, i) => <div key={'e'+i} className="cal-day" style={{ background: 'transparent' }} />)}
        {Array(diasMes).fill(null).map((_, i) => {
          const d = i + 1
          const key = `${anio}-${mes+1}-${d}`
          const val = state.calendario[key]
          const tieneDatos = getDiaDatos(d)
          let cls = 'cal-day'
          let style = {}

          if (d === dia) cls += ' today'
          else if (d < dia) {
            if (tieneDatos) {
              // Si tiene datos del historial, verde o rojo según si ganó algo
              cls += tieneDatos.ganado > 0 ? ' good' : ' bad'
            } else if (val === true) cls += ' good'
            else if (val === false) cls += ' bad'
            else if (val === 'off') style = { background: '#f0f0f3', color: '#bbb' }
            style.cursor = 'pointer'
          }

          return (
            <div key={d} className={cls} style={style}
              onClick={() => {
                if (d >= dia) return
                const datos = getDiaDatos(d)
                if (datos) {
                  onVerDia(datos)
                } else {
                  marcarDia(d, val)
                }
              }}>
              {val === 'off' && d < dia ? '—' : d}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        {[['#eaf3de','✅ Trabajé'],['#fcebeb','❌ Sin ingresos'],['#f0f0f3','— No trabajé'],['#534AB7','Hoy']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Finanzas() {
  const { state, dispatch, ganado, ganadoHoy, gastadoHoy, gastadoMesTotal, totalGastosFijos } = useApp()
  const [showAddFijo, setShowAddFijo] = useState(false)
  const [fijoNombre, setFijoNombre] = useState('')
  const [fijoMonto, setFijoMonto] = useState('')
  const [fijoIcono, setFijoIcono] = useState('💰')
  const [diaDetalle, setDiaDetalle] = useState(null)
  const [showWrapped, setShowWrapped] = useState(false)

  const generarPDF = () => {
    const mes = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    const historial = state.historialMensual || []
    const g = state.gastosMes || { gas: 0, comida: 0, datos: 0, otros: 0 }
    const gastosTot = { gas: (g.gas||0)+(state.gastosPorCategoria?.gas||0), comida: (g.comida||0)+(state.gastosPorCategoria?.comida||0), datos: (g.datos||0)+(state.gastosPorCategoria?.datos||0), otros: (g.otros||0)+(state.gastosPorCategoria?.otros||0) }
    const mejorDia = historial.length > 0 ? historial.reduce((a, b) => a.ganado > b.ganado ? a : b, historial[0]) : null
    const diasTrabajados = historial.filter(d => d.domis > 0).length
    const totalDomis = historial.reduce((a, d) => a + d.domis, 0)
    const fmt2 = n => '$' + Math.round(n).toLocaleString('es-CO')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DomiAyuda - Informe ${mes}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e; }
      h1 { color: #534AB7; text-align: center; font-size: 24px; margin-bottom: 4px; }
      .subtitle { text-align: center; color: #888; font-size: 13px; margin-bottom: 24px; text-transform: capitalize; }
      .seccion { background: #f5f5f7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      .seccion h2 { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 12px; }
      .fila { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #e8e8e8; font-size: 14px; }
      .fila:last-child { border-bottom: none; }
      .verde { color: #2ea86a; font-weight: 700; }
      .rojo { color: #d94040; font-weight: 700; }
      .morado { color: #534AB7; font-weight: 700; }
      .destacado { background: #534AB7; color: white; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 16px; }
      .destacado .num { font-size: 32px; font-weight: 800; }
      .footer { text-align: center; color: #aaa; font-size: 11px; margin-top: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #534AB7; color: white; padding: 8px; text-align: left; }
      td { padding: 7px 8px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) td { background: #fafafa; }
    </style></head><body>
    <h1>🛵 DomiAyuda</h1>
    <div class="subtitle">Informe mensual — ${mes}</div>
    <div class="destacado">
      <div style="font-size:13px;opacity:.8;margin-bottom:4px">TOTAL GANADO EN EL MES</div>
      <div class="num">${fmt2(ganado)}</div>
      <div style="font-size:13px;opacity:.8;margin-top:4px">${totalDomis} domicilios en ${diasTrabajados} días trabajados</div>
    </div>
    <div class="seccion"><h2>Resumen general</h2>
      <div class="fila"><span>Total ganado</span><span class="verde">${fmt2(ganado)}</span></div>
      <div class="fila"><span>Total gastado</span><span class="rojo">${fmt2(gastadoMesTotal)}</span></div>
      <div class="fila"><span>Gastos fijos (arriendo + moto)</span><span class="rojo">${fmt2(totalGastosFijos)}</span></div>
      <div class="fila"><span>Promedio diario</span><span class="morado">${fmt2(diasTrabajados > 0 ? ganado/diasTrabajados : 0)}</span></div>
      <div class="fila"><span>Total domicilios</span><span class="morado">${totalDomis}</span></div>
      <div class="fila"><span>Días trabajados</span><span class="morado">${diasTrabajados}</span></div>
      ${mejorDia ? `<div class="fila"><span>🏆 Mejor día</span><span class="verde">${fmt2(mejorDia.ganado)} — ${new Date(mejorDia.fecha).toLocaleDateString('es-CO',{day:'numeric',month:'long'})}</span></div>` : ''}
      <div class="fila"><span>Para ahorrar (40%)</span><span class="morado">${fmt2(ganado*0.4)}</span></div>
      <div class="fila"><span>Neto disponible</span><span class="${ganado-gastadoMesTotal-totalGastosFijos>=0?'verde':'rojo'}">${fmt2(Math.max(0,ganado-gastadoMesTotal-totalGastosFijos))}</span></div>
    </div>
    <div class="seccion"><h2>En qué gasté mi plata</h2>
      <div class="fila"><span>⛽ Gasolina</span><span class="rojo">${fmt2(gastosTot.gas)}</span></div>
      <div class="fila"><span>🍽️ Comida</span><span class="rojo">${fmt2(gastosTot.comida)}</span></div>
      <div class="fila"><span>📱 Datos/Plan</span><span class="rojo">${fmt2(gastosTot.datos)}</span></div>
      <div class="fila"><span>🔧 Otros</span><span class="rojo">${fmt2(gastosTot.otros)}</span></div>
    </div>
    ${historial.length > 0 ? `<div class="seccion"><h2>Historial por día</h2>
    <table><thead><tr><th>Fecha</th><th>Domis</th><th>Ganado</th><th>Gastado</th></tr></thead><tbody>
    ${historial.map(d => `<tr><td>${new Date(d.fecha).toLocaleDateString('es-CO',{day:'numeric',month:'short'})}</td><td>${d.domis}</td><td style="color:#2ea86a;font-weight:600">${fmt2(d.ganado)}</td><td style="color:#d94040;font-weight:600">${fmt2(d.gastado)}</td></tr>`).join('')}
    </tbody></table></div>` : ''}
    <div class="footer">Generado por DomiAyuda • ${new Date().toLocaleDateString('es-CO')}</div>
    </body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DomiAyuda-Informe-${mes.replace(' ','_')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const g = state.gastosPorCategoria
  const gMes = state.gastosMes || { gas: 0, comida: 0, datos: 0, otros: 0 }
  // Sumar gastos de hoy + acumulado del mes
  const gastosTotales = {
    gas: (gMes.gas || 0) + (g.gas || 0),
    comida: (gMes.comida || 0) + (g.comida || 0),
    datos: (gMes.datos || 0) + (g.datos || 0),
    otros: (gMes.otros || 0) + (g.otros || 0),
  }

  const donutData = [
    { val: gastosTotales.gas, color: '#534AB7' },
    { val: gastosTotales.comida, color: '#2ea86a' },
    { val: gastosTotales.datos, color: '#c07c10' },
    { val: gastosTotales.otros, color: '#bbb' },
  ]

  const hoy = new Date()
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  const diaActual = hoy.getDate()
  const ritmo = diaActual > 0 ? (ganado / diaActual) * diasMes : 0
  const pctProj = Math.min(100, (ritmo / state.metaMensual) * 100)
  const esUltimoDia = diaActual === diasMes

  const maxSem = Math.max(...state.semActual, ...state.semAnterior, 1)
  const diasSem = ['L','M','X','J','V','S','D']
  const disponible = ganado - gastadoMesTotal - totalGastosFijos

  const agregarFijo = () => {
    const m = parseFloat(fijoMonto)
    if (!fijoNombre.trim() || isNaN(m) || m <= 0) return
    dispatch({ type: 'ADD_GASTO_FIJO', payload: { nombre: fijoNombre.trim(), monto: m, icono: fijoIcono } })
    setFijoNombre(''); setFijoMonto(''); setFijoIcono('💰'); setShowAddFijo(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-head" style={{ marginBottom: 0 }}>Mis finanzas</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={generarPDF}>📄 PDF</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowWrapped(true)}>🎉 Ver mes</button>
        </div>
      </div>

      {/* Banner último día */}
      {esUltimoDia && (
        <div className="banner banner-purple" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => setShowWrapped(true)}>
          <span className="banner-icon">🎊</span>
          <span className="banner-text">Es el último día del mes! Toca para ver tu resumen completo</span>
        </div>
      )}

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

      {/* Gastos fijos */}
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
              <button style={{ border: 'none', background: 'var(--red-light)', color: 'var(--red)', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontWeight: 800, fontSize: 14 }}
                onClick={() => dispatch({ type: 'REMOVE_GASTO_FIJO', payload: g.id })}>×</button>
            </div>
          </div>
        ))}
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Total comprometido</span>
          <span style={{ fontWeight: 800, color: 'var(--red)' }}>{fmt(totalGastosFijos)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Semana actual vs anterior</div>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'RESET_SEMANA' })}>Limpiar</button>
        </div>
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

      {/* Torta gastos */}
      <div className="card">
        <div className="card-title">En qué gasto mi plata (mes)</div>
        <div className="donut-wrap">
          <DonutChart data={donutData} />
          <div className="donut-legend">
            {[['#534AB7','Gasolina',gastosTotales.gas],['#2ea86a','Comida',gastosTotales.comida],['#c07c10','Datos/Plan',gastosTotales.datos],['#bbb','Otros',gastosTotales.otros]].map(([c,l,v]) => (
              <div className="legend-row" key={l}>
                <div className="legend-dot" style={{ background: c }} />
                <span style={{ flex: 1 }}>{l}</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historial gastos hoy */}
      <div className="card">
        <div className="card-title">Gastos de hoy</div>
        {state.historialGastos.length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: 8, fontWeight: 600 }}>Sin gastos hoy</div>
          : state.historialGastos.map(h => (
            <div className="list-item" key={h.id}>
              <div className="li-left"><span className="li-icon">🧾</span>{h.desc}</div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>{fmt(h.monto)}</span>
            </div>
          ))
        }
      </div>

      {/* Informe mensual */}
      <div className="card">
        <div className="card-title">📊 Informe del mes — {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</div>
        {[
          ['Días transcurridos', `${diaActual} de ${diasMes}`, 'var(--purple)'],
          ['Total ganado', fmt(ganado), 'var(--green)'],
          ['Total gastado', fmt(gastadoMesTotal), 'var(--red)'],
          ['Gastos fijos mes', fmt(totalGastosFijos), 'var(--red)'],
          ['Promedio diario', fmt(diaActual > 0 ? ganado / diaActual : 0), 'var(--purple)'],
          ['Proyección fin de mes', fmt(ritmo), ritmo >= state.metaMensual ? 'var(--green)' : 'var(--amber)'],
          ['Para ahorrar (40%)', fmt(ganado * 0.4), 'var(--purple)'],
          ['Neto disponible', fmt(Math.max(0, ganado - gastadoMesTotal - totalGastosFijos)), disponible >= 0 ? 'var(--green)' : 'var(--red)'],
        ].map(([l, v, c]) => (
          <div className="list-item" key={l}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{l}</span>
            <span style={{ fontWeight: 800, color: c }}>{v}</span>
          </div>
        ))}
        <div className="divider" />
        <div style={{ background: ritmo >= state.metaMensual ? 'var(--green-light)' : 'var(--amber-light)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ritmo >= state.metaMensual ? '#27500A' : '#633806' }}>
            {ritmo >= state.metaMensual
              ? `🎉 Vas a cumplir tu meta de ${fmt(state.metaMensual)}!`
              : `⚡ Te faltan ${fmt(state.metaMensual - ganado)} para la meta — sigue!`}
          </div>
        </div>
      </div>

      {/* Calendario con detalle */}
      <Calendario onVerDia={setDiaDetalle} />

      {/* Modales */}
      {diaDetalle && <DetalleDia dia={diaDetalle} onClose={() => setDiaDetalle(null)} />}
      {showWrapped && <WrappedMes state={state} ganado={ganado} gastadoMesTotal={gastadoMesTotal} onClose={() => setShowWrapped(false)} />}

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
