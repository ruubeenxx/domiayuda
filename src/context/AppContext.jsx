import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const initialState = {
  nombre: 'Luis Rubén',
  metaMensual: 2000000,
  precioDomi: 4000,
  capitalInicial: 20000,
  gastosFijos: [
    { id: 1, nombre: 'Arriendo', monto: 250000, icono: '🏠', apartado: 0 },
    { id: 2, nombre: 'Cuota moto', monto: 270000, icono: '🏍️', apartado: 0 },
  ],
  movimientos: [],
  domisPendientes: 0,
  racha: 0,
  gastosPorCategoria: { gas: 0, comida: 0, otros: 0 },
  historialGastos: [],
  semActual: [0,0,0,0,0,0,0],
  semAnterior: [0,0,0,0,0,0,0],
  semGastosActual: [0,0,0,0,0,0,0],
  metas: [],
  deudas: [],
  moto: { km: 0, gastoMes: 0, ultimoAceite: null, llanta: null, rtm: null, mantenimientos: [] },
  calendario: {},
  fechaHoy: new Date().toDateString(),
  fechaInicioMes: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toDateString(),
  ganadoMes: 0,
  gastadoMes: 0,
  historialMensual: [],
  gastosMes: { gas: 0, comida: 0, otros: 0 },
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

    // Migrar gastosFijos viejos que no tienen apartado
    const gastosFijos = (parsed.gastosFijos || []).map(g => ({
      ...g, apartado: g.apartado || 0
    }))

    if (esDiaNuevo) {
      const ganadoAyer = (parsed.movimientos || []).filter(m => m.monto > 0).reduce((a, m) => a + m.monto, 0)
      const gastadoAyer = (parsed.movimientos || []).filter(m => m.monto < 0).reduce((a, m) => a + Math.abs(m.monto), 0)
      const domisAyer = (parsed.movimientos || []).filter(m => m.tipo === 'ingreso').length

      let historialMensual = [...(parsed.historialMensual || [])]
      historialMensual.push({
        fecha: parsed.fechaHoy,
        ganado: ganadoAyer,
        gastado: gastadoAyer,
        domis: domisAyer,
        movimientos: parsed.movimientos || [],
      })

      const gastosMes = { ...(parsed.gastosMes || { gas: 0, comida: 0, otros: 0 }) }
      gastosMes.gas += parsed.gastosPorCategoria?.gas || 0
      gastosMes.comida += parsed.gastosPorCategoria?.comida || 0
      gastosMes.otros += (parsed.gastosPorCategoria?.otros || 0)

      const ganadoMes = (parsed.ganadoMes || 0) + ganadoAyer
      const gastadoMes = (parsed.gastadoMes || 0) + gastadoAyer

      const metaDiariaReal = parsed.metaMensual / 30
      const cumpliAyer = ganadoAyer >= metaDiariaReal
      const nuevaRacha = cumpliAyer ? (parsed.racha || 0) + 1 : 0

      const metaDiaria = parsed.metaMensual / 30
      const domisNecAyer = Math.ceil(metaDiaria / parsed.precioDomi)
      const pendientes = domisAyer < domisNecAyer
        ? (parsed.domisPendientes || 0) + (domisNecAyer - domisAyer)
        : Math.max(0, (parsed.domisPendientes || 0) - (domisAyer - domisNecAyer))

      const esLunes = ahora.getDay() === 1
      const semAnterior = esLunes ? [...(parsed.semActual || [0,0,0,0,0,0,0])] : [...(parsed.semAnterior || [0,0,0,0,0,0,0])]
      const semActual = esLunes ? [0,0,0,0,0,0,0] : [...(parsed.semActual || [0,0,0,0,0,0,0])]
      const semGastosActual = esLunes ? [0,0,0,0,0,0,0] : [...(parsed.semGastosActual || [0,0,0,0,0,0,0])]

      let deudas = [...(parsed.deudas || [])]
      const diaAyer = fechaGuardada.getDate()
      deudas = deudas.map(d => {
        if (d.frecuencia === 'quincenal' && (diaAyer === 1 || diaAyer === 15) && d.totalCuotas) {
          return { ...d, cuotasPagadas: Math.min(d.totalCuotas, (d.cuotasPagadas || 0) + 1) }
        }
        return d
      })

      if (esMesNuevo) {
        const nombreMes = fechaGuardada.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
        const archivoPrevio = [...(parsed.archiveMeses || [])]
        archivoPrevio.push({
          mes: nombreMes, mesNum: mesGuardado, anio: anioGuardado,
          ganadoTotal: ganadoMes, gastadoTotal: gastadoMes,
          gastosMes, historialMensual,
          totalDomis: historialMensual.reduce((a, d) => a + d.domis, 0),
          diasTrabajados: historialMensual.filter(d => d.domis > 0).length,
          mejorDia: historialMensual.length > 0 ? historialMensual.reduce((a, b) => a.ganado > b.ganado ? a : b) : null,
        })
        // Resetear apartado de gastos fijos al nuevo mes
        const gfReset = gastosFijos.map(g => ({ ...g, apartado: 0 }))
        return {
          ...parsed, deudas, gastosFijos: gfReset,
          movimientos: [],
          fechaHoy: ahora.toDateString(),
          fechaInicioMes: ahora.toDateString(),
          gastosPorCategoria: { gas: 0, comida: 0, otros: 0 },
          historialGastos: [],
          historialMensual: [],
          gastosMes: { gas: 0, comida: 0, otros: 0 },
          ganadoMes: 0, gastadoMes: 0,
          domisPendientes: 0, racha: nuevaRacha,
          semActual: [0,0,0,0,0,0,0], semAnterior: [0,0,0,0,0,0,0],
          semGastosActual: [0,0,0,0,0,0,0],
          calendario: {}, archiveMeses: archivoPrevio,
          moto: { ...parsed.moto, gastoMes: 0 },
        }
      }

      return {
        ...parsed, deudas, gastosFijos,
        movimientos: [],
        fechaHoy: ahora.toDateString(),
        gastosPorCategoria: { gas: 0, comida: 0, otros: 0 },
        historialGastos: [],
        historialMensual, gastosMes, ganadoMes, gastadoMes,
        domisPendientes: pendientes, racha: nuevaRacha,
        semActual, semAnterior, semGastosActual,
      }
    }

    return { ...parsed, gastosFijos }
  } catch {
    return initialState
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_MOV': {
      const { desc, monto, tipo, medioPago } = action.payload
      const movId = Date.now()
      const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
      const newMovs = [...state.movimientos, { id: movId, desc, monto, tipo, medioPago: medioPago || 'efectivo', hora }]
      let newGastos = { ...state.gastosPorCategoria }
      let newHistorial = [...state.historialGastos]
      let domisPend = state.domisPendientes
      const d = desc.toLowerCase()
      const semActual = [...state.semActual]
      const semGastosActual = [...(state.semGastosActual || [0,0,0,0,0,0,0])]
      const diaSem = new Date().getDay()
      const idx = diaSem === 0 ? 6 : diaSem - 1
      if (monto < 0) {
        const abs = Math.abs(monto)
        if (d.includes('gasolin') || d.includes('gas')) newGastos.gas += abs
        else if (d.includes('comida') || d.includes('almuerzo') || d.includes('cena')) newGastos.comida += abs
        else newGastos.otros += abs
        newHistorial = [{ id: movId, desc, monto: abs, hora }, ...newHistorial]
        semGastosActual[idx] += abs
      } else {
        if (domisPend > 0) domisPend--
        semActual[idx] += monto
      }
      return { ...state, movimientos: newMovs, gastosPorCategoria: newGastos, historialGastos: newHistorial, domisPendientes: domisPend, semActual, semGastosActual }
    }
    case 'ADD_GASTO_FIJO':
      return { ...state, gastosFijos: [...state.gastosFijos, { ...action.payload, id: Date.now(), apartado: 0 }] }
    case 'REMOVE_GASTO_FIJO':
      return { ...state, gastosFijos: state.gastosFijos.filter(g => g.id !== action.payload) }
    // Abonar a un gasto fijo (descuenta del capital)
    case 'ABONAR_GASTO_FIJO': {
      const { id, monto } = action.payload
      const gastosFijos = state.gastosFijos.map(g =>
        g.id === id ? { ...g, apartado: Math.min(g.monto, (g.apartado || 0) + monto) } : g
      )
      // Registrar como movimiento de gasto
      const movId = Date.now()
      const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
      const gasto = state.gastosFijos.find(g => g.id === id)
      const newMovs = [...state.movimientos, { id: movId, desc: `Pago ${gasto?.nombre || 'gasto fijo'}`, monto: -monto, tipo: 'gasto_fijo', hora }]
      const semGastosActual = [...(state.semGastosActual || [0,0,0,0,0,0,0])]
      const idx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
      semGastosActual[idx] += monto
      return { ...state, gastosFijos, movimientos: newMovs, semGastosActual }
    }
    case 'EDITAR_APARTADO_GASTO_FIJO': {
      const { id, apartado } = action.payload
      const gastosFijos = state.gastosFijos.map(g => g.id === id ? { ...g, apartado: Math.max(0, Math.min(g.monto, apartado)) } : g)
      return { ...state, gastosFijos }
    }
    case 'DELETE_MOV': {
      const mov = state.movimientos.find(m => m.id === action.payload)
      if (!mov) return state
      let newGastos = { ...state.gastosPorCategoria }
      let newHistorial = state.historialGastos.filter(h => h.id !== action.payload)
      const semActual = [...state.semActual]
      const semGastosActual = [...(state.semGastosActual || [0,0,0,0,0,0,0])]
      const diaSem = new Date().getDay()
      const idx = diaSem === 0 ? 6 : diaSem - 1
      if (mov.monto < 0) {
        const abs = Math.abs(mov.monto)
        const d = mov.desc.toLowerCase()
        if (d.includes('gasolin') || d.includes('gas')) newGastos.gas = Math.max(0, newGastos.gas - abs)
        else if (d.includes('comida') || d.includes('almuerzo') || d.includes('cena')) newGastos.comida = Math.max(0, newGastos.comida - abs)
        else newGastos.otros = Math.max(0, newGastos.otros - abs)
        semGastosActual[idx] = Math.max(0, semGastosActual[idx] - abs)
      } else {
        semActual[idx] = Math.max(0, semActual[idx] - mov.monto)
      }
      return { ...state, movimientos: state.movimientos.filter(m => m.id !== action.payload), gastosPorCategoria: newGastos, historialGastos: newHistorial, semActual, semGastosActual }
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
    // Pagar cuota de deuda — descuenta del capital
    case 'PAGAR_CUOTA': {
      const deuda = state.deudas.find(d => d.id === action.payload)
      if (!deuda) return state
      const deudas = state.deudas.map(d =>
        d.id === action.payload ? { ...d, cuotasPagadas: Math.min(d.totalCuotas || 999, (d.cuotasPagadas || 0) + 1) } : d
      )
      // Registrar como movimiento
      const movId = Date.now()
      const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
      const newMovs = [...state.movimientos, { id: movId, desc: `Cuota ${deuda.nombre}`, monto: -deuda.cuota, tipo: 'deuda', hora }]
      const semGastosActual = [...(state.semGastosActual || [0,0,0,0,0,0,0])]
      const idx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
      semGastosActual[idx] += deuda.cuota
      return { ...state, deudas, movimientos: newMovs, semGastosActual }
    }
    case 'EDITAR_DEUDA':
      return { ...state, deudas: state.deudas.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) }
    case 'EDITAR_CUOTAS_PAGADAS':
      return { ...state, deudas: state.deudas.map(d => d.id === action.payload.id ? { ...d, cuotasPagadas: action.payload.cuotasPagadas } : d) }
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
    case 'RESET_MES': {
      const gfReset = (state.gastosFijos || []).map(g => ({ ...g, apartado: 0 }))
      return {
        ...state,
        gastosFijos: gfReset,
        movimientos: [],
        fechaHoy: new Date().toDateString(),
        fechaInicioMes: new Date().toDateString(),
        gastosPorCategoria: { gas: 0, comida: 0, otros: 0 },
        historialGastos: [],
        historialMensual: [],
        gastosMes: { gas: 0, comida: 0, otros: 0 },
        ganadoMes: 0, gastadoMes: 0,
        domisPendientes: 0,
        semActual: [0,0,0,0,0,0,0], semAnterior: [0,0,0,0,0,0,0],
        semGastosActual: [0,0,0,0,0,0,0],
        calendario: {},
        moto: { ...state.moto, gastoMes: 0 },
      }
    }
    case 'RESET_SEMANA':
      return { ...state, semActual: [0,0,0,0,0,0,0], semAnterior: [0,0,0,0,0,0,0], semGastosActual: [0,0,0,0,0,0,0] }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    localStorage.setItem('domiayuda_state', JSON.stringify(state))
  }, [state])

  const ganadoHoy = state.movimientos.filter(m => m.monto > 0).reduce((a, m) => a + m.monto, 0)
  const gastadoHoy = state.movimientos.filter(m => m.monto < 0).reduce((a, m) => a + Math.abs(m.monto), 0)
  const propinas = state.movimientos.filter(m => m.tipo === 'propina').reduce((a, m) => a + m.monto, 0)
  const domisHoy = state.movimientos.filter(m => m.tipo === 'ingreso').length
  // Bug 7 fix: balance incluye TODOS los movimientos (ingresos - todos los gastos incluyendo deudas y gastos fijos)
  const balance = state.movimientos.reduce((a, m) => a + m.monto, 0)

  const ganadoMesTotal = (state.ganadoMes || 0) + ganadoHoy
  const gastadoMesTotal = (state.gastadoMes || 0) + gastadoHoy
  const ganado = ganadoMesTotal

  const hoy = new Date()

  // Bug 6 fix: parsear fecha de inicio correctamente sin desfase de zona horaria
  let fechaInicioMes
  if (state.fechaInicioMes) {
    const d = new Date(state.fechaInicioMes)
    fechaInicioMes = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  } else {
    fechaInicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  }
  const fechaFinMes = new Date(fechaInicioMes.getFullYear(), fechaInicioMes.getMonth() + 1, fechaInicioMes.getDate())

  const diasTotalesPeriodo = Math.round((fechaFinMes - fechaInicioMes) / (1000 * 60 * 60 * 24))
  const hoyMidnight = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const diaActualPeriodo = Math.max(1, Math.floor((hoyMidnight - fechaInicioMes) / (1000 * 60 * 60 * 24)) + 1)
  const diasRestantes = Math.max(1, diasTotalesPeriodo - diaActualPeriodo + 1)

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
      diasRestantes, diasTotalesPeriodo, diaActualPeriodo, porDia, domisBase, domisNecesarios,
      totalGastosFijos,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
