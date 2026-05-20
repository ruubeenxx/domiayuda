import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

export default function Domis() {
  const { state, dispatch, ganado, gastadoHoy, balance, domisHoy, domisNecesarios } = useApp()
  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState('')

  const agregar = (tipo) => {
    const v = parseFloat(valor)
    if (!desc.trim() || isNaN(v) || v <= 0) return
    const monto = tipo === 'gasto' ? -v : v
    dispatch({ type: 'ADD_MOV', payload: { desc: desc.trim(), monto, tipo: tipo === 'propina' ? 'propina' : tipo === 'gasto' ? 'gasto' : 'ingreso' } })
    setDesc(''); setValor('')
  }

  const agregarPropina = () => {
    const v = parseFloat(valor)
    if (isNaN(v) || v <= 0) return
    dispatch({ type: 'ADD_MOV', payload: { desc: desc.trim() || 'Propina', monto: v, tipo: 'propina' } })
    setDesc(''); setValor('')
  }

  return (
    <div>
      <div className="section-head">Domicilios del día</div>

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

      {/* Capital */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Saliste con</div>
          <div className="stat-val">{fmt(20000)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Meta llegar con</div>
          <div className="stat-val sv-green">{fmt(20000 + domisNecesarios * state.precioDomi)}</div>
        </div>
      </div>

      {/* Movimientos */}
      <div className="card">
        <div className="card-title">Movimientos del día</div>
        {state.movimientos.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: 10, fontWeight: 600 }}>Sin movimientos aún</div>
        ) : (
          state.movimientos.map(m => (
            <div className="list-item" key={m.id}>
              <div className="li-left">
                <span>{m.tipo === 'propina' ? '🪙' : m.monto > 0 ? '✅' : '🔴'}</span>
                {m.desc}
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: m.monto >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {fmt(Math.abs(m.monto))}
              </span>
            </div>
          ))
        )}
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Balance del día</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(balance)}</span>
        </div>
      </div>

      {/* Resumen rápido */}
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
    </div>
  )
}
