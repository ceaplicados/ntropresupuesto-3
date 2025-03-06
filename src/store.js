import { configureStore } from '@reduxjs/toolkit'
import parametersReducer from './parametersSlice'

export default configureStore({
  reducer: {
    parameters: parametersReducer
  }
})