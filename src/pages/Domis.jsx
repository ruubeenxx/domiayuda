import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

function ResumenDia({ ganado, balance, capitalInicial, gastosFijos, gastadoHoy, onClose }) {
  const totalFijosMes = gastosFijos.reduce((a, g) => a + g.monto, 0)
  // Proporción diaria de gastos fijos según lo que ganó hoy
  // Si ganó más, aparta más. Si ganó menos, aparta menos. Proporcional a meta diaria
  const metaDiaria = 2000000 / 30
  const proporcion = ganado > 0 ? Math.min(1, ganado / metaDiaria) : 0
  const paraFijosHoy = Math.round((totalFijosMes / 30) * proporcion)
  const ahorrarHoy = Math.round(ganado * 0.40)
  const libreHoy = Math.round(ganado * 0.25)
  const gastosDia = gastadoHoy // gasolina, comida, etc ya descontados
  const capitalFinal = capitalInicial + balance

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🏁</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Cierre del día</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginTop: 2 }}>Así quedó tu día</div>
        </div>

        {/* Resumen capital */}
        <div style={{ background: 'var(--purple-light)', borderRadius: 14, padding: 13, marginBottom: 14, border: '1px solid var(--purple-mid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Saliste con</span>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(capitalInicial)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Ganaste en domis</span>
            <span style={{ fontWeight: 700, color: 'var(--green)' }}>+{fmt(ganado)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Gastaste (gas, comida...)</span>
            <span style={{ fontWeight: 700, color: 'var(--red)' }}>-{fmt(gastosDia)}</span>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Capital en mano ahora</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--purple)' }}>{fmt(capitalFinal)}</span>
          </div>
        </div>

        {/* Qué hacer con la plata */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.6px' }}>
          De tus {fmt(capitalFinal)} en mano, haz esto:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>

          {/* Gastos fijos proporcionales */}
          <div style={{ background: '#eaf3de', borderRadius: 13, padding: '12px 14px', border: '1px solid #C0DD97' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>🏠 Guarda para gastos fijos</div>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600, marginTop: 2 }}>
                  Arriendo + moto = {fmt(totalFijosMes)}/mes
                </div>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>
                  Según lo que ganaste hoy ({Math.round(proporcion*100)}% de un día normal)
                </div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', marginLeft: 10 }}>{fmt(paraFijosHoy)}</span>
            </div>
          </div>

          {/* Ahorro */}
          <div style={{ background: 'var(--purple-light)', borderRadius: 13, padding: '12px 14px', border: '1px solid var(--purple-mid)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>🐷 Ahorra</div>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600, marginTop: 2 }}>40% de lo que ganaste</div>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Para tus metas de ahorro</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--purple)', marginLeft: 10 }}>{fmt(ahorrarHoy)}</span>
            </div>
          </div>

          {/* Libre */}
          <div style={{ background: 'var(--amber-light)', borderRadius: 13, padding: '12px 14px', border: '1px solid #FAC775' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>👛 Libre para ti</div>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600, marginTop: 2 }}>25% — gastar en lo que quieras</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)', marginLeft: 10 }}>{fmt(libreHoy)}</span>
            </div>
          </div>
        </div>

        {/* Total que sale */}
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

        {ganado >= 60000 && (
          <div className="banner banner-green" style={{ marginBottom: 12 }}>
            <span className="banner-icon">🔥</span>
            <span className="banner-text">Buen día bro! Guarda los {fmt(ahorrarHoy)} de ahorro AHORA antes de gastarlos</span>
          </div>
        )}
        {ganado > 0 && ganado < 40000 && (
          <div className="banner banner-amber" style={{ marginBottom: 12 }}>
            <span className="banner-icon">💪</span>
            <span className="banner-text">Día flojo pero suma. Mañana recuperas!</span>
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={onClose}>Listo!</button>
      </div>
    </div>
  )
}

export default function Domis() {
  const { state, dispatch, ganado, gastadoHoy, balance, domisHoy, domisNecesarios } = useApp()
  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState('')
  const [editandoCapital, setEditandoCapital] = useState(false)
  const [nuevoCapital, setNuevoCapital] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showResumen, setShowResumen] = useState(false)

  const agregar = (tipo) => {
    const v = parseFloat(valor)
    if (!desc.trim() || isNaN(v) || v <= 0) return
    const monto = tipo === 'gasto' ? -v : v
    dispatch({ type: 'ADD_MOV', payload: { desc: desc.trim(), monto, tipo: tipo === 'gasto' ? 'gasto' : 'ingreso' } })
    setDesc(''); setValor('')
  }

  const agregarPropina = () => {
    const v = parseFloat(valor)
    if (isNaN(v) || v <= 0) return
    dispatch({ type: 'ADD_MOV', payload: { desc: desc.trim() || 'Propina', monto: v, tipo: 'propina' } })
    setDesc(''); setValor('')
  }

  const guardarCapital = () => {
    const c = parseFloat(nuevoCapital)
    if (isNaN(c) || c <= 0) return
    dispatch({ type: 'UPDATE_CONFIG', payload: { capitalInicial: c } })
    setNuevoCapital('')
    setEditandoCapital(false)
  }

  const eliminarMov = (id) => {
    dispatch({ type: 'DELETE_MOV', payload: id })
    setConfirmDelete(null)
  }

  const capitalActual = state.capitalInicial + balance

  return (
    <div>
      <div className="section-head">Domicilios del día</div>

      {/* Capital editable */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editandoCapital ? 10 : 0 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 2 }}>Capital con el que saliste hoy</div>
            {!editandoCapital && <div style={{ fontSize: 24, fontWeight: 800 }}>{fmt(state.capitalInicial)}</div>}
          </div>
          {!editandoCapital && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setNuevoCapital(state.capitalInicial); setEditandoCapital(true) }}>✏️ Editar</button>
          )}
        </div>
        {editandoCapital && (
          <div>
            <input className="inp" type="number" style={{ marginBottom: 8 }} value={nuevoCapital} onChange={e => setNuevoCapital(e.target.value)} placeholder="Ej: 40000" autoFocus />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setEditandoCapital(false)}>Cancelar</button>
              <button className="btn btn-primary btn-full" onClick={guardarCapital}>Guardar</button>
            </div>
          </div>
        )}
      </div>

      {/* Registrar */}
      <div className="card">
        <div className="card-title">Registrar movimiento</div>
        <input className="inp" style={{ marginBottom: 8 }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción (ej: Domi #1, gasolina...)" />
        <input className="inp" style={{ marginBottom: 10 }} type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="Valor en pesos" />
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
          <div className="stat-val" style={{ color: capitalActual >= state.capitalInicial ? 'var(--green)' : 'var(--red)' }}>{fmt(capitalActual)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Meta llegar con</div>
          <div className="stat-val sv-purple">{fmt(state.capitalInicial + domisNecesarios * state.precioDomi)}</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Domis hechos</div>
          <div className="stat-val sv-purple">{domisHoy}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gastos del día</div>
          <div className="stat-val sv-red">{fmt(gastadoHoy)}</div>
        </div>
      </div>

      {/* Movimientos */}
      <div className="card">
        <div className="card-title">Movimientos del día</div>
        {state.movimientos.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: 10, fontWeight: 600 }}>Sin movimientos aún</div>
        ) : (
          state.movimientos.map(m => (
            <div key={m.id}>
              <div className="list-item">
                <div className="li-left" style={{ flex: 1 }}>
                  <span>{m.tipo === 'propina' ? '🪙' : m.monto > 0 ? '✅' : '🔴'}</span>
                  <span style={{ flex: 1 }}>{m.desc}</span>
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
                <div style={{ background: '#fff5f5', borderRadius: 10, padding: '8px 10px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fcc' }}>
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

      {/* Botón cerrar día */}
      <button className="btn btn-primary btn-full" style={{ marginBottom: 20 }} onClick={() => setShowResumen(true)}>
        🏁 Cerrar día y ver resumen
      </button>

      {showResumen && (
        <ResumenDia
          ganado={ganado}
          balance={balance}
          capitalInicial={state.capitalInicial}
          gastosFijos={state.gastosFijos}
          gastadoHoy={gastadoHoy}
          onClose={() => setShowResumen(false)}
        />
      )}
    </div>
  )
}
