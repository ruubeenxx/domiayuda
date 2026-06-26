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
  semActual: [0, 0, 0, 0, 0, 0, 0],
  semAnterior: [0, 0, 0, 0, 0, 0, 0],
  // Metas de ahorro
  metas: [],
  // Deudas
  deudas: [],
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

    const ahora = new Date()
    const mesActual = ahora.getMonth()
    const anioActual = ahora.getFullYear()
    const fechaGuardada = new Date(parsed.fechaHoy || ahora.toDateString())
    const mesGuardado = fechaGuardada.getMonth()
    const anioGuardado = fechaGuardada.getFullYear()

    const esDiaNuevo = parsed.fechaHoy !== ahora.toDateString()
    const esMesNuevo = mesActual !== mesGuardado || anioActual !== anioGuardado

    if (esDiaNuevo) {
      // Calcular totales del día que terminó
      const ganadoAyer = parsed.movimientos.filter(m => m.monto > 0).reduce((a, m) => a + m.monto, 0)
      const gastadoAyer = parsed.movimientos.filter(m => m.monto < 0).reduce((a, m) => a + Math.abs(m.monto), 0)
      const domisAyer = parsed.movimientos.filter(m => m.tipo === 'ingreso').length

      // Acumular al historial mensual
      let historialMensual = parsed.historialMensual || []
      historialMensual.push({
        fecha: parsed.fechaHoy,
        ganado: ganadoAyer,
        gastado: gastadoAyer,
        domis: domisAyer,
        movimientos: parsed.movimientos || [],
      })

      // Gastos por categoría acumulados
      const gastosMes = parsed.gastosMes || { gas: 0, comida: 0, datos: 0, otros: 0 }
      gastosMes.gas += parsed.gastosPorCategoria?.gas || 0
      gastosMes.comida += parsed.gastosPorCategoria?.comida || 0
      gastosMes.datos += parsed.gastosPorCategoria?.datos || 0
      gastosMes.otros += parsed.gastosPorCategoria?.otros || 0

      const ganadoMes = (parsed.ganadoMes || 0) + ganadoAyer
      const gastadoMes = (parsed.gastadoMes || 0) + gastadoAyer

      // Domis pendientes
      const metaDiaria = parsed.metaMensual / 30
      const domisNecesariosAyer = Math.ceil(metaDiaria / parsed.precioDomi)
      const pendientes = domisAyer < domisNecesariosAyer
        ? (parsed.domisPendientes || 0) + (domisNecesariosAyer - domisAyer)
        : Math.max(0, (parsed.domisPendientes || 0) - (domisAyer - domisNecesariosAyer))

      // Semana
      const esLunes = ahora.getDay() === 1
      const semAnterior = esLunes ? [...parsed.semActual] : [...(parsed.semAnterior || [0,0,0,0,0,0,0])]
      const semActual = esLunes ? [0,0,0,0,0,0,0] : [...(parsed.semActual || [0,0,0,0,0,0,0])]

      // Si es mes nuevo — archivar el mes anterior y resetear todo
      if (esMesNuevo) {
        const nombreMes = fechaGuardada.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
        const archivoPrevio = parsed.archiveMeses || []
        archivoPrevio.push({
          mes: nombreMes,
          mesNum: mesGuardado,
          anio: anioGuardado,
          ganadoTotal: ganadoMes,
          gastadoTotal: gastadoMes,
          gastosMes,
          historialMensual,
          totalDomis: historialMensual.reduce((a, d) => a + d.domis, 0),
          diasTrabajados: historialMensual.filter(d => d.domis > 0).length,
          mejorDia: historialMensual.length > 0 ? historialMensual.reduce((a, b) => a.ganado > b.ganado ? a : b) : null,
        })

        return {
          ...parsed,
          movimientos: [],
          fechaHoy: ahora.toDateString(),
          fechaInicioMes: ahora.toDateString(),
          gastosPorCategoria: { gas: 0, comida: 0, datos: 0, otros: 0 },
          historialGastos: [],
          historialMensual: [],
          gastosMes: { gas: 0, comida: 0, datos: 0, otros: 0 },
          ganadoMes: 0,
          gastadoMes: 0,
          domisPendientes: 0,
          semActual: [0,0,0,0,0,0,0],
          semAnterior: [0,0,0,0,0,0,0],
          calendario: {},
          archiveMeses: archivoPrevio,
          gastosFijosApartado: 0,
          moto: { ...parsed.moto, gastoMes: 0 },
        }
      }

      return {
        ...parsed,
        movimientos: [],
        fechaHoy: ahora.toDateString(),
        gastosPorCategoria: { gas: 0, comida: 0, datos: 0, otros: 0 },
        historialGastos: [],
        historialMensual,
        gastosMes,
        ganadoMes,
        gastadoMes,
        domisPendientes: pendientes,
        semActual,
        semAnterior,
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
    case 'DELETE_MOV': {
      const mov = state.movimientos.find(m => m.id === action.payload)
      if (!mov) return state
      let newGastos = { ...state.gastosPorCategoria }
      let newHistorial = state.historialGastos.filter(h => h.id !== action.payload)
      if (mov.monto < 0) {
        const abs = Math.abs(mov.monto)
        const d = mov.desc.toLowerCase()
        if (d.includes('gasolin') || d.includes('gas')) newGastos.gas = Math.max(0, newGastos.gas - abs)
        else if (d.includes('comida') || d.includes('almuerzo') || d.includes('cena')) newGastos.comida = Math.max(0, newGastos.comida - abs)
        else if (d.includes('dato') || d.includes('plan') || d.includes('celular')) newGastos.datos = Math.max(0, newGastos.datos - abs)
        else newGastos.otros = Math.max(0, newGastos.otros - abs)
      }
      return { ...state, movimientos: state.movimientos.filter(m => m.id !== action.payload), gastosPorCategoria: newGastos, historialGastos: newHistorial }
    }
    case 'DELETE_META':
      return { ...state, metas: state.metas.filter(m => m.id !== action.payload) }
    case 'DELETE_DEUDA':
      return { ...state, deudas: state.deudas.filter(d => d.id !== action.payload) }
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
    case 'UPDATE_CONFIG':
      return { ...state, ...action.payload }
    case 'SET_CAL_DIA': {
      const newCal = { ...state.calendario }
      if (action.payload.cumplido === undefined) delete newCal[action.payload.fecha]
      else newCal[action.payload.fecha] = action.payload.cumplido
      return { ...state, calendario: newCal }
    }
    case 'EDITAR_DEUDA':
      return { ...state, deudas: state.deudas.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) }
    case 'EDITAR_CUOTAS_PAGADAS':
      return { ...state, deudas: state.deudas.map(d => d.id === action.payload.id ? { ...d, cuotasPagadas: action.payload.cuotasPagadas } : d) }
    case 'PAGAR_CUOTA': {
      const deudas = state.deudas.map(d => {
        if (d.id !== action.payload) return d
        const nuevasPagadas = (d.cuotasPagadas || 0) + 1
        return { ...d, cuotasPagadas: nuevasPagadas }
      })
      return { ...state, deudas }
    }
    case 'RESET_MES':
      return {
        ...state,
        movimientos: [],
        fechaHoy: new Date().toDateString(),
        fechaInicioMes: new Date().toDateString(),
        gastosPorCategoria: { gas: 0, comida: 0, datos: 0, otros: 0 },
        historialGastos: [],
        historialMensual: [],
        gastosMes: { gas: 0, comida: 0, datos: 0, otros: 0 },
        ganadoMes: 0,
        gastadoMes: 0,
        domisPendientes: 0,
        semActual: [0,0,0,0,0,0,0],
        semAnterior: [0,0,0,0,0,0,0],
        calendario: {},
        gastosFijosApartado: 0,
        moto: { ...state.moto, gastoMes: 0 },
      }
    case 'RESET_SEMANA':
      return { ...state, semActual: [0,0,0,0,0,0,0], semAnterior: [0,0,0,0,0,0,0] }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    localStorage.setItem('domiayuda_state', JSON.stringify(state))
  }, [state])

  // Totales del día actual
  const ganadoHoy = state.movimientos.filter(m => m.monto > 0).reduce((a, m) => a + m.monto, 0)
  const gastadoHoy = state.movimientos.filter(m => m.monto < 0).reduce((a, m) => a + Math.abs(m.monto), 0)
  const propinas = state.movimientos.filter(m => m.tipo === 'propina').reduce((a, m) => a + m.monto, 0)
  const domisHoy = state.movimientos.filter(m => m.tipo === 'ingreso').length
  const balance = ganadoHoy - gastadoHoy

  // Totales del mes = acumulado + hoy
  const ganadoMesTotal = (state.ganadoMes || 0) + ganadoHoy
  const gastadoMesTotal = (state.gastadoMes || 0) + gastadoHoy
  const ganado = ganadoMesTotal

  const hoy = new Date()

  // Usar fecha de inicio del mes (reset o día 1)
  const fechaInicioMes = state.fechaInicioMes ? new Date(state.fechaInicioMes) : new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const fechaFinMes = new Date(fechaInicioMes)
  fechaFinMes.setMonth(fechaFinMes.getMonth() + 1)
  fechaFinMes.setDate(fechaFinMes.getDate() - 1)

  const diasTotalesPeriodo = Math.round((fechaFinMes - fechaInicioMes) / (1000 * 60 * 60 * 24)) + 1
  const diasRestantes = Math.max(1, Math.round((fechaFinMes - hoy) / (1000 * 60 * 60 * 24)) + 1)

  const faltaMensual = Math.max(0, state.metaMensual - ganado)
  const porDia = diasRestantes > 0 ? Math.ceil(faltaMensual / diasRestantes) : 0
  const domisBase = Math.ceil(porDia / state.precioDomi)
  const domisNecesarios = domisBase + state.domisPendientes

  const totalGastosFijos = state.gastosFijos.reduce((a, g) => a + g.monto, 0)

  return (
    <AppContext.Provider value={{
      state, dispatch,
      ganado, ganadoHoy, gastadoHoy, propinas, domisHoy, balance,
      ganadoMesTotal, gastadoMesTotal,
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
