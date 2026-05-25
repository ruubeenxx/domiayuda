import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }

export default function Inicio() {
  const { state, ganado, ganadoHoy, gastadoHoy, propinas, domisHoy, balance, diasRestantes, porDia, domisNecesarios, domisBase, ganadoMesTotal } = useApp()

  const pctMeta = Math.min(100, (ganado / state.metaMensual) * 100)
  const pctDomis = domisNecesarios > 0 ? Math.min(100, (domisHoy / domisNecesarios) * 100) : 0
  const diaBueno = domisHoy > domisBase + 5
  const sobrado = diaBueno ? (domisHoy - domisBase) * state.precioDomi : 0
  const capitalActual = state.capitalInicial + balance

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingTop: 4 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Hola, {state.nombre}!</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div className="racha-badge">🔥 {state.racha} días</div>
      </div>

      {diaBueno && (
        <div className="banner banner-green" style={{ marginBottom: 12 }}>
          <span className="banner-icon">🏆</span>
          <span className="banner-text">Día excelente! Guarda {fmt(sobrado)} en tus metas</span>
        </div>
      )}

      {/* Meta mensual — usa total acumulado del mes */}
      <div className="card">
        <div className="card-title">Meta mensual · {fmt(state.metaMensual)}</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{fmt(ganado)} <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>ganados en el mes</span></div>
        <div className="progress-wrap"><div className="pb" style={{ width: pctMeta + '%' }} /></div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, fontWeight: 600 }}>
          Faltan {diasRestantes} días · {fmt(porDia)}/día para llegar
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Domis hoy</div>
          <div className="stat-val sv-purple">{domisHoy}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Necesito hoy</div>
          <div className="stat-val sv-amber">{domisNecesarios}</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Salí con</div>
          <div className="stat-val">{fmt(state.capitalInicial)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Capital actual</div>
          <div className="stat-val" style={{ color: capitalActual >= state.capitalInicial ? 'var(--green)' : 'var(--red)' }}>{fmt(capitalActual)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Progreso del día</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 5 }}>
          <span>{domisHoy} de {domisNecesarios} domis hoy</span>
          <span>{Math.round(pctDomis)}%</span>
        </div>
        <div className="progress-wrap"><div className="pb pb-green" style={{ width: pctDomis + '%' }} /></div>
        {state.domisPendientes > 0 && (
          <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 5, fontWeight: 600 }}>
            +{state.domisPendientes} acumulados de días anteriores
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Resumen de hoy</div>
        <div className="list-item">
          <div className="li-left"><span className="li-icon">⬆️</span>Ingresos hoy</div>
          <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>{fmt(ganadoHoy)}</span>
        </div>
        <div className="list-item">
          <div className="li-left"><span className="li-icon">⬇️</span>Gastos hoy</div>
          <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>{fmt(gastadoHoy)}</span>
        </div>
        <div className="list-item">
          <div className="li-left"><span className="li-icon">🪙</span>Propinas</div>
          <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 13 }}>{fmt(propinas)}</span>
        </div>
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Balance neto hoy</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(balance)}</span>
        </div>
      </div>

      <div className="banner banner-purple">
        <span className="banner-icon">📋</span>
        <span className="banner-text">Gastos fijos del mes: {fmt(state.gastosFijos.reduce((a, g) => a + g.monto, 0))} comprometidos</span>
      </div>
    </div>
  )
}
