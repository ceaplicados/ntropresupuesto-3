import { configureStore } from '@reduxjs/toolkit'
import parametersReducer from './parametersSlice'
import estadoReducer from './estadoSlice'

export default configureStore({
  reducer: {
    parameters: parametersReducer,
    estado: estadoReducer
  }
})