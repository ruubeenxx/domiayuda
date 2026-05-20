import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

export default function Metas() {
  const { state, dispatch } = useApp()
  const [showMeta, setShowMeta] = useState(false)
  const [showDeuda, setShowDeuda] = useState(false)
  const [showAbonar, setShowAbonar] = useState(null)
  const [metaNombre, setMetaNombre] = useState('')
  const [metaTotal, setMetaTotal] = useState('')
  const [metaIcono, setMetaIcono] = useState('🎯')
  const [deudaNombre, setDeudaNombre] = useState('')
  const [deudaTotal, setDeudaTotal] = useState('')
  const [deudaCuota, setDeudaCuota] = useState('')
  const [abonoVal, setAbonoVal] = useState('')

  const agregarMeta = () => {
    const t = parseFloat(metaTotal)
    if (!metaNombre.trim() || isNaN(t) || t <= 0) return
    dispatch({ type: 'ADD_META', payload: { nombre: metaNombre.trim(), icono: metaIcono, meta: t, ahorrado: 0 } })
    setMetaNombre(''); setMetaTotal(''); setMetaIcono('🎯'); setShowMeta(false)
  }

  const agregarDeuda = () => {
    const t = parseFloat(deudaTotal), c = parseFloat(deudaCuota)
    if (!deudaNombre.trim() || isNaN(t) || t <= 0) return
    dispatch({ type: 'ADD_DEUDA', payload: { nombre: deudaNombre.trim(), total: t, cuota: c || 0 } })
    setDeudaNombre(''); setDeudaTotal(''); setDeudaCuota(''); setShowDeuda(false)
  }

  const abonar = () => {
    const v = parseFloat(abonoVal)
    if (isNaN(v) || v <= 0 || !showAbonar) return
    dispatch({ type: 'ABONAR_META', payload: { id: showAbonar, monto: v } })
    setAbonoVal(''); setShowAbonar(null)
  }

  return (
    <div>
      <div className="section-head">Metas de ahorro</div>

      {state.metas.map(m => {
        const pct = Math.min(100, (m.ahorrado / m.meta) * 100)
        const mesesFaltan = m.ahorrado < m.meta ? Math.ceil((m.meta - m.ahorrado) / 100000) : 0
        return (
          <div className="meta-card card" key={m.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{m.icono} {m.nombre}</div>
              <span className={`tag ${pct >= 100 ? 'tag-green' : 'tag-purple'}`}>{pct >= 100 ? '✅ Lograda' : 'en curso'}</span>
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

      {state.deudas.map(d => {
        const meses = d.cuota > 0 ? Math.ceil(d.total / d.cuota) : '?'
        return (
          <div className="card" key={d.id} style={{ border: '1px solid #f5c4b3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>💳 {d.nombre}</div>
              <span className="tag tag-red">activa</span>
            </div>
            <div className="list-item">
              <div className="li-left">Total deuda</div>
              <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>{fmt(d.total)}</span>
            </div>
            <div className="list-item">
              <div className="li-left">Cuota mensual</div>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{fmt(d.cuota)}</span>
            </div>
            <div className="list-item">
              <div className="li-left">Te liberas en</div>
              <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>~{meses} meses</span>
            </div>
          </div>
        )
      })}

      <button className="btn btn-ghost btn-full" onClick={() => setShowDeuda(true)}>+ Agregar deuda</button>

      {/* Modal meta */}
      {showMeta && (
        <div className="modal-overlay" onClick={() => setShowMeta(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nueva meta de ahorro</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
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
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Agregar deuda</div>
            <input className="inp" style={{ marginBottom: 8 }} value={deudaNombre} onChange={e => setDeudaNombre(e.target.value)} placeholder="Nombre (ej: Banco, amigo...)" />
            <input className="inp" style={{ marginBottom: 8 }} type="number" value={deudaTotal} onChange={e => setDeudaTotal(e.target.value)} placeholder="Total que debes" />
            <input className="inp" style={{ marginBottom: 12 }} type="number" value={deudaCuota} onChange={e => setDeudaCuota(e.target.value)} placeholder="Cuota mensual" />
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
    </div>
  )
}
