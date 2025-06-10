import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams, useLocation } from 'react-router-dom'
import useCantidadLetra from '../../hooks/useCantidadLetra';
import axios from '../../api/axios'
import { setPage } from '../../parametersSlice'
import { Link } from 'react-router-dom'
import HistoricoProgramaPresupuestal from './HistoricoProgramaPresupuestal';
import Indicadores from './Indicadores';

import './ProgramasPresupuestales.css';

const ProgramasPresupuestales = () => {
    const dispatch = useDispatch();
    const cantidadLetra = useCantidadLetra();
    const [urlVariables,setUrlVariables] = useSearchParams();
    const location = useLocation();
    const [cgActual,setCgActual]=useState({});
    const [urActual,setUrActual]=useState({});
    const [presupuestoTotal,setPresupuestoTotal]=useState(null);
    const [presupuestoTotalLetra,setPresupuestoTotalLetra]=useState('');
    const [presupuestoHistorico,setPresupuestoHistorico]=useState([]);
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)
    const page = useSelector(state => state.parameters.page)
    const versiones = useSelector(state => state.estado.versiones)
    const versionActual = useSelector(state => state.estado.versionActual)
    const estadoActual = useSelector(state => state.estado.actualEstado);
    
    // Obtener el presupuesto histórico del capítulo de gasto
    useEffect(() => {
        if(versiones.length>0 && estadoActual.Codigo){
            const path=location.pathname.split('/');
            const claveCG=path[3];
            if(cgActual?.Clave !== claveCG){
                const getHistoricoCG = async (claveCG) => {
                    const idsVersiones=versiones.filter((version) => version.Actual).map((version) => version.Id);
                    urlVariables.get('v') ?
                        !idsVersiones.includes(urlVariables.get('v')) ? idsVersiones.push(urlVariables.get('v')) : null
                        : null; 
                    const response = await axios(estadoActual.Codigo+'/Programas/'+claveCG+'?v='+idsVersiones.join(','));
                    response?.data?.presupuestos?.length>0 ? setPresupuestoHistorico(response.data.presupuestos) : null;
                    response?.data?.programa ? setCgActual(response.data.programa) : null;
                }
                getHistoricoCG(claveCG);

                const getUR = async (claveUR) => {
                    const response = await axios(estadoActual.Codigo+'/URs?q='+claveUR);
                    response?.data?.length>0 ? setUrActual(response.data[0]) : {};
                }
                getUR(claveCG.substring(0,claveCG.lastIndexOf('-')));
                window.scrollTo(0,0);
            }
        }
    },[estadoActual,location,versiones]);

    // Actualizar el breadcrumb
    useEffect(() => {
        let urlVars=[];
        urlVariables.get('i') ? urlVars.push('i='+urlVariables.get('i')) : null;
        urlVariables.get('v') ? urlVars.push('v='+urlVariables.get('v')) : null;
        urlVars=urlVars.join('&');
        urlVars.length>0 ? urlVars='?'+urlVars : null;
        const datosPage={
            ...page,
            title: estadoActual.Nombre+': '+cgActual?.Clave+' - '+cgActual?.Nombre,
            breadcrumb: [{
                texto: estadoActual.Nombre,
                url: '/'+estadoActual.Codigo+urlVars
            },{
                texto: urActual?.Clave+' - '+urActual?.Nombre,
                url: '/'+estadoActual.Codigo+'/ur/'+urActual?.Clave+urlVars
            },{
                texto: cgActual?.Clave+' - '+cgActual?.Nombre
            }
            ],
            ocultarDeflactor: false
        }
        dispatch(setPage(datosPage));
    },[estadoActual, cgActual,selectedYear]);
    
    // Actualizar los totales actuales
    useEffect(() => {
        let montoActual=0;
        let presupuestoActual=presupuestoHistorico.filter((presupuesto) => presupuesto.Id===versionActual.Id);
        if(presupuestoActual.length>0){
            montoActual=presupuestoActual[0].Monto*inpc[selectedYear]/inpc[versionActual.Anio];
            setPresupuestoTotal(montoActual);
            setPresupuestoTotalLetra(cantidadLetra(montoActual));
        }
    },[presupuestoHistorico,versionActual,selectedYear]);

    return(<>
    <h1>{cgActual?.Clave} <small>{cgActual?.Nombre}</small></h1>
    <h4>{urActual?.Clave} <small>{urActual?.Nombre}, {estadoActual.Nombre} <Link to={'./../../ur/'+urActual?.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link></small></h4>
    <p className='subtitle'><span className='version' onClick={() => {setShowModalVersiones(true)}}>{ versionActual ? versionActual?.Tipo+' '+versionActual?.Anio : '' }</span> a valores del {selectedYear}</p>
    <p className='totalPresupuesto'>El presupuesto para el programa <i>{cgActual?.Nombre}</i> para el año {versionActual?.Anio} es de $ {presupuestoTotal ? presupuestoTotal.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) : null } a valores del {selectedYear}</p>
    <p className='presupuestoLetra'>{ presupuestoTotalLetra }</p>
    <HistoricoProgramaPresupuestal presupuestoHistorico={presupuestoHistorico} />
    <Indicadores claveProgramaPresupuestal={cgActual?.Clave} />
    </>)
}

export default ProgramasPresupuestales