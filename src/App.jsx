import { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import Inicio from './pages/Inicio.jsx'
import Domis from './pages/Domis.jsx'
import Finanzas from './pages/Finanzas.jsx'
import Metas from './pages/Metas.jsx'
import Moto from './pages/Moto.jsx'

const tabs = [
  { id: 'inicio', label: 'Inicio', icon: (a) => (
    <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
  )},
  { id: 'domis', label: 'Domis', icon: (a) => (
    <svg viewBox="0 0 24 24"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-4l2-5h11l2 5v4h-2M5 17h10"/><path d="M9 6V3"/></svg>
  )},
  { id: 'finanzas', label: 'Finanzas', icon: (a) => (
    <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 8h4M6 11h8"/></svg>
  )},
  { id: 'metas', label: 'Metas', icon: (a) => (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
  )},
  { id: 'moto', label: 'Moto', icon: (a) => (
    <svg viewBox="0 0 24 24"><path d="M14.5 10.5L13 7H8l-2 3.5M3 14a3 3 0 106 0 3 3 0 00-6 0zM15 14a3 3 0 106 0 3 3 0 00-6 0z"/><path d="M6 14h3.5l2-3.5H17l1.5 3.5"/></svg>
  )},
]

const pages = { inicio: Inicio, domis: Domis, finanzas: Finanzas, metas: Metas, moto: Moto }

export default function App() {
  const [tab, setTab] = useState('inicio')
  const Page = pages[tab]

  return (
    <AppProvider>
      <div className="app">
        <div className="screen">
          <Page />
        </div>
        <nav className="navbar">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-btn${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon(tab === t.id)}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </AppProvider>
  )
}
