import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './store'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CookiesProvider } from 'react-cookie'

import Federal from "./pages/Federal/Federal";
import Estado from "./pages/Estado/Estado";
import Login from "./pages/Login/Login";

function App() {
  return (
      <Provider store={store}> 
        <GoogleOAuthProvider clientId="1037180436791-sinvga9fjqs7qajf6v0g413auk6sj6de.apps.googleusercontent.com">
          <CookiesProvider>
            <BrowserRouter>
            <Routes>
              <Route index element={<Federal />} />
              <Route path="JAL" element={<Estado idEstado="14" />} />
              <Route path="login" element={<Login />} />
            </Routes>
            </BrowserRouter>
          </CookiesProvider>
        </GoogleOAuthProvider>
    </Provider>
  )
}
export default App
