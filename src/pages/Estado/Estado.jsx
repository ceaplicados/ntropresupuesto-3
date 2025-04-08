import { useState, useEffect, use } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setPresupuestoUR, setUnidadesPresupuestales, setActualEstado } from '../../estadoSlice'

import Header from '../Header';
import Breadcrumb from '../Breadcrumb'
import OffcanvasMenu from '../OffcanvasMenu';
import TreemapURs from './TreemapURs';
import Historico from './Historico';
import CapitulosGasto from './CapitulosGasto';
import TablaURs from './TablaURs';
import './Estado.css'

function Estado({idEstado}) {
  const dispatch = useDispatch();
  const api_url=useSelector(state => state.parameters.api_url);
  const selectedYear = useSelector(state => state.parameters.selectedYear)
  const inpc = useSelector(state => state.parameters.inpc)
  const estados = useSelector(state => state.parameters.estados)
  const dataPresupuesto = useSelector(state => state.estado.presupuestoUR)
  const unidadesPresupuestales = useSelector(state => state.estado.unidadesPresupuestales)
  const [estadoActual,setEstadoActual]=useState({});
  const [presupuestoActual,setPresupuestoActual]=useState({});
  const [dataPresupuestoURs,setDataPresupuestoURs]=useState({});
  const [breadcrumb,setBreadcrumb]=useState([]);
  
  // Guardar un objeto de estado en el estadoActual de acuerdo al idEstado
  useEffect(() => {
    let filter=estados.filter((itemEstado) => { return itemEstado.Id == parseInt(idEstado) });
    if(filter.length>0){
      setEstadoActual(filter[0])
      dispatch(setActualEstado(filter[0]));
      setBreadcrumb([{
        texto: filter[0].Nombre
      }]);
    };
  },[estados,idEstado]);

  // Obtener el presupuesto por URs del API
  useEffect(() => {
    if(api_url && estadoActual.Codigo){
        let url=api_url+'/'+estadoActual.Codigo+'/URs/Presupuesto';
        let fetchData=false;
        if(dataPresupuestoURs.versionPresupuesto && presupuestoActual.Id){
          if(dataPresupuestoURs.versionPresupuesto.Id!==presupuestoActual.Id){
            url+='?v='+presupuestoActual.Id;
            fetchData=true;
          }
        }else{
          fetchData=true;
        }
        if(fetchData){
          fetch(url)
          .then(response => response.json())
          .then(data => {  
            setDataPresupuestoURs(data);
            setPresupuestoActual(data.versionPresupuesto);
          })
          .catch(error => {
              console.error(error);
          });
        }
    }   
  }, [api_url,estadoActual,presupuestoActual]);

  // Obtener el presupuesto por URs del API
  useEffect(() => {
    if(api_url && estadoActual.Codigo){
        let url=api_url+'/'+estadoActual.Codigo+'/UPs';
        fetch(url)
        .then(response => response.json())
        .then(data => {  
          dispatch(setUnidadesPresupuestales(data));
        })
        .catch(error => {
            console.error(error);
        });
    }   
  }, [api_url,estadoActual]);

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
  
  return (
    <>
    <Header/>
    <Breadcrumb breadcrumb={breadcrumb}/>
    <OffcanvasMenu />
      <section className='container' id='workspace'>
        <h1>{estadoActual.Nombre} <small>Presupuesto estatal</small></h1>
        <p className='subtitle'>{ dataPresupuesto.versionPresupuesto ? dataPresupuesto.versionPresupuesto.Tipo+' '+dataPresupuesto.versionPresupuesto.Anio : '' } a valores del {selectedYear}</p>
        <TreemapURs />
        <Historico estadoActual={estadoActual}/>
        <CapitulosGasto estadoActual={estadoActual} presupuestoActual={presupuestoActual}/>
        <TablaURs />
      </section>
    </>
  )
}

export default Estado
