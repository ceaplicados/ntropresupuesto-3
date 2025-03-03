import { useState,useEffect } from 'react'
import './App.css'
import Header from './Header';
import OffcanvasMenu from './OffcanvasMenu';
import GastoFederalizado from './GastoFederalizado';
import PresupuestoFederal from './PresupuestoFederal';

function App() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [inpc,setInpc] = useState({});

  useEffect(() => {
    fetch('https://api.nuestropresupuesto.mx/INPC')
      .then(response => response.json())
      .then(data => {
        setInpc(data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const updateSelectedYear = (e) => {
    setSelectedYear(e.value);
  };

  return (
    <>
      <Header/>
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
            <select className="form-select form-select-sm" value={selectedYear} onChange={(e) => updateSelectedYear(e.target)}>
              {Object.keys(inpc).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
      <section className='container' id='workspace'>
        <h1>Dashboard <small>Gasto federalizado</small></h1>
        <p className='subtitle'>Miles de millones de pesos a valores del {selectedYear}</p>
        <PresupuestoFederal selectedYear={selectedYear} inpc={inpc}/>
        <GastoFederalizado selectedYear={selectedYear} inpc={inpc}/>
        <p className='mt-4'>Elaborado con los datos publicados por Transparencia Presupuestaria en <a href='https://www.transparenciapresupuestaria.gob.mx/' target='_blank'>transparenciapresupuestaria.gob.mx</a></p>
      </section>
      <OffcanvasMenu />
    </>
  )
}

export default App
