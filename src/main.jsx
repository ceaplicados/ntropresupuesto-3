import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './store'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CookiesProvider } from 'react-cookie'
import { AuthProvider } from "./AuthProvider";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> 
      <GoogleOAuthProvider clientId="1037180436791-sinvga9fjqs7qajf6v0g413auk6sj6de.apps.googleusercontent.com">
      <CookiesProvider>
          <BrowserRouter>
          <AuthProvider>
          <Routes>
              <Route path="/*" element={<App />} />
          </Routes>
          </AuthProvider>
          </BrowserRouter>
      </CookiesProvider>
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
