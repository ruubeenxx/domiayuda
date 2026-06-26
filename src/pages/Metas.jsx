import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

const FRECUENCIAS = [
  { value: 'diaria', label: 'Diaria', icon: '📅' },
  { value: 'semanal', label: 'Semanal', icon: '📆' },
  { value: 'quincenal', label: 'Quincenal', icon: '📋' },
  { value: 'mensual', label: 'Mensual', icon: '🗓️' },
]

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function calcularProximoPago(frecuencia, diaPago) {
  const hoy = new Date()
  if (frecuencia === 'diaria') return 'Todos los días'
  if (frecuencia === 'quincenal') return 'Días 1 y 15 de cada mes'
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

function calcularLibera(cuota, frecuencia, cuotasPagadas, totalCuotas) {
  if (!totalCuotas) return null
  const restantes = totalCuotas - (cuotasPagadas || 0)
  if (frecuencia === 'diaria') return `${restantes} días`
  if (frecuencia === 'semanal') return `${restantes} semanas`
  if (frecuencia === 'quincenal') return `${restantes} quincenas (~${Math.ceil(restantes/2)} meses)`
  if (frecuencia === 'mensual') return `${restantes} meses`
  return '—'
}

function esHoyPago(d) {
  const hoy = new Date()
  const nombreDia = hoy.toLocaleDateString('es-CO', { weekday: 'long' })
  const diaCapital = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1).split(',')[0]
  if (d.frecuencia === 'diaria') return true
  if (d.frecuencia === 'semanal' && d.diaPago === diaCapital) return true
  if (d.frecuencia === 'quincenal' && (hoy.getDate() === 1 || hoy.getDate() === 15)) return true
  if (d.frecuencia === 'mensual' && hoy.getDate() === parseInt(d.diaPago)) return true
  return false
}

