import { createSlice } from '@reduxjs/toolkit'

export const parametersSlice = createSlice({
  name: 'parameters',
  initialState: {
    selectedYear: new Date().getFullYear(),
    inpc: {},
    estados: [],
    searchParams: {},
    toasts: [],
    api_url: null,
    user: {
      UUID: null,
      sobrenombre: null,
      accessToken: null,
      expiresIn: null,
      image: null,
      init: false
    },
  },
  reducers: {
    selectNewYear: (state, action) => {
        state.selectedYear = parseInt(action.payload)
    },
    setInpc: (state, action) => {
        state.inpc = action.payload
    },
    setEstados: (state, action) => {
        state.estados = action.payload
    },
    setSearchParams: (state, action) => {
        state.searchParams = action.payload
    },
    addToast: (state, action) => {
      state.toasts = [...state.toasts , {...action.payload, show: true}]
    },
    hideToast: (state, action) => {
      state.toasts[action.payload.index] = {...state.toasts[action.payload.index], show : false};
    },
    setApi_url: (state, action) => {
      state.api_url = action.payload
    },
    updateUser: (state, action) => {
      state.user = {...action.payload}
    },
    logoutUser: (state, action) => {
      state.user = {
        UUID: null,
        sobrenombre: null,
        accessToken: null,
        expiresIn: null,
        image: null,
        init: true
      }
    }
  }
})

// Action creators are generated for each case reducer function
export const { selectNewYear, setInpc, setSearchParams, setEstados, setApi_url, addToast, hideToast, updateUser, logoutUser } = parametersSlice.actions

export default parametersSlice.reducer