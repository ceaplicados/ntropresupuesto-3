import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout"
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import EstadosData from './components/EstadosData'

import Federal from "./pages/Federal/Federal";
import Estado from "./pages/Estado/Estado";
import Login from "./pages/Login/Login";
import Cuadernos from "./pages/Cuadernos/Cuadernos";
import DetalleCuaderno from "./pages/Cuadernos/DetalleCuaderno";
import Usuario from "./pages/Usuario";

function App() {
  return (
    <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<PersistLogin/>}>
            {/* public routes */}
            <Route index element={<Federal />} />
            <Route element={<EstadosData/>}>
              <Route path="JAL" element={<Estado idEstado="14" />} />
              <Route path="CDMX" element={<Estado idEstado="9" />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="cuadernos" element={<Cuadernos />} />
            <Route path="cuaderno/*" element={<DetalleCuaderno />} />
            
            {/* protected routes */}
            <Route element={<RequireAuth />}>
              <Route path="profile" element={<Usuario />} />
            </Route>
            
            {/* catch all 
            <Route path="*" element={<Missing />} />
            */}
          </Route>
        </Route>
        
    </Routes>
  )
}
export default App
