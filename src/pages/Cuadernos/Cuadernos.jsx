import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Header from '../Header';
import Breadcrumb from '../Breadcrumb'
import OffcanvasMenu from '../OffcanvasMenu';
import  './Cuadernos.css';

function Cuadernos() {
  const dispatch = useDispatch();
  const api_url=useSelector(state => state.parameters.api_url);
  const user = useSelector(state => state.parameters.user);
  const [cuadernosPublicos, setCuadernosPublicos] = useState([]);
  const [cuadernosPublicosFiltrados, setCuadernosPublicosFiltrados] = useState([]);
  const [filtroCuadernos, setFiltroCuadernos] = useState('');
  const [misCuadernos, setMisCuadernos] = useState([]);

  // obtener la lista de cuadernos públicos
  useEffect(() => {
    if(api_url){
      fetch(api_url+'/Cuadernos')
      .then(response => response.json())
      .then(data => {
        setCuadernosPublicos(data);
      })
      .catch(error => {
          console.error(error);
      });
    }
  },[api_url]);

  // filtrar cuadernos públicos
  useEffect(() => {
    if(filtroCuadernos.length>0){
      console.log('Filtrando cuadernos',filtroCuadernos);
      let cuadernosFiltrados=cuadernosPublicos.filter((cuaderno) => { 
        cuaderno.Descripcion=cuaderno.Descripcion ? cuaderno.Descripcion : '';
        return cuaderno.Nombre.toUpperCase().indexOf(filtroCuadernos.toUpperCase())>=0 || cuaderno.Descripcion.toUpperCase().indexOf(filtroCuadernos.toUpperCase())>=0 || cuaderno.Owner.Sobrenombre.toUpperCase().indexOf(filtroCuadernos.toUpperCase())>=0
      });
      setCuadernosPublicosFiltrados([...cuadernosFiltrados])

    }else{
      setCuadernosPublicosFiltrados(cuadernosPublicos)
    }
  },[filtroCuadernos,cuadernosPublicos]);

  const breadcrumb=[{
      texto: "Cuadernos de trabajo"
  }];

  return (
    <>
    <Header/>
    <Breadcrumb breadcrumb={breadcrumb} ocultarDeflactor={false}/>
    <OffcanvasMenu />

      <section className='container' id='workspace'>
        <h1>Cuadernos <small>de trabajo</small></h1>
        <p className='subtitle'>Espacios de análisis creados por usuarios de #NuestroPresupuesto</p>
        { user.UUID ? ( <>
        <ul className="nav nav-tabs mb-4" id="tabsCuadernos" role="tablist">
          <li className="nav-item" role="presentation" >
            <a className="nav-link" aria-current="page" href="#" id="publicos-tab" data-bs-toggle="tab" data-bs-target="#publicos"  role="tab" aria-controls="publicos" aria-selected="false">Públicos</a>
          </li>
          <li className="nav-item" role="presentation" >
            <a className="nav-link active" href="#" id="mis-cuadernos-tab" data-bs-toggle="tab" data-bs-target="#mis-cuadernos"  role="tab" aria-controls="mis-cuadernos" aria-selected="true">Mis cuadernos</a>
          </li>          
        </ul>
        </>) : null }
        <div className="tab-content" id="myTabContent">
          <div className={ user.UUID ? "tab-pane fade" : "tab-pane fade show active"} id="publicos" role="tabpanel" aria-labelledby="publicos-tab">
            <h3>Cuadernos públicos</h3>
            <p className='mb-4'>Son cuadernos que han creado usuarios de #NuestroPresupuesto para consulta pública.</p>
            <div className='row'>
              <div className='col-12 col-md-6 col-lg-4 mb-4'>
                <div className='input-group flex-nowrap'>
                      <span className="input-group-text" id="addon-wrapping">
                          <span className="material-symbols-outlined">search</span>
                      </span>
                      <input type="text" className='form-control' id='filtroCuadernos' placeholder='Filtrar cuadernos' value={filtroCuadernos} onChange={(e) => setFiltroCuadernos(e.target.value)} />
                  </div>
              </div>
            </div>
            <div className="d-flex flex-wrap">
              {cuadernosPublicosFiltrados.map((cuaderno) => (
                <div className="col-12 col-md-6 col-lg-4 mb-4" key={cuaderno.Id}>
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{cuaderno.Nombre}</h5>
                      <p className="card-text">{cuaderno.Descripcion}</p>
                      
                    </div>
                    <div className="card-footer">
                      <img src={cuaderno.Owner.Image} className="owner-img" alt={cuaderno.Owner.Sobrenombre} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          { user.UUID ? ( <>
          <div className="tab-pane fade show active" id="mis-cuadernos" role="tabpanel" aria-labelledby="mis-cuadernos-tab">
            <h3>Mis cuadernos</h3>
            <div className="row">
            </div>
          </div>
          </>) : null }
        </div>
      </section>
    </>
  )
}

export default Cuadernos
