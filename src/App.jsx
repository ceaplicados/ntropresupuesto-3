import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout"
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import EstadosData from './components/EstadosData'

import Federal from "./pages/Federal/Federal";
import Estado from "./pages/Estado/Estado";
import UR from "./pages/UR/UR";
import Login from "./pages/Login/Login";
import Cuadernos from "./pages/Cuadernos/Cuadernos";
import DetalleCuaderno from "./pages/Cuadernos/DetalleCuaderno";
import Usuario from "./pages/Usuario";

function App() {
  const estadosHabilitados = ["JAL","CDMX"];
  return (
    <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<PersistLogin/>}>
            {/* public routes */}
            <Route index element={<Federal />} />
            <Route element={<EstadosData/>}>
              { 
                estadosHabilitados.map( (estado) => {
                  return(<>
                  <Route key={'Estado'} path={estado} element={<Estado />} />
                  <Route key={'UR'} path={estado+'/ur/*'} element={<UR />} />
                  </>)
                })
              }
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
