import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './store'
import Federal from "./pages/Federal/Federal";
import Estado from "./pages/Estado/Estado";
function App() {
  return (
      <Provider store={store}> 
        <BrowserRouter>
        <Routes>
          <Route index element={<Federal />} />
          <Route path="JAL" element={<Estado idEstado="14" />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}
export default App
