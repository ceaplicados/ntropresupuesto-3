import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom'
import { setPage } from '../../parametersSlice'

import  './Cuadernos.css';

function Cuadernos() {
  const dispatch = useDispatch();
  const axiosPrivate = useAxiosPrivate();
  const user = useSelector(state => state.parameters.user);
  const [cuadernosPublicos, setCuadernosPublicos] = useState([]);
  const [cuadernosPublicosFiltrados, setCuadernosPublicosFiltrados] = useState([]);
  const [filtroCuadernos, setFiltroCuadernos] = useState('');
  const [misCuadernos, setMisCuadernos] = useState([]);
  const page = useSelector(state => state.parameters.page);

  useEffect(()=>{
    const datosPage={
      ...page,
      breadcrumb: [{
        texto: 'Cuadernos de trabajo'
      }],
      ocultarDeflactor: true
    }
    dispatch(setPage(datosPage));
  },[]);

  useEffect(() => {
      // obtener la lista de cuadernos públicos
      const getCuadernosPublicos = async () => {
        const response = await axios('/Cuadernos');
        const data =  response?.data;
        setCuadernosPublicos(data);
      }
      getCuadernosPublicos();      

      // obtener la lista de cuadernos del usuario
      if(user.UUID){
        const getCuadernosUsuario = async () => {
          const response = await axiosPrivate.get('/Cuadernos/User');
          const data =  response?.data;
          setMisCuadernos(data)
        }
        getCuadernosUsuario();
      }
  },[user]);

  // filtrar cuadernos públicos
  useEffect(() => {
    if(filtroCuadernos.length>0){
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

  const showCuadernosPublicos = () => {
    var triggerEl = document.querySelector('#tabsCuadernos a[data-bs-target="#publicos"]')
    bootstrap.Tab.getInstance(triggerEl).show()
  }

  return (
    <>
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
        <div className="tab-content" id="tabContentCuadernos">
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
                    <div className="card-footer d-flex justify-content-between">
                      <div className='users'>
                        <img src={cuaderno.Owner.Image} className="owner-img" alt={cuaderno.Owner.Sobrenombre}  title={cuaderno.Owner.Sobrenombre}/>
                        <ul className='users-imgs'>
                          { 
                          cuaderno.Usuarios.map((usuario) => {
                            return (<li key={usuario.UUID}>
                              <img src={usuario.Image} className="owner-img" alt={usuario.Sobrenombre} title={usuario.Sobrenombre} />
                            </li>)
                          }) 
                          }
                        </ul>
                      </div>
                      <Link to={'/cuaderno/'+cuaderno.Id}><button className='btn btn-primary'>Ir</button></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          { user.UUID ? ( <>
          <div className="tab-pane fade show active" id="mis-cuadernos" role="tabpanel" aria-labelledby="mis-cuadernos-tab">
            <h3>Mis cuadernos</h3>
            <div className="d-flex flex-wrap">
            {
            misCuadernos.length>0 ?
              misCuadernos.map((cuaderno) => (
                  <div className="col-12 col-md-6 col-lg-4 mb-4" key={cuaderno.Id}>
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">{cuaderno.Nombre}</h5>
                        <p className="card-text">{cuaderno.Descripcion}</p>
                        
                      </div>
                      <div className="card-footer d-flex justify-content-between">
                        <div className='users'>
                          <img src={cuaderno.Owner.Image} className="owner-img" alt={cuaderno.Owner.Sobrenombre} title={cuaderno.Owner.Sobrenombre} />
                          <ul className='users-imgs'>
                            { 
                            cuaderno.Usuarios.map((usuario) => {
                              return (<li key={usuario.UUID}>
                                <img src={usuario.Image} className="owner-img" alt={usuario.Sobrenombre}  title={usuario.Sobrenombre}/>
                              </li>)
                            }) 
                            }
                          </ul>
                        </div>
                        <Link to={'/cuaderno/'+cuaderno.Id}><button className='btn btn-primary'>Ir</button></Link>
                      </div>
                    </div>
                  </div>
                ))
              :
              (<><p className='mt-4'>No tienes cuadernos registrados, <a href='#' onClick={showCuadernosPublicos}>ver cuadernos públicos</a>.</p></>)
              }
            </div>
          </div>
          </>) : null }
        </div>
      </section>
    </>
  )
}

export default Cuadernos
