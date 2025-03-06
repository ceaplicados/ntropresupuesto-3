import { useSelector } from 'react-redux'
import './Federal.css'
import Header from './Header';
import Breadcrumb from './Breadcrumb'
import OffcanvasMenu from './OffcanvasMenu';
import GastoFederalizado from './GastoFederalizado';
import PresupuestoFederal from './PresupuestoFederal';

function Federal() {
  const selectedYear = useSelector(state => state.parameters.selectedYear)
  const inpc = useSelector(state => state.parameters.inpc)

  return (
    <>
    <Header/>
    <Breadcrumb/>
    <OffcanvasMenu />

      <section className='container' id='workspace'>
        <h1>Dashboard <small>Gasto federalizado</small></h1>
        <p className='subtitle'>Miles de millones de pesos a valores del {selectedYear}</p>
        <PresupuestoFederal selectedYear={selectedYear} inpc={inpc}/>
        <GastoFederalizado selectedYear={selectedYear} inpc={inpc}/>
        <p className='mt-4'>Elaborado con los datos publicados por Transparencia Presupuestaria en <a href='https://www.transparenciapresupuestaria.gob.mx/' target='_blank'>transparenciapresupuestaria.gob.mx</a></p>
      </section>
    </>
  )
}

export default Federal
