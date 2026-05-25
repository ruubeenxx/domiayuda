import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

export default function Configuracion() {
  const { state, dispatch } = useApp()

  const [nombre, setNombre] = useState(state.nombre)
  const [meta, setMeta] = useState(state.metaMensual)
  const [precioDomi, setPrecioDomi] = useState(state.precioDomi)
  const [capital, setCapital] = useState(state.capitalInicial)
  const [guardado, setGuardado] = useState(false)

  const guardar = () => {
    const m = parseFloat(meta)
    const p = parseFloat(precioDomi)
    const c = parseFloat(capital)
    if (!nombre.trim() || isNaN(m) || isNaN(p) || isNaN(c)) return
    dispatch({ type: 'UPDATE_CONFIG', payload: { nombre: nombre.trim(), metaMensual: m, precioDomi: p, capitalInicial: c } })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const hoy = new Date()
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  const domisPorDia = Math.ceil((parseFloat(meta) || 0) / diasMes / (parseFloat(precioDomi) || 1))

  return (
    <div>
      <div className="section-head">Configuración</div>

      {guardado && (
        <div className="banner banner-green" style={{ marginBottom: 12 }}>
          <span className="banner-icon">✅</span>
          <span className="banner-text">Guardado correctamente!</span>
        </div>
      )}

      <div className="card">
        <div className="card-title">Tu nombre</div>
        <input className="inp" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
      </div>

      <div className="card">
        <div className="card-title">Meta y domicilios</div>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Meta mensual</div>
        <input className="inp" style={{ marginBottom: 12 }} type="number" value={meta} onChange={e => setMeta(e.target.value)} placeholder="Ej: 2000000" />

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Precio por domicilio</div>
        <input className="inp" style={{ marginBottom: 12 }} type="number" value={precioDomi} onChange={e => setPrecioDomi(e.target.value)} placeholder="Ej: 4000" />

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Capital con el que salgo cada día</div>
        <input className="inp" style={{ marginBottom: 12 }} type="number" value={capital} onChange={e => setCapital(e.target.value)} placeholder="Ej: 40000" />

        <div style={{ background: 'var(--purple-light)', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', marginBottom: 8 }}>Vista previa</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>
            <span>Meta mensual</span><span style={{ color: 'var(--purple)' }}>{fmt(parseFloat(meta) || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>
            <span>Precio por domi</span><span style={{ color: 'var(--purple)' }}>{fmt(parseFloat(precioDomi) || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>
            <span>Capital inicial</span><span style={{ color: 'var(--purple)' }}>{fmt(parseFloat(capital) || 0)}</span>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
            <span>Domis necesarios/día</span>
            <span style={{ color: 'var(--purple)' }}>{domisPorDia} domis</span>
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-full" style={{ marginBottom: 20 }} onClick={guardar}>
        Guardar cambios
      </button>
    </div>
  )
}
