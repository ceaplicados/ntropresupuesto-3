import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";

import Layout from "./components/Layout"
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import EstadosData from './components/EstadosData'

import Federal from "./pages/Federal/Federal";
import Estado from "./pages/Estado/Estado";
import UR from "./pages/UR/UR";
import UP from "./pages/UP/UP";
import CapituloGasto from "./pages/CapituloGasto/CapituloGasto";
import ConceptosGenerales from "./pages/ConceptosGenerales/ConceptosGenerales";
import PartidasGenericas from "./pages/PartidasGenericas/PartidasGenericas";
import ProgramasPresupuestales from "./pages/ProgramasPresupuestales/ProgramasPresupuestales";
import Login from "./pages/Login/Login";
import Cuadernos from "./pages/Cuadernos/Cuadernos";
import DetalleCuaderno from "./pages/Cuadernos/DetalleCuaderno";
import Usuario from "./pages/Usuario";

function App() {
  ReactGA.initialize("G-Z18PG9MX4L");
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
                  <Route key={'UP'} path={estado+'/up/*'} element={<UP />} />
                  <Route key={'CapituloGasto'} path={estado+'/CapituloGasto/*'} element={<CapituloGasto />} />
                  <Route key={'ConceptosGenerales'} path={estado+'/ConceptosGenerales/*'} element={<ConceptosGenerales />} />
                  <Route key={'PartidasGenericas'} path={estado+'/PartidasGenericas/*'} element={<PartidasGenericas />} />
                  <Route key={'PartidasGenericas'} path={estado+'/programa/*'} element={<ProgramasPresupuestales />} />
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
