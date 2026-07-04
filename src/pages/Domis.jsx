import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import MoneyInput from '../components/MoneyInput.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }
function hora() {
  const h = new Date()
  return h.getHours().toString().padStart(2,'0') + ':' + h.getMinutes().toString().padStart(2,'0')
}

function ResumenDia({ ganadoHoy, balance, capitalInicial, gastosFijos, gastadoHoy, deudas, onClose }) {
  const totalFijosMes = gastosFijos.reduce((a, g) => a + g.monto, 0)
  const metaDiaria = 2000000 / 30
  const proporcion = ganadoHoy > 0 ? Math.min(1, ganadoHoy / metaDiaria) : 0
  const paraFijosHoy = Math.round((totalFijosMes / 30) * proporcion)
  const ahorrarHoy = Math.round(ganadoHoy * 0.40)
  const libreHoy = Math.round(ganadoHoy * 0.25)
  const capitalFinal = capitalInicial + balance

  const hoy = new Date()
  const nombreDiaHoy = hoy.toLocaleDateString('es-CO', { weekday: 'long' }).split(',')[0]
  const diaCapital = nombreDiaHoy.charAt(0).toUpperCase() + nombreDiaHoy.slice(1)
  const deudasHoy = (deudas || []).filter(d => {
    if (d.frecuencia === 'diaria') return true
    if (d.frecuencia === 'semanal' && d.diaPago === diaCapital) return true
    if (d.frecuencia === 'quincenal' && (hoy.getDate() === 1 || hoy.getDate() === 15)) return true
    if (d.frecuencia === 'mensual' && hoy.getDate() === parseInt(d.diaPago)) return true
    return false
  })
  const totalDeudasHoy = deudasHoy.reduce((a, d) => a + d.cuota, 0)
  const [cerrando, setCerrando] = useState(false)
  const cerrar = () => { setCerrando(true); setTimeout(onClose, 220) }

  return (
    <div className="modal-overlay" onClick={cerrar} style={{ animation: cerrando ? 'fadeOut .2s ease' : 'fadeIn .2s ease' }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto', animation: cerrando ? 'slideDown .22s ease' : 'slideUp .25s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🏁</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Cierre del día</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginTop: 2 }}>Así quedó tu día de hoy</div>
        </div>
        <div style={{ background: 'var(--purple-light)', borderRadius: 14, padding: 13, marginBottom: 14, border: '1px solid var(--purple-mid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Saliste con</span>
            <span style={{ fontWeight: 700 }}>{fmt(capitalInicial)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Ganaste HOY</span>
            <span style={{ fontWeight: 700, color: 'var(--green)' }}>+{fmt(ganadoHoy)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Gastaste HOY</span>
            <span style={{ fontWeight: 700, color: 'var(--red)' }}>-{fmt(gastadoHoy)}</span>
          </div>
          {totalDeudasHoy > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Pagos de deudas hoy</span>
              <span style={{ fontWeight: 700, color: 'var(--red)' }}>-{fmt(totalDeudasHoy)}</span>
            </div>
          )}
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Capital en mano ahora</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--purple)' }}>{fmt(capitalFinal)}</span>
          </div>
        </div>
        {deudasHoy.length > 0 && (
          <div style={{ background: 'var(--amber-light)', borderRadius: 13, padding: '11px 14px', marginBottom: 12, border: '1px solid #FAC775' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#633806', marginBottom: 6 }}>⚠️ Deudas que toca pagar hoy</div>
            {deudasHoy.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 3 }}>
                <span>💳 {d.nombre}</span>
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>{fmt(d.cuota)}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.6px' }}>
          De tus {fmt(capitalFinal)} en mano, haz esto:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <div style={{ background: '#eaf3de', borderRadius: 13, padding: '12px 14px', border: '1px solid #C0DD97' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>🏠 Guarda para gastos fijos</div>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600, marginTop: 2 }}>Arriendo + moto = {fmt(totalFijosMes)}/mes</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', marginLeft: 10 }}>{fmt(paraFijosHoy)}</span>
            </div>
          </div>
          <div style={{ background: 'var(--purple-light)', borderRadius: 13, padding: '12px 14px', border: '1px solid var(--purple-mid)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>🐷 Ahorra</div>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600, marginTop: 2 }}>40% de lo que ganaste hoy ({fmt(ganadoHoy)})</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--purple)', marginLeft: 10 }}>{fmt(ahorrarHoy)}</span>
            </div>
          </div>
          <div style={{ background: 'var(--amber-light)', borderRadius: 13, padding: '12px 14px', border: '1px solid #FAC775' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>👛 Libre para ti</div>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600, marginTop: 2 }}>25% de lo de hoy</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)', marginLeft: 10 }}>{fmt(libreHoy)}</span>
            </div>
          </div>
        </div>
        <div style={{ background: '#f5f5f7', borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Total a separar</span>
            <span style={{ fontWeight: 700 }}>{fmt(paraFijosHoy + ahorrarHoy + libreHoy)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Lo que queda para mañana</span>
            <span style={{ fontWeight: 800, color: 'var(--purple)' }}>{fmt(Math.max(0, capitalFinal - paraFijosHoy - ahorrarHoy - libreHoy))}</span>
          </div>
        </div>
        {ganadoHoy >= 60000 && (
          <div className="banner banner-green" style={{ marginBottom: 12 }}>
            <span className="banner-icon">🔥</span>
            <span className="banner-text">Buen día! Guarda los {fmt(ahorrarHoy)} de ahorro AHORA</span>
          </div>
        )}
        {ganadoHoy > 0 && ganadoHoy < 40000 && (
          <div className="banner banner-amber" style={{ marginBottom: 12 }}>
            <span className="banner-icon">💪</span>
            <span className="banner-text">Día flojo pero suma. Mañana recuperas!</span>
          </div>
        )}
        <button className="btn btn-primary btn-full" onClick={cerrar}>Listo!</button>
      </div>
    </div>
  )
}

export default function Domis() {
  const { state, dispatch, ganadoHoy, gastadoHoy, balance, domisHoy, domisNecesarios } = useApp()
  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState('')
  const [tipoPago, setTipoPago] = useState('efectivo') // efectivo | transferencia
  const [editandoCapital, setEditandoCapital] = useState(false)
  const [nuevoCapital, setNuevoCapital] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showResumen, setShowResumen] = useState(false)

  const agregar = (tipo) => {
    const v = parseFloat(valor)
    if (!desc.trim() || isNaN(v) || v <= 0) return
    if (navigator.vibrate) navigator.vibrate(40)
    const monto = tipo === 'gasto' ? -v : v
    dispatch({ type: 'ADD_MOV', payload: { desc: desc.trim(), monto, tipo: tipo === 'gasto' ? 'gasto' : 'ingreso', hora: hora(), tipoPago } })
    setDesc(''); setValor('')
  }

  const agregarPropina = () => {
    const v = parseFloat(valor)
    if (isNaN(v) || v <= 0) return
    if (navigator.vibrate) navigator.vibrate(40)
    dispatch({ type: 'ADD_MOV', payload: { desc: desc.trim() || 'Propina', monto: v, tipo: 'propina', hora: hora(), tipoPago } })
    setDesc(''); setValor('')
  }

  const guardarCapital = () => {
    const c = parseFloat(nuevoCapital)
    if (isNaN(c) || c <= 0) return
    dispatch({ type: 'UPDATE_CONFIG', payload: { capitalInicial: c } })
    setNuevoCapital(''); setEditandoCapital(false)
  }

  const eliminarMov = (id) => {
    if (navigator.vibrate) navigator.vibrate([30, 20, 30])
    dispatch({ type: 'DELETE_MOV', payload: id })
    setConfirmDelete(null)
  }

  // Bug 7 fix: capitalActual debe reflejar lo mismo que el cierre del día
  const capitalActual = state.capitalInicial + balance
  const hayMovimientos = state.movimientos.length > 0

  return (
    <div>
      <div className="section-head">Domicilios del día</div>

      {/* Botón domi rápido */}
      <button
        style={{ width: '100%', padding: '18px 0', background: 'var(--green)', border: 'none', borderRadius: 16, color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(60)
          dispatch({ type: 'ADD_MOV', payload: { desc: `Domi #${domisHoy + 1}`, monto: state.precioDomi, tipo: 'ingreso', hora: hora(), tipoPago } })
        }}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(.97)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: 24 }}>⚡</span> Domi rápido — {fmt(state.precioDomi)}
      </button>

      {/* Capital editable */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editandoCapital ? 10 : 0 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 2 }}>Capital con el que saliste hoy</div>
            {!editandoCapital && <div style={{ fontSize: 24, fontWeight: 800 }}>{fmt(state.capitalInicial)}</div>}
          </div>
          {!editandoCapital && <button className="btn btn-ghost btn-sm" onClick={() => { setNuevoCapital(String(state.capitalInicial)); setEditandoCapital(true) }}>✏️ Editar</button>}
        </div>
        {editandoCapital && (
          <div>
            <MoneyInput value={nuevoCapital} onChange={setNuevoCapital} placeholder="Ej: 40.000" autoFocus />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setEditandoCapital(false)}>Cancelar</button>
              <button className="btn btn-primary btn-full" onClick={guardarCapital}>Guardar</button>
            </div>
          </div>
        )}
      </div>

      {/* Tipo de pago */}
      <div className="card">
        <div className="card-title">Tipo de pago</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['efectivo','💵 Efectivo'],['transferencia','📲 Transferencia']].map(([val, label]) => (
            <button key={val} onClick={() => setTipoPago(val)}
              style={{ flex: 1, padding: '9px 8px', borderRadius: 12, border: '1.5px solid', borderColor: tipoPago === val ? 'var(--purple)' : '#e0e0e0', background: tipoPago === val ? 'var(--purple-light)' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: tipoPago === val ? 'var(--purple)' : 'var(--text2)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Registrar */}
      <div className="card">
        <div className="card-title">Registrar movimiento</div>
        <input className="inp" style={{ marginBottom: 8 }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción (ej: Domi #1, gasolina...)" />
        <MoneyInput value={valor} onChange={setValor} placeholder="Valor en pesos" style={{ marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-green" onClick={() => agregar('ingreso')}>+ Ingreso</button>
          <button className="btn btn-red" onClick={() => agregar('gasto')}>- Gasto</button>
          <button className="btn btn-outline" onClick={agregarPropina}>🪙 Propina</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Capital actual</div>
          <div className="stat-val" style={{ color: !hayMovimientos ? 'var(--text3)' : capitalActual > state.capitalInicial ? 'var(--green)' : 'var(--red)' }}>
            {hayMovimientos ? fmt(capitalActual) : '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Meta llegar con</div>
          <div className="stat-val sv-purple">{fmt(state.capitalInicial + domisNecesarios * state.precioDomi)}</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Domis hechos</div><div className="stat-val sv-purple">{domisHoy}</div></div>
        <div className="stat-card"><div className="stat-label">Gastos del día</div><div className="stat-val sv-red">{fmt(gastadoHoy)}</div></div>
      </div>

      {/* Resumen efectivo vs transferencia */}
      {hayMovimientos && (() => {
        const enEfectivo = state.movimientos.filter(m => m.tipoPago === 'efectivo' && m.monto > 0).reduce((a,m) => a + m.monto, 0)
        const enTransferencia = state.movimientos.filter(m => m.tipoPago === 'transferencia' && m.monto > 0).reduce((a,m) => a + m.monto, 0)
        if (enEfectivo === 0 && enTransferencia === 0) return null
        return (
          <div className="card">
            <div className="card-title">Cómo recibiste el dinero</div>
            <div className="list-item">
              <div className="li-left"><span className="li-icon">💵</span>Efectivo</div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--green)' }}>{fmt(enEfectivo)}</span>
            </div>
            <div className="list-item">
              <div className="li-left"><span className="li-icon">📲</span>Transferencia</div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--purple)' }}>{fmt(enTransferencia)}</span>
            </div>
          </div>
        )
      })()}

      {/* Movimientos con hora */}
      <div className="card">
        <div className="card-title">Movimientos del día</div>
        {state.movimientos.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: 10, fontWeight: 600 }}>Sin movimientos aún</div>
        ) : (
          state.movimientos.map(m => (
            <div key={m.id}>
              <div className="list-item">
                <div className="li-left" style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{m.tipo === 'propina' ? '🪙' : m.monto > 0 ? (m.tipoPago === 'transferencia' ? '📲' : '✅') : '🔴'}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.desc}</span>
                  </div>
                  {m.hora && <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, marginLeft: 22 }}>{m.hora}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: m.monto >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {m.monto >= 0 ? '+' : '-'}{fmt(Math.abs(m.monto))}
                  </span>
                  <button onClick={() => setConfirmDelete(m.id)}
                    style={{ border: 'none', background: 'var(--red-light)', color: 'var(--red)', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>×</button>
                </div>
              </div>
              {confirmDelete === m.id && (
                <div style={{ background: '#fff5f5', borderRadius: 10, padding: '8px 10px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fcc', animation: 'fadeIn .15s ease' }}>
                  <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>¿Eliminar este movimiento?</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>No</button>
                    <button className="btn btn-red btn-sm" onClick={() => eliminarMov(m.id)}>Sí</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Balance del día</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(balance)}</span>
        </div>
      </div>

      <button className="btn btn-primary btn-full" style={{ marginBottom: 20 }} onClick={() => setShowResumen(true)}>
        🏁 Cerrar día y ver resumen
      </button>

      {showResumen && (
        <ResumenDia
          ganadoHoy={ganadoHoy}
          balance={balance}
          capitalInicial={state.capitalInicial}
          gastosFijos={state.gastosFijos}
          gastadoHoy={gastadoHoy}
          deudas={state.deudas}
          onClose={() => {
            // Bug 7 fix: capital nuevo = lo que tienes en mano al cerrar
            const capitalNuevo = state.capitalInicial + balance
            dispatch({ type: 'UPDATE_CONFIG', payload: { capitalInicial: capitalNuevo } })
            setShowResumen(false)
          }}
        />
      )}
    </div>
  )
}
