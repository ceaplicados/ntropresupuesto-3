import { useEffect } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux';
import axios from '../api/axios'
import { setActualEstado, setVersiones, setVersionActual } from '../estadoSlice'

const EstadosData = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const [urlVariables,setUrlVariables] = useSearchParams();
    const actualEstado = useSelector(state => state.estado.actualEstado);
    const versiones = useSelector(state => state.estado.versiones);
    const estados = useSelector(state => state.parameters.estados);
    const versionActual = useSelector(state => state.estado.versionActual);

    // obtener el estado actual de acuerdo a la ruta de la URL
    useEffect(() => {
        if(estados.length>0){
            const path=location.pathname.split('/');
            const codigoEstado=path[1];
            if(!actualEstado.Id || actualEstado.Codigo!==codigoEstado){
                const filter=estados.filter((itemEstado) => { return itemEstado.Codigo == codigoEstado });
                if(filter.length>0){
                    dispatch(setActualEstado(filter[0]));
                }
            }
        }
    },[estados, actualEstado]);

    // Realizar acciones al cambiar de estado actual
    useEffect(() => {
        if(actualEstado.Id)
        {
            // Obtener las versiones de presupuesto disponibles
            if(versiones[0]?.Estado!==actualEstado.Id)
            {
                const updateVersiones = async () => {
                    const response = await axios(actualEstado.Codigo);
                    const versiones=response.data;
                    dispatch(setVersiones(versiones));
                    
                    // verificar que la versión actual seleccionada o establecida en la URL corresponda al estado seleccionado
                    let idVersionActual = versionActual?.Id;
                    urlVariables.get('v')
                        ? idVersionActual=urlVariables.get('v')
                        : null;
                    if(idVersionActual){
                        const existeVersion=versiones.filter( (version) => { return version.Id == idVersionActual } );
                        existeVersion.length===0
                            ? dispatch(setVersionActual(versiones[0]))
                            : dispatch(setVersionActual(existeVersion[0]));
                    }else{
                        dispatch(setVersionActual(versiones[0]));
                    }
                }
                updateVersiones();
            }
        }
    },[actualEstado]);
    
    // Actualizar la versión actual
    useEffect(() => {
        if(versionActual?.Id){
            const nuevaVersion=versiones.filter( (version) => { return version.Id === versionActual.Id } );
            if(nuevaVersion.length>0){
                dispatch(setVersionActual(nuevaVersion[0]));
                const params = {};
                urlVariables.forEach((value, key) => {
                    params[key] = value;
                })
                params["v"]= nuevaVersion[0].Id
                setUrlVariables(params);
            }
        }
    },[versionActual])

    return(
        <Outlet />
    );
}
export default EstadosData;