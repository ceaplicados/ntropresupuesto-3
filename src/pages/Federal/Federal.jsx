import { useSelector, useDispatch } from 'react-redux'
import './Federal.css'
import GastoFederalizado from './GastoFederalizado';
import PresupuestoFederal from './PresupuestoFederal';
import { setPage } from '../../parametersSlice'
import { useEffect } from 'react';

function Federal() {
  const dispatch = useDispatch();
  const selectedYear = useSelector(state => state.parameters.selectedYear);
  const inpc = useSelector(state => state.parameters.inpc);
  const page = useSelector(state => state.parameters.page);

  useEffect(()=>{
    const datosPage={
      ...page,
      title: '#NuestroPresupuesto',
      breadcrumb: [{
        texto: 'Gasto federalizado'
      }],
      ocultarDeflactor: false
    }
    dispatch(setPage(datosPage));
  },[]);

  
  return (
    <>
      <h1>Dashboard <small>Gasto federalizado</small></h1>
      <p className='subtitle'>Miles de millones de pesos a valores del {selectedYear}</p>
      <PresupuestoFederal selectedYear={selectedYear} inpc={inpc}/>
      <GastoFederalizado selectedYear={selectedYear} inpc={inpc}/>
      <p className='mt-4'>Elaborado con los datos publicados por Transparencia Presupuestaria en <a href='https://www.transparenciapresupuestaria.gob.mx/' target='_blank'>transparenciapresupuestaria.gob.mx</a></p>
    </>
  )
}

export default Federal
