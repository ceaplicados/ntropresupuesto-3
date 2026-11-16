import { useEffect } from 'react'
import { useSearchParams, Outlet } from "react-router-dom";
import Header from './Header';
import Breadcrumb from './Breadcrumb'
import OffcanvasMenu from './OffcanvasMenu';
import { useDispatch } from 'react-redux'
import axios from '../api/axios';
import { selectNewYear, setInpc, setEstados } from '../parametersSlice'

// lectura/escritura de localStorage tolerante a datos corruptos o a navegadores sin acceso
const leerCache = (clave) => {
    try {
        const valor = localStorage.getItem(clave);
        return valor ? JSON.parse(valor) : null;
    } catch {
        return null;
    }
}

const guardarCache = (clave, valor) => {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
        // sin espacio o sin acceso a localStorage: no es crítico
    }
}

const Layout = () => {
    const dispatch = useDispatch();
    const [urlVariables,setUrlVariables] = useSearchParams();

    // INPC: stale-while-revalidate. Se usa la copia local de inmediato y
    // siempre se pide la versión actual a la API, porque los valores del INPC
    // (sobre todo las previsiones) pueden cambiar durante el año.
        useEffect(() => {
          const inpcLocal = leerCache('INPC');
          if(inpcLocal && typeof inpcLocal === 'object' && !Array.isArray(inpcLocal)){
            dispatch(setInpc(inpcLocal));
          }
          // llave de la invalidación anterior, ya no se usa
          try { localStorage.removeItem('versionINPC'); } catch { /* sin localStorage */ }

          axios('/INPC')
            .then((response) => {
              if(!Array.isArray(response.data)) throw new Error('Respuesta inesperada de /INPC');
              let datosINPC = {}
              response.data.forEach((item) => {
                datosINPC[item.year] = item.value;
              })
              dispatch(setInpc(datosINPC));
              guardarCache('INPC', datosINPC);
            })
            .catch((error) => {
              // se conserva la copia local, si existe
              console.warn('No se pudo actualizar el INPC', error);
            });
        }, []);

        // Estados: mismo esquema que el INPC
        useEffect(() => {
          const estadosLocal = leerCache('estados');
          if(Array.isArray(estadosLocal)){
            dispatch(setEstados(estadosLocal));
          }

          axios('/Estados')
            .then((response) => {
              if(!Array.isArray(response.data)) throw new Error('Respuesta inesperada de /Estados');
              dispatch(setEstados(response.data));
              guardarCache('estados', response.data);
            })
            .catch((error) => {
              console.warn('No se pudo actualizar el listado de estados', error);
            });
        },[]);
    
        // Obtener la variable del selectedYear de la URL
        useEffect(() => {
          if(urlVariables.get('i')){
            dispatch(selectNewYear(urlVariables.get('i')));
          }
        },[]);

    return (
        <>
        <Header/>
        <Breadcrumb/>
        <OffcanvasMenu />
        <main className='container' id='workspace'>
            <Outlet />
        </main>
        </>
    )
}

export default Layout