function FormDeuda({ inicial, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(inicial?.nombre || '')
  const [cuota, setCuota] = useState(inicial?.cuota || '')
  const [frecuencia, setFrecuencia] = useState(inicial?.frecuencia || 'mensual')
  const [totalCuotas, setTotalCuotas] = useState(inicial?.totalCuotas || '')
  const [diaPago, setDiaPago] = useState(inicial?.diaPago || '')

  const guardar = () => {
    const c = parseFloat(cuota)
    if (!nombre.trim() || isNaN(c) || c <= 0) return
    const total = totalCuotas ? parseFloat(totalCuotas) : null
    onGuardar({
      nombre: nombre.trim(),
      cuota: c,
      frecuencia,
      totalCuotas: total,
      cuotasPagadas: inicial?.cuotasPagadas || 0,
      diaPago,
      total: total ? c * total : c * 12,
    })
  }

  return (
    <div>
      <input className="inp" style={{ marginBottom: 8 }} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre (ej: Banco, amigo...)" />

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Frecuencia de pago</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {FRECUENCIAS.map(f => (
          <button key={f.value} onClick={() => { setFrecuencia(f.value); setDiaPago('') }}
            style={{ flex: 1, minWidth: 60, padding: '7px 4px', borderRadius: 10, border: '1.5px solid', borderColor: frecuencia === f.value ? 'var(--purple)' : '#e0e0e0', background: frecuencia === f.value ? 'var(--purple-light)' : 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: frecuencia === f.value ? 'var(--purple)' : 'var(--text2)' }}>
            {f.icon}<br />{f.label}
          </button>
        ))}
      </div>

      <input className="inp" style={{ marginBottom: 8 }} type="number" value={cuota} onChange={e => setCuota(e.target.value)}
        placeholder={`Valor cuota ${frecuencia === 'diaria' ? 'diaria' : frecuencia === 'semanal' ? 'semanal' : frecuencia === 'quincenal' ? 'quincenal' : 'mensual'}`} />

      <input className="inp" style={{ marginBottom: 8 }} type="number" value={totalCuotas} onChange={e => setTotalCuotas(e.target.value)}
        placeholder={`# cuotas total (ej: ${frecuencia === 'diaria' ? '30' : frecuencia === 'semanal' ? '4' : frecuencia === 'quincenal' ? '6' : '12'})`} />

      {frecuencia === 'semanal' && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Día de pago</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {DIAS_SEMANA.map(d => (
              <button key={d} onClick={() => setDiaPago(d)}
                style={{ padding: '5px 8px', borderRadius: 8, border: '1.5px solid', borderColor: diaPago === d ? 'var(--purple)' : '#e0e0e0', background: diaPago === d ? 'var(--purple-light)' : 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: diaPago === d ? 'var(--purple)' : 'var(--text2)' }}>
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {frecuencia === 'mensual' && (
        <input className="inp" style={{ marginBottom: 8 }} type="number" value={diaPago} onChange={e => setDiaPago(e.target.value)}
          placeholder="Día del mes (ej: 5, 15, 30)" />
      )}

      {frecuencia === 'quincenal' && (
        <div style={{ background: 'var(--purple-light)', borderRadius: 10, padding: 10, marginBottom: 8, fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>
          Se paga los días 1 y 15 de cada mes
        </div>
      )}

      {cuota && totalCuotas && (
        <div style={{ background: 'var(--purple-light)', borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>
          Total: {fmt(parseFloat(cuota) * parseFloat(totalCuotas))} en {totalCuotas} cuotas de {fmt(parseFloat(cuota))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-full" onClick={onCancelar}>Cancelar</button>
        <button className="btn btn-primary btn-full" onClick={guardar}>Guardar</button>
      </div>
    </div>
  )
}

export default function Metas() {
  const { state, dispatch } = useApp()
  const [showMeta, setShowMeta] = useState(false)
  const [showDeuda, setShowDeuda] = useState(false)
  const [showAbonar, setShowAbonar] = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [editandoDeuda, setEditandoDeuda] = useState(null)
  const [editandoCuotaId, setEditandoCuotaId] = useState(null)
  const [cuotasEditVal, setCuotasEditVal] = useState('')
  const [metaNombre, setMetaNombre] = useState('')
  const [metaTotal, setMetaTotal] = useState('')
  const [metaIcono, setMetaIcono] = useState('🎯')
  const [abonoVal, setAbonoVal] = useState('')

  const agregarMeta = () => {
    const t = parseFloat(metaTotal)
    if (!metaNombre.trim() || isNaN(t) || t <= 0) return
    dispatch({ type: 'ADD_META', payload: { nombre: metaNombre.trim(), icono: metaIcono, meta: t, ahorrado: 0 } })
    setMetaNombre(''); setMetaTotal(''); setMetaIcono('🎯'); setShowMeta(false)
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
            <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => setShowAbonar(m.id)}>+ Abonar</button>
          </div>
        )
      })}

      <button className="btn btn-primary btn-full" style={{ marginBottom: 20 }} onClick={() => setShowMeta(true)}>+ Nueva meta</button>

      <div className="section-head">Mis deudas</div>

      {/* Resumen total deudas */}
      {state.deudas.length > 0 && (() => {
        const totalDebo = state.deudas.reduce((a, d) => {
          const restantes = d.totalCuotas ? d.totalCuotas - (d.cuotasPagadas || 0) : 0
          return a + (d.cuota * restantes)
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
            <div className="progress-wrap"><div className="pb pb-green" style={{ width: pct + '%' }} /></div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, fontWeight: 600, textAlign: 'right' }}>{Math.round(pct)}% pagado</div>
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
        const hoyPaga = esHoyPago(d)
        const cuotasRestantes = d.totalCuotas ? d.totalCuotas - (d.cuotasPagadas || 0) : null

        return (
          <div className="card" key={d.id} style={{ border: hoyPaga ? '2px solid var(--amber)' : '1px solid #f5c4b3', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>💳 {d.nombre}</div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {hoyPaga && <span className="tag tag-amber">⚠️ Pagar hoy</span>}
                <button onClick={() => setEditandoDeuda(d)}
                  style={{ border: 'none', background: 'var(--purple-light)', color: 'var(--purple)', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontWeight: 800, fontSize: 13 }}>✏️</button>
                <button onClick={() => dispatch({ type: 'DELETE_DEUDA', payload: d.id })}
                  style={{ border: 'none', background: 'var(--red-light)', color: 'var(--red)', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>×</button>
              </div>
            </div>

            <div className="list-item">
              <div className="li-left">Cuota</div>
              <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>{fmt(d.cuota)} / {frecLabel?.label || 'mes'}</span>
            </div>
            {d.totalCuotas && (
              <div className="list-item">
                <div className="li-left">Cuotas pagadas</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{d.cuotasPagadas || 0} de {d.totalCuotas}</span>
                  {/* Editar cuotas pagadas */}
                  {editandoCuotaId === d.id ? (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <input type="number" value={cuotasEditVal} onChange={e => setCuotasEditVal(e.target.value)}
                        style={{ width: 50, padding: '3px 6px', borderRadius: 6, border: '1px solid var(--purple)', fontSize: 12 }} />
                      <button className="btn btn-primary btn-sm" onClick={() => {
                        const v = parseInt(cuotasEditVal)
                        if (!isNaN(v) && v >= 0) dispatch({ type: 'EDITAR_CUOTAS_PAGADAS', payload: { id: d.id, cuotasPagadas: v } })
                        setEditandoCuotaId(null); setCuotasEditVal('')
                      }}>OK</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditandoCuotaId(null)}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditandoCuotaId(d.id); setCuotasEditVal(d.cuotasPagadas || 0) }}
                      style={{ border: 'none', background: 'var(--purple-light)', color: 'var(--purple)', borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                      Editar
                    </button>
                  )}
                </div>
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

      <div className="divider" />
      <div style={{ marginTop: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 8 }}>¿Los datos del mes anterior no se resetearon?</div>
        <button className="btn btn-ghost btn-full" onClick={() => setShowReset(true)}>🔄 Resetear inicio de mes</button>
      </div>

      {/* Modal nueva meta */}
      {showMeta && (
        <div className="modal-overlay" onClick={() => setShowMeta(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nueva meta de ahorro</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {['🎯','🏍️','📱','✈️','🏠','💻','👟','🎮'].map(e => (
                <button key={e} onClick={() => setMetaIcono(e)}
                  style={{ fontSize: 20, background: metaIcono === e ? 'var(--purple-light)' : 'transparent', border: '1px solid', borderColor: metaIcono === e ? 'var(--purple)' : 'transparent', borderRadius: 8, padding: 4, cursor: 'pointer' }}>{e}</button>
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

      {/* Modal nueva deuda */}
      {showDeuda && (
        <div className="modal-overlay" onClick={() => setShowDeuda(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-title">Agregar deuda</div>
            <FormDeuda
              onGuardar={(data) => { dispatch({ type: 'ADD_DEUDA', payload: { ...data, id: Date.now() } }); setShowDeuda(false) }}
              onCancelar={() => setShowDeuda(false)}
            />
          </div>
        </div>
      )}

      {/* Modal editar deuda */}
      {editandoDeuda && (
        <div className="modal-overlay" onClick={() => setEditandoDeuda(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-title">Editar deuda</div>
            <FormDeuda
              inicial={editandoDeuda}
              onGuardar={(data) => {
                dispatch({ type: 'EDITAR_DEUDA', payload: { id: editandoDeuda.id, ...data } })
                setEditandoDeuda(null)
              }}
              onCancelar={() => setEditandoDeuda(null)}
            />
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
              Esto borra los totales del mes anterior y empieza desde cero. Las metas, deudas y configuración se quedan.
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
