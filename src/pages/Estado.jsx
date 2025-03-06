import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import './Federal.css'
import Header from './Header';
import Breadcrumb from './Breadcrumb'
import OffcanvasMenu from './OffcanvasMenu';

function Estado({idEstado}) {
  const selectedYear = useSelector(state => state.parameters.selectedYear)
  const inpc = useSelector(state => state.parameters.inpc)
  const estados = useSelector(state => state.parameters.estados)
  const [estadoActual,setEstadoActual]=useState({});

  useEffect(() => {
    let filter=estados.filter((itemEstado) => { return itemEstado.Id == parseInt(idEstado) });
    filter.length>0 ? setEstadoActual(filter[0]) : null;
  },[estados,idEstado]);
  return (
    <>
    <Header/>
    <Breadcrumb/>
    <OffcanvasMenu />
      <section className='container' id='workspace'>
        <h1>{estadoActual.Nombre} <small>Presupuesto estatal</small></h1>
        <p className='subtitle'>A valores del {selectedYear}</p>
      </section>
    </>
  )
}

export default Estado
