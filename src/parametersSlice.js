import { createSlice } from '@reduxjs/toolkit'

export const parametersSlice = createSlice({
  name: 'parameters',
  initialState: {
    selectedYear: new Date().getFullYear(),
    inpc: {},
    searchParams: {}
  },
  reducers: {
    selectNewYear: (state, action) => {
        state.selectedYear = action.payload
    },
    setInpc: (state, action) => {
        state.inpc = action.payload
    },
    setSearchParams: (state, action) => {
        console.log('reduccer setSearchParams',action.payload);
        state.searchParams = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { selectNewYear, setInpc, setSearchParams } = parametersSlice.actions

export default parametersSlice.reducer