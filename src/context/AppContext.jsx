import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const initialState = {
  nombre: 'Luis Rubén',
  metaMensual: 2000000,
  precioDomi: 4000,
  capitalInicial: 20000,
  // Gastos fijos mensuales
  gastosFijos: [
    { id: 1, nombre: 'Arriendo', monto: 250000, icono: '🏠' },
    { id: 2, nombre: 'Cuota moto', monto: 270000, icono: '🏍️' },
  ],
  // Domis del día
  movimientos: [],
  domisPendientes: 0,
  racha: 3,
  // Finanzas acumuladas
  gastosPorCategoria: { gas: 0, comida: 0, datos: 0, otros: 0 },
  historialGastos: [],
  // Semanas
  semActual: [120000, 85000, 200000, 160000, 0, 0, 0],
  semAnterior: [90000, 110000, 160000, 140000, 80000, 200000, 50000],
  // Metas de ahorro
  metas: [
    { id: 1, nombre: 'Moto nueva', icono: '🏍️', meta: 2500000, ahorrado: 350000 },
    { id: 2, nombre: 'Celular', icono: '📱', meta: 800000, ahorrado: 180000 },
  ],
  // Deudas
  deudas: [
    { id: 1, nombre: 'Crédito banco', total: 1200000, cuota: 120000 },
  ],
  // Moto
  moto: { km: 0, gastoMes: 0, ultimoAceite: null, llanta: null, rtm: null, mantenimientos: [] },
  // Calendario — días cumplidos (true/false) indexados por "YYYY-MM-DD"
  calendario: {},
  // Fecha del día guardado para resetear al cambiar de día
  fechaHoy: new Date().toDateString(),
}

function loadState() {
  try {
    const saved = localStorage.getItem('domiayuda_state')
    if (!saved) return initialState
    const parsed = JSON.parse(saved)
    // Reset daily data if it's a new day
    if (parsed.fechaHoy !== new Date().toDateString()) {
      return {
        ...parsed,
        movimientos: [],
        fechaHoy: new Date().toDateString(),
        gastosPorCategoria: { gas: 0, comida: 0, datos: 0, otros: 0 },
        historialGastos: [],
      }
    }
    return parsed
  } catch {
    return initialState
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_MOV': {
      const { desc, monto, tipo } = action.payload
      const newMovs = [...state.movimientos, { id: Date.now(), desc, monto, tipo }]
      let newGastos = { ...state.gastosPorCategoria }
      let newHistorial = [...state.historialGastos]
      let domisPend = state.domisPendientes
      const d = desc.toLowerCase()
      if (monto < 0) {
        const abs = Math.abs(monto)
        if (d.includes('gasolin') || d.includes('gas')) newGastos.gas += abs
        else if (d.includes('comida') || d.includes('almuerzo') || d.includes('cena')) newGastos.comida += abs
        else if (d.includes('dato') || d.includes('plan') || d.includes('celular')) newGastos.datos += abs
        else newGastos.otros += abs
        newHistorial = [{ id: Date.now(), desc, monto: abs }, ...newHistorial]
      } else {
        if (domisPend > 0) domisPend--
      }
      const semActual = [...state.semActual]
      const diaSem = new Date().getDay()
      const idx = diaSem === 0 ? 6 : diaSem - 1
      semActual[idx] += Math.abs(monto)
      return { ...state, movimientos: newMovs, gastosPorCategoria: newGastos, historialGastos: newHistorial, domisPendientes: domisPend, semActual }
    }
    case 'ADD_GASTO_FIJO':
      return { ...state, gastosFijos: [...state.gastosFijos, { ...action.payload, id: Date.now() }] }
    case 'REMOVE_GASTO_FIJO':
      return { ...state, gastosFijos: state.gastosFijos.filter(g => g.id !== action.payload) }
    case 'ADD_META':
      return { ...state, metas: [...state.metas, { ...action.payload, id: Date.now() }] }
    case 'ABONAR_META': {
      const metas = state.metas.map(m => m.id === action.payload.id ? { ...m, ahorrado: m.ahorrado + action.payload.monto } : m)
      return { ...state, metas }
    }
    case 'ADD_DEUDA':
      return { ...state, deudas: [...state.deudas, { ...action.payload, id: Date.now() }] }
    case 'UPDATE_MOTO':
      return { ...state, moto: { ...state.moto, ...action.payload } }
    case 'ADD_MANT': {
      const mant = [...state.moto.mantenimientos, { ...action.payload, id: Date.now() }]
      return { ...state, moto: { ...state.moto, mantenimientos: mant, gastoMes: state.moto.gastoMes + (action.payload.costo || 0) } }
    }
    case 'SET_CAL_DIA':
      return { ...state, calendario: { ...state.calendario, [action.payload.fecha]: action.payload.cumplido } }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    localStorage.setItem('domiayuda_state', JSON.stringify(state))
  }, [state])

  // Computed values
  const ganado = state.movimientos.filter(m => m.monto > 0).reduce((a, m) => a + m.monto, 0)
  const gastadoHoy = state.movimientos.filter(m => m.monto < 0).reduce((a, m) => a + Math.abs(m.monto), 0)
  const propinas = state.movimientos.filter(m => m.tipo === 'propina').reduce((a, m) => a + m.monto, 0)
  const domisHoy = state.movimientos.filter(m => m.tipo === 'ingreso').length
  const balance = ganado - gastadoHoy

  const hoy = new Date()
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  const diaActual = hoy.getDate()
  const diasRestantes = diasMes - diaActual + 1
  const faltaMensual = Math.max(0, state.metaMensual - ganado)
  const porDia = diasRestantes > 0 ? Math.ceil(faltaMensual / diasRestantes) : 0
  const domisBase = Math.ceil(porDia / state.precioDomi)
  const domisNecesarios = domisBase + state.domisPendientes

  const totalGastosFijos = state.gastosFijos.reduce((a, g) => a + g.monto, 0)

  return (
    <AppContext.Provider value={{
      state, dispatch,
      ganado, gastadoHoy, propinas, domisHoy, balance,
      diasRestantes, porDia, domisBase, domisNecesarios,
      totalGastosFijos,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
