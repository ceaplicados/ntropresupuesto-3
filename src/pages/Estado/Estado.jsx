import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import axios from '../../api/axios'
import { setPresupuestoUR, setUnidadesPresupuestales, setVersionActual } from '../../estadoSlice'
import { setPage } from '../../parametersSlice'

import TreemapURs from './TreemapURs';
import Historico from './Historico';
import CapitulosGasto from './CapitulosGasto';
import TablaURs from './TablaURs';
import ProgramasPresupuestales from './ProgramasPresupuestales';
import './Estado.css'

function Estado() {
  const dispatch = useDispatch();
  const [urlVariables,setUrlVariables] = useSearchParams();
  const selectedYear = useSelector(state => state.parameters.selectedYear)
  const page = useSelector(state => state.parameters.page)
  const inpc = useSelector(state => state.parameters.inpc)
  const versiones = useSelector(state => state.estado.versiones)
  const versionActual = useSelector(state => state.estado.versionActual)
  const estadoActual = useSelector(state => state.estado.actualEstado);
  const [dataPresupuestoURs,setDataPresupuestoURs]=useState({});
  const [showModalVersiones, setShowModalVersiones] = useState(false);
  
  
  // Actualizar el breadcrumb
  useEffect(() => {
    const datosPage={
      ...page,
      breadcrumb: [{
        texto: estadoActual.Nombre
      }],
      ocultarDeflactor: false
    }
    dispatch(setPage(datosPage));
  },[estadoActual]);

  // Obtener el presupuesto por URs del API
  useEffect(() => {
    if(estadoActual.Codigo && versionActual.Id){
        let url='/'+estadoActual.Codigo+'/URs/Presupuesto';
        let fetchData=false;
        if(dataPresupuestoURs?.versionPresupuesto && versionActual.Id){
          if(dataPresupuestoURs?.versionPresupuesto?.Id!==versionActual.Id){
            versionActual.Id ? url+='?v='+versionActual.Id : null;
            fetchData=true;
          }
        }else{
          fetchData=true;
        }
        if(fetchData){
          const getDataPresupuesto = async (url) => {
            const response = await axios(url)
            const data = response?.data
            setDataPresupuestoURs(data);
          }
          getDataPresupuesto(url);
        }
    }   
  }, [estadoActual,versionActual]);

  // Obtener las UPs de la API
  useEffect(() => {
    if(estadoActual.Codigo){
        let url='/'+estadoActual.Codigo+'/UPs';
        const getPresupuestoURs = async (url) => {
          const response = await axios(url);
          const data = response?.data;
          dispatch(setUnidadesPresupuestales(data));
        }
        getPresupuestoURs(url);
    }   
  }, [estadoActual]);

  // deflactar el presupuesto de las URs
  useEffect(() => {
    if(dataPresupuestoURs.versionPresupuesto && selectedYear && inpc){
      let data={};
      if(selectedYear!==dataPresupuestoURs.versionPresupuesto.Anio){
        data.versionPresupuesto={...dataPresupuestoURs.versionPresupuesto};
        data.presupuesto=dataPresupuestoURs.presupuesto.map( (partida) => {
          let monto=partida.Monto;
          monto=monto*inpc[selectedYear]/inpc[dataPresupuestoURs.versionPresupuesto.Anio]
          return {...partida, Monto: monto}
        });

      }else{
        data={...dataPresupuestoURs}
      }
      dispatch(setPresupuestoUR(data));
    }
  },[dataPresupuestoURs,selectedYear,inpc])
    
  const changeVersionActual = (idVersion) => {
    dispatch(setVersionActual({...versionActual,Id: idVersion}))
    const params = {};
    urlVariables.forEach((value, key) => {
        params[key] = value;
    })
    params["v"]=idVersion;
    setUrlVariables(params);
    setShowModalVersiones(false);
  }


  return (
    <>
      <section className='container' id='workspace'>
        <h1>{estadoActual.Nombre} <small>Presupuesto estatal</small></h1>
        <p className='subtitle'><span className='version' onClick={() => {setShowModalVersiones(true)}}>{ versionActual ? versionActual.Tipo+' '+versionActual.Anio : '' }</span> a valores del {selectedYear}</p>
        <TreemapURs />
        <Historico />
        <CapitulosGasto />
        <TablaURs />
        <ProgramasPresupuestales />
      </section>
      <Modal show={showModalVersiones} onHide={() => {setShowModalVersiones(false)}} >
        <Modal.Header closeButton>
          <Modal.Title>Versiones del presupuesto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Selecciona una nueva versión de presupuesto:</p>
          <ul className='list-group' id='listaVersiones'>
            { versiones 
              ? versiones.map((version) => {
                  return(<><li key={version.Id} className='list-group-item' onClick={ () => {changeVersionActual(version.Id)}}>{version.Anio} <small>{version.Tipo}</small></li></>)
                }) 
              : null }
          </ul>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default Estado
