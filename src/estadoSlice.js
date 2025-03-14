import { createSlice } from '@reduxjs/toolkit'

export const estadoSlice = createSlice({
  name: 'estado',
  initialState: {
    actualEstado: {},
    unidadesPresupuestales: [],
    presupuestoUR: {}
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
    }
  }
})

// Action creators are generated for each case reducer function
export const { setPresupuestoUR, setActualEstado, setUnidadesPresupuestales} = estadoSlice.actions

export default estadoSlice.reducer