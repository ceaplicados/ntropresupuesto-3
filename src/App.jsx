import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './store'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CookiesProvider } from 'react-cookie'

import Federal from "./pages/Federal/Federal";
import Estado from "./pages/Estado/Estado";
import Login from "./pages/Login/Login";
import Cuadernos from "./pages/Cuadernos/Cuadernos";
import Usuario from "./pages/Usuario";

function App() {
  return (
      <Provider store={store}> 
        <GoogleOAuthProvider clientId="1037180436791-sinvga9fjqs7qajf6v0g413auk6sj6de.apps.googleusercontent.com">
          <CookiesProvider>
            <BrowserRouter>
            <Routes>
              <Route index element={<Federal />} />
              <Route path="JAL" element={<Estado idEstado="14" />} />
              <Route path="CDMX" element={<Estado idEstado="9" />} />
              <Route path="login" element={<Login />} />
              <Route path="cuadernos" element={<Cuadernos />} />
              <Route path="profile" element={<Usuario />} />
            </Routes>
            </BrowserRouter>
          </CookiesProvider>
        </GoogleOAuthProvider>
    </Provider>
  )
}
export default App
