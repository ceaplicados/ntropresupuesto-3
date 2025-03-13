import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectNewYear, setInpc, setSearchParams, setEstados, setApi_url } from '../parametersSlice'
import './Breadcrumb.css'
import config_param from '../../config/config'

function Breadcrumb() {
    const dispatch = useDispatch();
    const api_url=useSelector(state => state.parameters.api_url)
    const [urlVariables,setUrlVariables] = useSearchParams();
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)
    const estados = useSelector(state => state.parameters.estados)

    // Poner el valor a los parámetros
    useEffect(() => {
        dispatch(setApi_url(config_param.api_url));
      },[]);

    // valores del INPC de la API
    useEffect(() => {
        if(api_url){
            // obtener versiones de los datasets
            fetch(api_url+'/Datos')
            .then(response => response.json())
            .then(data => {
                // obtener la versión actual del dataset INPC
                let datsetINPC = data.filter((dataset) => {
                    return dataset.dataset == "/INPC"
                })
                let versionINPC = datsetINPC.version || 0;                
                if(versionINPC!==parseInt(localStorage.getItem("versionINPC"))){
                    // obtener la versión actualizada del dataset INPC
                    fetch(api_url+'/INPC')
                        .then(response => response.json())
                        .then(data => {
                            dispatch(setInpc(data));
                            localStorage.setItem('INPC', JSON.stringify(data));
                            localStorage.setItem('versionINPC', versionINPC);
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }else{
                    // utilizar el INPC del localStorage
                    dispatch(setInpc(JSON.parse(localStorage.getItem('INPC'))));
                }
            })
        }
      }, [api_url]);

      // Obtener el listado de estados de la API si es que no está en localStorage
      useEffect(() => {
        if(api_url){
            var estadosLocal=localStorage.getItem('estados');
            if(estadosLocal){
                dispatch(setEstados(JSON.parse(estadosLocal)));
            }else{
                fetch(api_url+'/Estados')
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('estados',JSON.stringify(data));
                    dispatch(setEstados(data));
                })
                .catch(error => {
                    console.error(error);
                });
            }
        }
      },[api_url]);

    // Obtener la variable del selectedYear de la URL
      useEffect(() => {
        if(urlVariables.get('i')){
            dispatch(setSearchParams({i: urlVariables.get('i')})) 
            dispatch(selectNewYear(urlVariables.get('i')))
        }
      },[]);
    
    // Cambiar el valor del selectedYear y actualizarlo en variable de la URL
    const updateSelectedYear = (e) => {
        setUrlVariables({i: e.value});
        dispatch(setSearchParams({i: e.value}));
        dispatch(selectNewYear(e.value));
    };

    return (
        <>
        <section className='container d-flex justify-content-between' id='breadcrumb'>
        <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
            <li className="breadcrumb-item">
            <a href="/"><img src='/img/logo.svg'/></a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
            Gasto federalizado
            </li>
        </ol>
        </nav>
        <div className='row row-cols-lg-auto align-items-top'>
        <div className='col-12'>A valores del </div>
        <div className='col-12'>
            <select id='yearSelector' className="form-select form-select-sm" value={selectedYear} onChange={(e) => updateSelectedYear(e.target)}>
            {Object.keys(inpc).map(year => (
                <option key={year} value={year}>
                {year}
                </option>
            ))}
            </select>
        </div>
        </div>
    </section>
        </>
    );
}

export default Breadcrumb