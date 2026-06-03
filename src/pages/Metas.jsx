import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

const FRECUENCIAS = [
  { value: 'diaria', label: 'Diaria', icon: '📅' },
  { value: 'semanal', label: 'Semanal', icon: '📆' },
  { value: 'mensual', label: 'Mensual', icon: '🗓️' },
]

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function calcularProximoPago(frecuencia, diaPago) {
  const hoy = new Date()
  if (frecuencia === 'diaria') return 'Todos los días'
  if (frecuencia === 'mensual') {
    const dia = parseInt(diaPago)
    if (!dia) return '—'
    const prox = new Date(hoy.getFullYear(), hoy.getMonth(), dia)
    if (prox <= hoy) prox.setMonth(prox.getMonth() + 1)
    return prox.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
  }
  if (frecuencia === 'semanal') {
    const diaIdx = DIAS_SEMANA.indexOf(diaPago)
    if (diaIdx === -1) return '—'
    const hoyIdx = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
    let diff = diaIdx - hoyIdx
    if (diff <= 0) diff += 7
    const prox = new Date(hoy)
    prox.setDate(hoy.getDate() + diff)
    return prox.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  }
  return '—'
}

function calcularTotalDeuda(cuota, frecuencia, totalCuotas) {
  if (!totalCuotas) return null
  return cuota * totalCuotas
}

function calcularLibera(cuota, frecuencia, cuotasPagadas, totalCuotas) {
  if (!totalCuotas) return null
  const restantes = totalCuotas - (cuotasPagadas || 0)
  if (frecuencia === 'diaria') return `${restantes} días`
  if (frecuencia === 'semanal') return `${restantes} semanas`
  if (frecuencia === 'mensual') return `${restantes} meses`
  return '—'
}

