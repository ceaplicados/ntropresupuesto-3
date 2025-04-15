import { createSlice } from '@reduxjs/toolkit'

export const estadoSlice = createSlice({
  name: 'estado',
  initialState: {
    actualEstado: {},
    unidadesPresupuestales: [],
    presupuestoUR: {},
    versiones: [],
    versionActual: {}
  },
  reducers: {
    setActualEstado: (state, action) => {
        state.actualEstado = action.payload
    },
    setUnidadesPresupuestales: (state, action) => {
        state.unidadesPresupuestales = action.payload
    },
    setPresupuestoUR: (state, action) => {
        state.presupuestoUR = action.payload
    },
    setVersiones: (state, action) => {
      state.versiones = action.payload
    },
    setVersionActual: (state, action) => {
      state.versionActual = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setPresupuestoUR, setActualEstado, setUnidadesPresupuestales, setVersiones, setVersionActual} = estadoSlice.actions

export default estadoSlice.reducer