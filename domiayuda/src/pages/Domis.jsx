import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

export default function Domis() {
  const { state, dispatch, ganado, gastadoHoy, balance, domisHoy, domisNecesarios } = useApp()
  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState('')
  const [editandoCapital, setEditandoCapital] = useState(false)
  const [nuevoCapital, setNuevoCapital] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

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

      {/* Movimientos con eliminar */}
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
              {/* Confirmación inline */}
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
    </div>
  )
}
