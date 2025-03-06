import { createSlice } from '@reduxjs/toolkit'

export const parametersSlice = createSlice({
  name: 'parameters',
  initialState: {
    selectedYear: new Date().getFullYear(),
    inpc: {},
    estados: [],
    searchParams: {}
  },
  reducers: {
    selectNewYear: (state, action) => {
        state.selectedYear = action.payload
    },
    setInpc: (state, action) => {
        state.inpc = action.payload
    },
    setEstados: (state, action) => {
        state.estados = action.payload
    },
    setSearchParams: (state, action) => {
        state.searchParams = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { selectNewYear, setInpc, setSearchParams, setEstados } = parametersSlice.actions

export default parametersSlice.reducer