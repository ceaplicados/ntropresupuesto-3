import { useSelector } from 'react-redux'
import './Federal.css'
import Header from './Header';
import Breadcrumb from './Breadcrumb'
import OffcanvasMenu from './OffcanvasMenu';

function Estado({estado}) {
  const selectedYear = useSelector(state => state.parameters.selectedYear)
  const inpc = useSelector(state => state.parameters.inpc)
 
  return (
    <>
    <Header/>
    <Breadcrumb/>
    <OffcanvasMenu />
      <section className='container' id='workspace'>
        <h1>Estado <small>{estado}</small></h1>
        <p className='subtitle'>A valores del {selectedYear}</p>
      </section>
    </>
  )
}

export default Estado
