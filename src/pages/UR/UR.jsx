import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams, useLocation } from 'react-router-dom'
import useCantidadLetra from '../../hooks/useCantidadLetra';
import axios from '../../api/axios'
import { setPage } from '../../parametersSlice'

import HistoricoUR from './HistoricoUR';
import CapituloGastoUR from './CapituloGastoUR';
import ProgramasUR from './ProgramasUR';
import UnidadPresupuestalUR from './UnidadPresupuestalUR';

import './UR.css'

const UR = () => {
    const dispatch = useDispatch();
    const cantidadLetra = useCantidadLetra();
    const [urlVariables,setUrlVariables] = useSearchParams();
    const location = useLocation();
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)
    const page = useSelector(state => state.parameters.page)
    const versiones = useSelector(state => state.estado.versiones)
    const versionActual = useSelector(state => state.estado.versionActual)
    const estadoActual = useSelector(state => state.estado.actualEstado);
    const [urActual,setUrActual]=useState({});
    const [presupuestoHistorico,setPresupuestoHistorico]=useState([]);
    const [presupuestoTotal,setPresupuestoTotal]=useState(null);
    const [presupuestoTotalLetra,setPresupuestoTotalLetra]=useState('');
    const [showModalVersiones, setShowModalVersiones] = useState(false);
    
    // Obtener el presupuesto histórico de la UR
    useEffect(() => {
        if(versiones.length>0 && estadoActual.Codigo){
            const path=location.pathname.split('/');
            const claveUR=path[3];
            if(urActual?.Clave !== claveUR){
                const getHistoricoUR = async (claveUR) => {
                    const idsVersiones=versiones.filter((version) => version.Actual).map((version) => version.Id);
                    urlVariables.get('v') ?
                        !idsVersiones.includes(urlVariables.get('v')) ? idsVersiones.push(urlVariables.get('v')) : null
                        : null; 
                    const response = await axios(estadoActual.Codigo+'/URs/Presupuesto/'+claveUR+'?v='+idsVersiones.join(','));
                    response?.data?.presupuesto?.length>0 ? setPresupuestoHistorico(response.data.presupuesto) : null;
                    response?.data?.unidadResponsable ? setUrActual(response.data.unidadResponsable) : null;
                }
                getHistoricoUR(claveUR);
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
            title: estadoActual.Nombre+': '+urActual?.Clave+' - '+urActual?.Nombre,
            breadcrumb: [{
                texto: estadoActual.Nombre,
                url: '/'+estadoActual.Codigo+urlVars
            },{
                texto: urActual?.Clave+' - '+urActual?.Nombre
            }
            ],
            ocultarDeflactor: false
        }
        dispatch(setPage(datosPage));
        setPresupuestoTotal(urActual?.Monto*inpc[selectedYear]/inpc[versionActual.Anio])
    },[estadoActual, urActual,selectedYear]);
    
    // Actualizar el histórico de presupuesto
    useEffect(() => {
        if(versionActual.Id){ 
            let total=presupuestoHistorico.filter((presupuesto) => presupuesto.Id===versionActual.Id);
            if(total.length>0){
                total=total[0].Monto*inpc[selectedYear]/inpc[versionActual.Anio];
                setPresupuestoTotal(total);
                setPresupuestoTotalLetra(cantidadLetra(total));
            }
        }
    },[presupuestoHistorico,versionActual,selectedYear]);

    return(<>
    <h1>{urActual?.Clave} <small>{urActual?.Nombre}</small></h1>
    <p className='subtitle'><span className='version' onClick={() => {setShowModalVersiones(true)}}>{ versionActual ? versionActual.Tipo+' '+versionActual.Anio : '' }</span> a valores del {selectedYear}</p>
    <p className='totalPresupuesto'>El presupuesto de {urActual?.Nombre}, {estadoActual?.Nombre} para el año {versionActual?.Anio} es de $ {presupuestoTotal ? presupuestoTotal.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) : null } a valores del {selectedYear}</p>
    <p className='presupuestoLetra'>{ presupuestoTotalLetra }</p>
    <HistoricoUR presupuestoHistorico={presupuestoHistorico} />
    <CapituloGastoUR urActual={urActual}/>
    <ProgramasUR urActual={urActual}/>
    <UnidadPresupuestalUR urActual={urActual} presupuestoTotal={presupuestoTotal}/>
    </>)
}

export default UR