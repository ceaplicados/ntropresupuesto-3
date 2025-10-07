import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { setPage } from '../../parametersSlice'
import { Row, Col, Button, Form, Tab, Tabs, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Icon  from '../../components/Icon';

import CuadernoFicha from '../../components/CuadernoFicha';
import type { CuadernoType } from '../../types';

import  './Cuadernos.css';

const Cuadernos = () => {
  const dispatch = useDispatch();
  const axiosPrivate = useAxiosPrivate();
  const user = useSelector((state: any) => state.parameters.user);
  const [cuadernosPublicos, setCuadernosPublicos] = useState<CuadernoType[]>([]);
  const [cuadernosPublicosFiltrados, setCuadernosPublicosFiltrados] = useState<CuadernoType[]>([]);
  const [filtroCuadernos, setFiltroCuadernos] = useState('');
  const [misCuadernos, setMisCuadernos] = useState<CuadernoType[]>([]);
  const [activeTab, setActiveTab] = useState<string|null>('publicos');
  const page = useSelector((state: any) => state.parameters.page);

  // configurar SEO y breadcrumb
  useEffect(()=>{
    const datosPage={
      ...page,
      title: 'Cuadernos de trabajo',
      breadcrumb: [{
        texto: 'Cuadernos de trabajo'
      }],
      ocultarDeflactor: true
    }
    dispatch(setPage(datosPage));
  },[]);

  // obtener cuadernos públicos

  useEffect(() => {
    const getCuadernosPublicos = async () => {
      const response = await axios('/Cuadernos');
      const data =  response?.data;
      setCuadernosPublicos(data);
    }
    getCuadernosPublicos();      
  },[]);

  // obtener la lista de cuadernos del usuario
  useEffect(() => {
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
      const cuadernosFiltrados=cuadernosPublicos.filter((cuaderno) => { 
        cuaderno.Descripcion=cuaderno.Descripcion ? cuaderno.Descripcion : '';
        return cuaderno.Nombre.toUpperCase().indexOf(filtroCuadernos.toUpperCase())>=0 || cuaderno.Descripcion.toUpperCase().indexOf(filtroCuadernos.toUpperCase())>=0 || cuaderno.Owner.Sobrenombre.toUpperCase().indexOf(filtroCuadernos.toUpperCase())>=0
      });
      setCuadernosPublicosFiltrados([...cuadernosFiltrados])

    }else{
      setCuadernosPublicosFiltrados(cuadernosPublicos)
    }
  },[filtroCuadernos,cuadernosPublicos]);

  const cuadernosPublicosGrid = () => {
    return(<Container>
    <h3>Cuadernos públicos</h3>
    <p className='mb-4'>Son cuadernos que han creado usuarios de #NuestroPresupuesto para consulta pública.</p>
    <Row className='mb-4'>
      <Col xs={12} md={6} lg={4}>
        <Form.Group className='input-group flex-nowrap'>
          <div className='input-group-text'>
            <Icon type='search'/>
          </div>
          <Form.Control id='filtroCuadernos' placeholder='Filtrar cuadernos' value={filtroCuadernos} onChange={(e) => setFiltroCuadernos(e.target.value)} />
        </Form.Group>
      </Col>
    </Row>
    <Row className="d-flex flex-wrap">
      {cuadernosPublicosFiltrados.map((cuaderno) => (
        <Col xs={12} md={6} lg={4} className="mb-4" key={cuaderno.Id}>
          <CuadernoFicha cuaderno={cuaderno} />
        </Col>
      ))}
    </Row>
    </Container>)
  }
  
  return (
    <section id='Cuadernos'>
      <Row>
        <Col xs={12} md={8}>
          <h1>Cuadernos <small>de trabajo</small></h1>
          <p className='subtitle'>Espacios de análisis creados por usuarios de #NuestroPresupuesto</p>
        </Col>
        <Col xs={12} md={4}>
          { user.UUID ? (
            <p className='text-end'>
            <Button variant='primary'>Crear cuaderno de trabajo</Button>
          </p>
          ) : null }
        </Col>
      
      </Row>
      { user.UUID ? ( <>
      <Tabs 
        id="tabsCuadernos" 
        className='mb-4'
        activeKey={activeTab ? activeTab : 'publicos'}
        onSelect={(k) => setActiveTab(k)}
      >
        <Tab eventKey="publicos" title="Públicos">
          {cuadernosPublicosGrid()}
        </Tab>
        <Tab eventKey="mis-cuadernos" title="Mis cuadernos">
          <Container>
            <h3 className='mb-4'>Mis cuadernos</h3>
            <Row className="d-flex flex-wrap">
              { misCuadernos.length>0 ? 
              misCuadernos.map((cuaderno) => (
                <Col xs={12} md={6} lg={4} className="mb-4" key={cuaderno.Id}>
                  <CuadernoFicha cuaderno={cuaderno} />
                </Col>
              ))
              : (
              <Col>
                <p className='mt-4'>No tienes cuadernos registrados, <Link to={'#'}  onClick={() => setActiveTab('publicos')}>ver cuadernos públicos</Link> o <Link to={'#'} >crea un nuevo cuaderno</Link>.</p>
              </Col>)}
            </Row>
          </Container>
        </Tab>
      </Tabs>
      </>) : (
        <>
        {cuadernosPublicosGrid()}
        </>
      ) }
    </section>
  )
}

export default Cuadernos
