import { useEffect } from 'react'
import { useSearchParams, Outlet } from "react-router-dom";
import Header from './Header';
import Breadcrumb from './Breadcrumb'
import OffcanvasMenu from './OffcanvasMenu';
import { useDispatch } from 'react-redux'
import axios from '../api/axios';
import { selectNewYear, setInpc, setEstados } from '../parametersSlice'


const Layout = () => {
    const dispatch = useDispatch();
    const [urlVariables,setUrlVariables] = useSearchParams();

    // obtener datasets
        useEffect(() => {
          const obtenerDatasets = async () => {
            const response = await axios ('/Datos')
            const data=response.data;
            let datsetINPC = data.filter((dataset) => {
              return dataset.dataset == "/INPC"
            })
            let versionINPC = datsetINPC.version || 0;                
            if(versionINPC!==parseInt(localStorage.getItem("versionINPC"))){
                const obtenerINPC = async () => {
                  const response = await axios('/INPC');
                  const data=response.data;
                  let datosINPC = {}
                  data.map((item) => {
                    datosINPC[item.year] = item.value;
                  })
                  dispatch(setInpc(datosINPC));
                  localStorage.setItem('INPC', JSON.stringify(datosINPC));
                  localStorage.setItem('versionINPC', versionINPC);
                }
                obtenerINPC();
            }else{
                // utilizar el INPC del localStorage
                dispatch(setInpc(JSON.parse(localStorage.getItem('INPC'))));
            }
          }
          obtenerDatasets();
        }, []);
    
        // Obtener el listado de estados de la API si es que no está en localStorage
        useEffect(() => {
            var estadosLocal=localStorage.getItem('estados');
            if(estadosLocal){
                dispatch(setEstados(JSON.parse(estadosLocal)));
            }else{
              const getEstados = async () => {
                const response = await axios('/Estados')
                const data=response.data;
                localStorage.setItem('estados',JSON.stringify(data));
                    dispatch(setEstados(data));
              }
              getEstados();
            }
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