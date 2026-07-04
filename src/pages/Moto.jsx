import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import MoneyInput from '../components/MoneyInput.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

export default function Moto() {
  const { state, dispatch } = useApp()
  const [kmInput, setKmInput] = useState('')
  const [kmError, setKmError] = useState('')
  const [mantTipo, setMantTipo] = useState('')
  const [mantKm, setMantKm] = useState('')
  const [mantFecha, setMantFecha] = useState('')
  const [mantCosto, setMantCosto] = useState('')

  const moto = state.moto
  const kmProxAceite = moto.ultimoAceite ? moto.ultimoAceite + 2000 : null
  const alertaAceite = kmProxAceite && moto.km >= kmProxAceite - 200

  const actualizarKm = () => {
    const km = parseFloat(kmInput)
    if (isNaN(km)) return
    // Bug 5 fix: no permitir km menor al actual
    if (km < moto.km) {
      setKmError(`Debe ser mayor al km actual (${Math.round(moto.km).toLocaleString('es-CO')} km)`)
      return
    }
    setKmError('')
    dispatch({ type: 'UPDATE_MOTO', payload: { km } })
    setKmInput('')
  }

  const registrarMant = () => {
    if (!mantTipo) return
    const km = parseFloat(mantKm) || moto.km
    const costo = parseFloat(mantCosto) || 0
    const payload = { tipo: mantTipo, km, fecha: mantFecha || new Date().toLocaleDateString('es-CO'), costo }
    dispatch({ type: 'ADD_MANT', payload })
    if (mantTipo === 'aceite') dispatch({ type: 'UPDATE_MOTO', payload: { ultimoAceite: km } })
    if (mantTipo === 'llanta') dispatch({ type: 'UPDATE_MOTO', payload: { llanta: mantFecha } })
    if (mantTipo === 'rtm') dispatch({ type: 'UPDATE_MOTO', payload: { rtm: mantFecha } })
    setMantTipo(''); setMantKm(''); setMantFecha(''); setMantCosto('')
  }

  const nombres = { aceite: 'Aceite', llanta: 'Llantas', rtm: 'RTM/SOAT', otro: 'Otro' }

  return (
    <div>
      <div className="section-head">Mi moto</div>

      {alertaAceite && (
        <div className="banner banner-amber">
          <span className="banner-icon">⚠️</span>
          <span className="banner-text">Cambio de aceite pronto — llevas {moto.km - (moto.ultimoAceite || 0)} km desde el último cambio</span>
        </div>
      )}

      {/* Kilometraje */}
      <div className="card">
        <div className="card-title">Kilometraje actual</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--purple)', marginBottom: 12 }}>
          {Math.round(moto.km).toLocaleString('es-CO')} km
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="inp" type="number" value={kmInput} onChange={e => { setKmInput(e.target.value); setKmError('') }} placeholder="Nuevo km" />
          {kmError && <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, marginTop: 4 }}>⚠️ {kmError}</div>}
          <button className="btn btn-primary" onClick={actualizarKm}>Guardar</button>
        </div>
      </div>

      {/* Estado mantenimientos */}
      <div className="card">
        <div className="card-title">Estado mantenimientos</div>
        <div className="list-item">
          <div className="li-left"><span className="li-icon">🛢️</span>Último aceite</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{moto.ultimoAceite ? moto.ultimoAceite.toLocaleString('es-CO') + ' km' : '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>
              Próximo: {kmProxAceite ? kmProxAceite.toLocaleString('es-CO') + ' km' : '—'}
            </div>
          </div>
        </div>
        <div className="list-item">
          <div className="li-left"><span className="li-icon">⭕</span>Revisión llantas</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{moto.llanta || '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>Cada 6 meses</div>
          </div>
        </div>
        <div className="list-item">
          <div className="li-left"><span className="li-icon">📄</span>RTM / SOAT</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{moto.rtm || '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>Vencimiento</div>
          </div>
        </div>
      </div>

      {/* Registrar mantenimiento */}
      <div className="card">
        <div className="card-title">Registrar mantenimiento</div>
        <select className="inp" style={{ marginBottom: 8 }} value={mantTipo} onChange={e => setMantTipo(e.target.value)}>
          <option value="">Selecciona tipo...</option>
          <option value="aceite">🛢️ Cambio de aceite</option>
          <option value="llanta">⭕ Revisión llantas</option>
          <option value="rtm">📄 RTM / SOAT</option>
          <option value="otro">🔧 Otro</option>
        </select>
        <input className="inp" style={{ marginBottom: 8 }} type="number" value={mantKm} onChange={e => setMantKm(e.target.value)} placeholder="Km actual (para aceite)" />
        <input className="inp" style={{ marginBottom: 8 }} value={mantFecha} onChange={e => setMantFecha(e.target.value)} placeholder="Fecha vencimiento (ej: 20/05/2027)" />
        <MoneyInput value={mantCosto} onChange={setMantCosto} placeholder="Costo del mantenimiento" style={{ marginBottom: 10 }} />
        <button className="btn btn-primary btn-full" onClick={registrarMant}>Registrar</button>
      </div>

      {/* Gastos moto */}
      <div className="card">
        <div className="card-title">Gastos de moto este mes</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)', marginBottom: 10 }}>{fmt(moto.gastoMes)}</div>
        {moto.mantenimientos.length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: 8, fontWeight: 600 }}>Sin registros</div>
          : moto.mantenimientos.map(m => (
            <div className="list-item" key={m.id}>
              <div className="li-left">
                <span className="li-icon">✅</span>
                {nombres[m.tipo] || m.tipo}
                <span style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600 }}> · {m.fecha}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>{fmt(m.costo)}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}
