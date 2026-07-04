import { useApp } from '../context/AppContext.jsx'

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO') }
function fmtK(n) { return n >= 1000 ? '$' + Math.round(n/1000) + 'k' : '$' + Math.round(n) }

export default function Inicio() {
  const { state, ganado, ganadoHoy, gastadoHoy, propinas, domisHoy, balance, diasRestantes, diaActualPeriodo, diasTotalesPeriodo, porDia, domisNecesarios, domisBase } = useApp()

  const metaDiariaHoy = state.metaMensual / 30
  const cumpliendoHoy = ganadoHoy >= metaDiariaHoy
  const rachaVisual = cumpliendoHoy ? (state.racha || 0) + 1 : (state.racha || 0)

  const pctMeta = Math.min(100, (ganado / state.metaMensual) * 100)
  const pctDomis = domisNecesarios > 0 ? Math.min(100, (domisHoy / domisNecesarios) * 100) : 0
  const diaBueno = domisHoy > domisBase + 5
  const sobrado = diaBueno ? (domisHoy - domisBase) * state.precioDomi : 0
  const capitalActual = state.capitalInicial + balance
  const hayMovimientos = state.movimientos.length > 0

  // Diagrama semanal — ingresos por día
  const diasSem = ['L','M','X','J','V','S','D']
  const semActual = state.semActual || [0,0,0,0,0,0,0]
  const semGastos = state.semGastosActual || [0,0,0,0,0,0,0]
  const maxSem = Math.max(...semActual, ...semGastos, 1)
  const hoyIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingTop: 4 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Hola, {state.nombre}!</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div className="racha-badge">🔥 {rachaVisual} días</div>
      </div>

      {diaBueno && (
        <div className="banner banner-green" style={{ marginBottom: 12 }}>
          <span className="banner-icon">🏆</span>
          <span className="banner-text">Día excelente! Guarda {fmt(sobrado)} en tus metas</span>
        </div>
      )}

      {/* Meta mensual */}
      <div className="card">
        <div className="card-title">Meta mensual · {fmt(state.metaMensual)}</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{fmt(ganado)} <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>ganados en el mes</span></div>
        <div className="progress-wrap"><div className="pb" style={{ width: pctMeta + '%' }} /></div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, fontWeight: 600 }}>
          Faltan {diasRestantes} días · {fmt(porDia)}/día para llegar
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Domis hoy</div><div className="stat-val sv-purple">{domisHoy}</div></div>
        <div className="stat-card"><div className="stat-label">Necesito hoy</div><div className="stat-val sv-amber">{domisNecesarios}</div></div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Salí con</div>
          <div className="stat-val">{fmt(state.capitalInicial)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Capital actual</div>
          <div className="stat-val" style={{ color: !hayMovimientos ? 'var(--text3)' : capitalActual > state.capitalInicial ? 'var(--green)' : capitalActual < state.capitalInicial ? 'var(--red)' : 'var(--text3)' }}>
            {hayMovimientos ? fmt(capitalActual) : '—'}
          </div>
        </div>
      </div>

      {/* Progreso del día */}
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

      {/* Diagrama semanal de domis */}
      <div className="card">
        <div className="card-title">Movimiento de la semana</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, marginBottom: 8 }}>
          {diasSem.map((d, i) => {
            const hI = semActual[i] > 0 ? Math.max(8, Math.round((semActual[i] / maxSem) * 70)) : 0
            const hG = semGastos[i] > 0 ? Math.max(4, Math.round((semGastos[i] / maxSem) * 70)) : 0
            const esHoy = i === hoyIdx
            return (
              <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, height: 70 }}>
                  {/* Barra ingresos */}
                  <div style={{
                    width: '42%', height: hI || 3, borderRadius: '4px 4px 0 0',
                    background: esHoy ? '#534AB7' : hI > 0 ? '#AFA9EC' : '#f0f0f3',
                    transition: 'height .3s ease'
                  }} />
                  {/* Barra gastos */}
                  <div style={{
                    width: '42%', height: hG || 3, borderRadius: '4px 4px 0 0',
                    background: esHoy ? '#e05050' : hG > 0 ? '#f5a0a0' : '#f0f0f3',
                    transition: 'height .3s ease'
                  }} />
                </div>
                {semActual[i] > 0 && (
                  <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textAlign: 'center' }}>
                    {fmtK(semActual[i])}
                  </div>
                )}
                <div style={{ fontSize: 10, fontWeight: 700, color: esHoy ? 'var(--purple)' : 'var(--text3)' }}>{d}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[['#534AB7','Ingresos', semActual.reduce((a,b)=>a+b,0)],['#e05050','Gastos', semGastos.reduce((a,b)=>a+b,0)]].map(([c,l,v]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{l}: <strong style={{ color: 'var(--text)' }}>{fmt(v)}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen hoy */}
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

      {/* Diagrama semanal */}
      {(() => {
        const dias = ['L','M','X','J','V','S','D']
        const ingresos = state.semActual || [0,0,0,0,0,0,0]
        const gastos = state.semGastosActual || [0,0,0,0,0,0,0]
        const maxVal = Math.max(...ingresos, ...gastos, 1)
        const hoyIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
        return (
          <div className="card">
            <div className="card-title">Movimiento de la semana</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 72, marginBottom: 8 }}>
              {dias.map((d, i) => {
                const hI = Math.max(3, Math.round((ingresos[i] / maxVal) * 64))
                const hG = Math.max(3, Math.round((gastos[i] / maxVal) * 64))
                const esHoy = i === hoyIdx
                return (
                  <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                      <div style={{ width: 10, height: ingresos[i] > 0 ? hI : 3, borderRadius: '3px 3px 0 0', background: esHoy ? 'var(--purple)' : '#CECBF6', transition: 'height .3s' }} />
                      <div style={{ width: 10, height: gastos[i] > 0 ? hG : 3, borderRadius: '3px 3px 0 0', background: esHoy ? 'var(--red)' : '#fcc', transition: 'height .3s' }} />
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: esHoy ? 'var(--purple)' : 'var(--text3)' }}>{d}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--purple)' }} />
                <span style={{ color: 'var(--text3)' }}>Ingresos {fmt(ingresos.reduce((a,b)=>a+b,0))}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--red)' }} />
                <span style={{ color: 'var(--text3)' }}>Gastos {fmt(gastos.reduce((a,b)=>a+b,0))}</span>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
