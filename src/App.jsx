import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Inicio from './pages/Inicio.jsx'
import Domis from './pages/Domis.jsx'
import Finanzas from './pages/Finanzas.jsx'
import Metas from './pages/Metas.jsx'
import Moto from './pages/Moto.jsx'
import MoneyInput from './components/MoneyInput.jsx'

const tabs = [
  { id: 'inicio', label: 'Inicio', icon: () => (
    <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
  )},
  { id: 'domis', label: 'Domis', icon: () => (
    <svg viewBox="0 0 24 24"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-4l2-5h11l2 5v4h-2M5 17h10"/><path d="M9 6V3"/></svg>
  )},
  { id: 'finanzas', label: 'Finanzas', icon: () => (
    <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 8h4M6 11h8"/></svg>
  )},
  { id: 'metas', label: 'Metas', icon: () => (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
  )},
  { id: 'moto', label: 'Moto', icon: () => (
    <svg viewBox="0 0 24 24"><path d="M14.5 10.5L13 7H8l-2 3.5M3 14a3 3 0 106 0 3 3 0 00-6 0zM15 14a3 3 0 106 0 3 3 0 00-6 0z"/><path d="M6 14h3.5l2-3.5H17l1.5 3.5"/></svg>
  )},
]

const pages = { inicio: Inicio, domis: Domis, finanzas: Finanzas, metas: Metas, moto: Moto }

// Pantalla de bienvenida para usuarios nuevos
function Bienvenida({ onEntrar }) {
  const [nombre, setNombre] = useState('')
  const [meta, setMeta] = useState('2000000')
  const [precio, setPrecio] = useState('4000')
  const [capital, setCapital] = useState('20000')
  const [paso, setPaso] = useState(1)

  const fmt = n => '$' + Math.round(n).toLocaleString('es-CO')

  const continuar = () => {
    if (paso === 1 && nombre.trim()) setPaso(2)
    else if (paso === 2) {
      onEntrar({
        nombre: nombre.trim(),
        metaMensual: parseFloat(meta) || 2000000,
        precioDomi: parseFloat(precio) || 4000,
        capitalInicial: parseFloat(capital) || 20000,
      })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo / header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🛵</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--purple)' }}>DomiAyuda</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, marginTop: 4 }}>Tu app de domicilios y finanzas</div>
        </div>

        {/* Paso 1 — nombre */}
        {paso === 1 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Hola! Cómo te llamas?</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 16 }}>
              Tu nombre aparecerá en la pantalla principal
            </div>
            <input
              className="inp"
              style={{ marginBottom: 16, fontSize: 15 }}
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && continuar()}
            />
            <button
              className="btn btn-primary btn-full"
              onClick={continuar}
              disabled={!nombre.trim()}
              style={{ opacity: nombre.trim() ? 1 : 0.5 }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Paso 2 — configuración */}
        {paso === 2 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Perfecto, {nombre}!</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 20 }}>
              Configura tus datos para empezar. Puedes cambiarlos después.
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Meta mensual</div>
            <MoneyInput value={meta} onChange={setMeta} placeholder="Ej: 2.000.000" style={{ marginBottom: 12 }} />

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Precio por domicilio</div>
            <MoneyInput value={precio} onChange={setPrecio} placeholder="Ej: 4.000" style={{ marginBottom: 12 }} />

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Capital con el que sales cada día</div>
            <MoneyInput value={capital} onChange={setCapital} placeholder="Ej: 20.000" style={{ marginBottom: 16 }} />

            {/* Preview */}
            <div style={{ background: 'var(--purple-light)', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 12, fontWeight: 600, color: 'var(--purple)' }}>
              Para llegar a {fmt(parseFloat(meta)||0)} en 30 días necesitas {Math.ceil((parseFloat(meta)||0) / 30 / (parseFloat(precio)||1))} domis por día
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setPaso(1)}>← Atrás</button>
              <button className="btn btn-primary btn-full" onClick={continuar}>Empezar! 🚀</button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 20, fontWeight: 600 }}>
          Tus datos se guardan solo en tu celular
        </div>
      </div>
    </div>
  )
}

function Ajustes({ onCerrar }) {
  const { state, dispatch } = useApp()
  const [nombre, setNombre] = useState(state.nombre)
  const [meta, setMeta] = useState(state.metaMensual)
  const [precio, setPrecio] = useState(state.precioDomi)
  const [guardado, setGuardado] = useState(false)

  const guardar = () => {
    const m = parseFloat(meta), p = parseFloat(precio)
    if (!nombre.trim() || isNaN(m) || isNaN(p)) return
    dispatch({ type: 'UPDATE_CONFIG', payload: { nombre: nombre.trim(), metaMensual: m, precioDomi: p } })
    setGuardado(true)
    setTimeout(() => { setGuardado(false); onCerrar() }, 1200)
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">⚙️ Ajustes</div>
        {guardado && (
          <div className="banner banner-green" style={{ marginBottom: 12 }}>
            <span className="banner-icon">✅</span>
            <span className="banner-text">Guardado!</span>
          </div>
        )}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Tu nombre</div>
        <input className="inp" style={{ marginBottom: 12 }} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Meta mensual</div>
        <input className="inp" style={{ marginBottom: 12 }} type="number" value={meta} onChange={e => setMeta(e.target.value)} />
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 5 }}>Precio por domicilio</div>
        <input className="inp" style={{ marginBottom: 16 }} type="number" value={precio} onChange={e => setPrecio(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-full" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primary btn-full" onClick={guardar}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

function AppInner() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState('inicio')
  const [showAjustes, setShowAjustes] = useState(false)
  const Page = pages[tab]

  const esNuevo = !localStorage.getItem('domiayuda_configurado') && !localStorage.getItem('domiayuda_state')

  const handleEntrar = (config) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config })
    localStorage.setItem('domiayuda_configurado', 'si')
  }

  if (esNuevo) return <Bienvenida onEntrar={handleEntrar} />

  return (
    <div className="app">
      {/* Header con botón ajustes */}
      <div style={{ background: '#fff', padding: '10px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--border)' }}>
        <span style={{ color: 'var(--purple)', fontWeight: 800, fontSize: 15 }}>🛵 DomiAyuda</span>
        <button onClick={() => setShowAjustes(true)}
          style={{ border: 'none', background: 'var(--purple-light)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--purple)' }}>
          ⚙️ Ajustes
        </button>
      </div>
      <div className="screen"><Page /></div>
      <nav className="navbar">
        {tabs.map(t => (
          <button key={t.id} className={`nav-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon()}<span>{t.label}</span>
          </button>
        ))}
      </nav>
      {showAjustes && <Ajustes onCerrar={() => setShowAjustes(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