export default function Metas() {
  const { state, dispatch } = useApp()
  const [showMeta, setShowMeta] = useState(false)
  const [showDeuda, setShowDeuda] = useState(false)
  const [showAbonar, setShowAbonar] = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [metaNombre, setMetaNombre] = useState('')
  const [metaTotal, setMetaTotal] = useState('')
  const [metaIcono, setMetaIcono] = useState('🎯')
  const [deudaNombre, setDeudaNombre] = useState('')
  const [deudaCuota, setDeudaCuota] = useState('')
  const [deudaFrecuencia, setDeudaFrecuencia] = useState('mensual')
  const [deudaTotalCuotas, setDeudaTotalCuotas] = useState('')
  const [deudaDiaPago, setDeudaDiaPago] = useState('')
  const [abonoVal, setAbonoVal] = useState('')

  const agregarMeta = () => {
    const t = parseFloat(metaTotal)
    if (!metaNombre.trim() || isNaN(t) || t <= 0) return
    dispatch({ type: 'ADD_META', payload: { nombre: metaNombre.trim(), icono: metaIcono, meta: t, ahorrado: 0 } })
    setMetaNombre(''); setMetaTotal(''); setMetaIcono('🎯'); setShowMeta(false)
  }

  const agregarDeuda = () => {
    const c = parseFloat(deudaCuota)
    if (!deudaNombre.trim() || isNaN(c) || c <= 0) return
    const total = deudaTotalCuotas ? parseFloat(deudaTotalCuotas) : null
    dispatch({ type: 'ADD_DEUDA', payload: {
      nombre: deudaNombre.trim(),
      cuota: c,
      frecuencia: deudaFrecuencia,
      totalCuotas: total,
      cuotasPagadas: 0,
      diaPago: deudaDiaPago,
      total: total ? c * total : c * 12,
    }})
    setDeudaNombre(''); setDeudaCuota(''); setDeudaFrecuencia('mensual')
    setDeudaTotalCuotas(''); setDeudaDiaPago(''); setShowDeuda(false)
  }

  const abonar = () => {
    const v = parseFloat(abonoVal)
    if (isNaN(v) || v <= 0 || !showAbonar) return
    dispatch({ type: 'ABONAR_META', payload: { id: showAbonar, monto: v } })
    setAbonoVal(''); setShowAbonar(null)
  }

  const resetearMes = () => {
    dispatch({ type: 'RESET_MES' })
    setShowReset(false)
  }

  return (
    <div>
      <div className="section-head">Metas de ahorro</div>

      {state.metas.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>No tienes metas aún</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Agrega una para empezar a ahorrar</div>
        </div>
      )}

      {state.metas.map(m => {
        const pct = Math.min(100, (m.ahorrado / m.meta) * 100)
        const mesesFaltan = m.ahorrado < m.meta ? Math.ceil((m.meta - m.ahorrado) / 100000) : 0
        return (
          <div className="card" key={m.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{m.icono} {m.nombre}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className={`tag ${pct >= 100 ? 'tag-green' : 'tag-purple'}`}>{pct >= 100 ? '✅ Lograda' : 'en curso'}</span>
                <button onClick={() => dispatch({ type: 'DELETE_META', payload: m.id })}
                  style={{ border: 'none', background: 'var(--red-light)', color: 'var(--red)', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>×</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>
              <span>Progreso</span><span>{fmt(m.ahorrado)} / {fmt(m.meta)}</span>
            </div>
            <div className="progress-wrap"><div className="pb pb-green" style={{ width: pct + '%' }} /></div>
            {mesesFaltan > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, fontWeight: 600 }}>
                Faltan {fmt(m.meta - m.ahorrado)} · ~{mesesFaltan} meses ahorrando $100k/mes
              </div>
            )}
            <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => setShowAbonar(m.id)}>
              + Abonar
            </button>
          </div>
        )
      })}

      <button className="btn btn-primary btn-full" style={{ marginBottom: 20 }} onClick={() => setShowMeta(true)}>
        + Nueva meta
      </button>

      <div className="section-head">Mis deudas</div>

      {/* Cuadro resumen total deudas */}
      {state.deudas.length > 0 && (() => {
        const totalDebo = state.deudas.reduce((a, d) => {
          const cuotasRestantes = d.totalCuotas ? d.totalCuotas - (d.cuotasPagadas || 0) : 0
          return a + (d.cuota * cuotasRestantes)
        }, 0)
        const totalOriginal = state.deudas.reduce((a, d) => a + (d.cuota * (d.totalCuotas || 12)), 0)
        const totalPagado = totalOriginal - totalDebo
        const pct = totalOriginal > 0 ? Math.min(100, (totalPagado / totalOriginal) * 100) : 0
        return (
          <div style={{ background: 'var(--red-light)', borderRadius: 16, padding: 14, marginBottom: 12, border: '1px solid #f5c4b3' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#791F1F', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 10 }}>Resumen total de deudas</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Total que debes aún</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--red)' }}>{fmt(totalDebo)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Ya pagaste</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)' }}>{fmt(totalPagado)}</span>
            </div>
            <div className="progress-wrap">
              <div className="pb pb-green" style={{ width: pct + '%' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, fontWeight: 600, textAlign: 'right' }}>
              {Math.round(pct)}% pagado
            </div>
          </div>
        )
      })()}

      {state.deudas.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>No tienes deudas registradas</div>
        </div>
      )}

      {state.deudas.map(d => {
        const frecLabel = FRECUENCIAS.find(f => f.value === (d.frecuencia || 'mensual'))
        const proximoPago = calcularProximoPago(d.frecuencia || 'mensual', d.diaPago)
        const liberacion = calcularLibera(d.cuota, d.frecuencia || 'mensual', d.cuotasPagadas, d.totalCuotas)
        const totalDeuda = d.totalCuotas ? d.cuota * d.totalCuotas : d.total
        const cuotasRestantes = d.totalCuotas ? d.totalCuotas - (d.cuotasPagadas || 0) : null
        const hoy = new Date().toLocaleDateString('es-CO', { weekday: 'long' }).split(',')[0]
        const esHoyPago = (d.frecuencia === 'diaria') ||
          (d.frecuencia === 'semanal' && d.diaPago === hoy.charAt(0).toUpperCase() + hoy.slice(1))

        return (
          <div className="card" key={d.id} style={{ border: esHoyPago ? '2px solid var(--amber)' : '1px solid #f5c4b3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>💳 {d.nombre}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {esHoyPago && <span className="tag tag-amber">⚠️ Pagar hoy</span>}
                <span className="tag tag-red">activa</span>
                <button onClick={() => dispatch({ type: 'DELETE_DEUDA', payload: d.id })}
                  style={{ border: 'none', background: 'var(--red-light)', color: 'var(--red)', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>×</button>
              </div>
            </div>

            <div className="list-item">
              <div className="li-left">Cuota</div>
              <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>{fmt(d.cuota)} / {frecLabel?.label || 'mes'}</span>
            </div>
            <div className="list-item">
              <div className="li-left">Total deuda</div>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{fmt(totalDeuda)}</span>
            </div>
            {d.totalCuotas && (
              <div className="list-item">
                <div className="li-left">Cuotas</div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{d.cuotasPagadas || 0} de {d.totalCuotas} pagadas</span>
              </div>
            )}
            <div className="list-item">
              <div className="li-left">Próximo pago</div>
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--amber)', textAlign: 'right', maxWidth: '55%' }}>{proximoPago}</span>
            </div>
            {liberacion && (
              <div className="list-item">
                <div className="li-left">Te liberas en</div>
                <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>{liberacion}</span>
              </div>
            )}

            {/* Barra progreso si tiene cuotas */}
            {d.totalCuotas && (
              <div style={{ marginTop: 8 }}>
                <div className="progress-wrap">
                  <div className="pb pb-green" style={{ width: Math.min(100, ((d.cuotasPagadas||0)/d.totalCuotas)*100) + '%' }} />
                </div>
              </div>
            )}

            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
              onClick={() => dispatch({ type: 'PAGAR_CUOTA', payload: d.id })}>
              ✅ Registrar pago
            </button>
          </div>
        )
      })}

      <button className="btn btn-ghost btn-full" style={{ marginBottom: 20 }} onClick={() => setShowDeuda(true)}>+ Agregar deuda</button>

      {/* Reset mes */}
      <div className="divider" />
      <div style={{ marginTop: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 8 }}>¿Los datos del mes anterior no se resetearon?</div>
        <button className="btn btn-ghost btn-full" onClick={() => setShowReset(true)}>
          🔄 Resetear inicio de mes
        </button>
      </div>

      {/* Modal meta */}
      {showMeta && (
        <div className="modal-overlay" onClick={() => setShowMeta(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nueva meta de ahorro</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {['🎯','🏍️','📱','✈️','🏠','💻','👟','🎮'].map(e => (
                <button key={e} onClick={() => setMetaIcono(e)}
                  style={{ fontSize: 20, background: metaIcono === e ? 'var(--purple-light)' : 'transparent', border: '1px solid', borderColor: metaIcono === e ? 'var(--purple)' : 'transparent', borderRadius: 8, padding: 4, cursor: 'pointer' }}>
                  {e}
                </button>
              ))}
            </div>
            <input className="inp" style={{ marginBottom: 8 }} value={metaNombre} onChange={e => setMetaNombre(e.target.value)} placeholder="¿Para qué estás ahorrando?" />
            <input className="inp" style={{ marginBottom: 12 }} type="number" value={metaTotal} onChange={e => setMetaTotal(e.target.value)} placeholder="¿Cuánto necesitas?" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowMeta(false)}>Cancelar</button>
              <button className="btn btn-primary btn-full" onClick={agregarMeta}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal deuda */}
      {showDeuda && (
        <div className="modal-overlay" onClick={() => setShowDeuda(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-title">Agregar deuda</div>
            <input className="inp" style={{ marginBottom: 8 }} value={deudaNombre} onChange={e => setDeudaNombre(e.target.value)} placeholder="Nombre (ej: Banco, amigo...)" />

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Frecuencia de pago</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {FRECUENCIAS.map(f => (
                <button key={f.value} onClick={() => { setDeudaFrecuencia(f.value); setDeudaDiaPago('') }}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: '1.5px solid', borderColor: deudaFrecuencia === f.value ? 'var(--purple)' : '#e0e0e0', background: deudaFrecuencia === f.value ? 'var(--purple-light)' : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: deudaFrecuencia === f.value ? 'var(--purple)' : 'var(--text2)' }}>
                  {f.icon}<br/>{f.label}
                </button>
              ))}
            </div>

            <input className="inp" style={{ marginBottom: 8 }} type="number" value={deudaCuota} onChange={e => setDeudaCuota(e.target.value)}
              placeholder={`Valor de la cuota ${deudaFrecuencia === 'diaria' ? 'diaria' : deudaFrecuencia === 'semanal' ? 'semanal' : 'mensual'}`} />

            <input className="inp" style={{ marginBottom: 8 }} type="number" value={deudaTotalCuotas} onChange={e => setDeudaTotalCuotas(e.target.value)}
              placeholder={`Total de cuotas (ej: ${deudaFrecuencia === 'diaria' ? '30' : deudaFrecuencia === 'semanal' ? '4' : '12'})`} />

            {deudaFrecuencia === 'semanal' && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>¿Qué día de la semana pagas?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {DIAS_SEMANA.map(d => (
                    <button key={d} onClick={() => setDeudaDiaPago(d)}
                      style={{ padding: '5px 10px', borderRadius: 8, border: '1.5px solid', borderColor: deudaDiaPago === d ? 'var(--purple)' : '#e0e0e0', background: deudaDiaPago === d ? 'var(--purple-light)' : 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: deudaDiaPago === d ? 'var(--purple)' : 'var(--text2)' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {deudaFrecuencia === 'mensual' && (
              <input className="inp" style={{ marginBottom: 8 }} type="number" value={deudaDiaPago} onChange={e => setDeudaDiaPago(e.target.value)}
                placeholder="Día del mes que pagas (ej: 5, 15, 30)" />
            )}

            {deudaCuota && deudaTotalCuotas && (
              <div style={{ background: 'var(--purple-light)', borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>
                Total deuda: {fmt(parseFloat(deudaCuota) * parseFloat(deudaTotalCuotas))} en {deudaTotalCuotas} cuotas de {fmt(parseFloat(deudaCuota))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowDeuda(false)}>Cancelar</button>
              <button className="btn btn-primary btn-full" onClick={agregarDeuda}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal abonar */}
      {showAbonar && (
        <div className="modal-overlay" onClick={() => setShowAbonar(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Abonar a meta</div>
            <input className="inp" style={{ marginBottom: 12 }} type="number" value={abonoVal} onChange={e => setAbonoVal(e.target.value)} placeholder="¿Cuánto vas a abonar?" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowAbonar(null)}>Cancelar</button>
              <button className="btn btn-green btn-full" onClick={abonar}>Abonar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reset mes */}
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">⚠️ Resetear inicio de mes</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>
              Esto borra los totales del mes anterior (ganado, gastado, domis acumulados) y empieza junio desde cero. Las metas, deudas y configuración se quedan.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowReset(false)}>Cancelar</button>
              <button className="btn btn-red btn-full" onClick={resetearMes}>Sí, resetear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
