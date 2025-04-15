import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch,useSelector } from 'react-redux'
import axios from '../api/axios';
import { selectNewYear, setInpc, setEstados } from '../parametersSlice'

function General({breadcrumb, ocultarDeflactor, redirectLogin}) {
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
              dispatch(setInpc(data));
              localStorage.setItem('INPC', JSON.stringify(data));
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
}

export default General