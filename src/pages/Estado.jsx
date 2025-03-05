import { useState,useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Federal.css'
import Header from './Header';
import OffcanvasMenu from './OffcanvasMenu';

function Estado({estado}) {
  const [searchParams, setSearchParams] = useSearchParams();
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
    setSearchParams({i: e.value});
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
    <OffcanvasMenu searchParams={searchParams}  />

      <section className='container' id='workspace'>
        <h1>Estado <small>{estado}</small></h1>
        <p className='subtitle'>A valores del {selectedYear}</p>
      </section>
    </>
  )
}

export default Estado
