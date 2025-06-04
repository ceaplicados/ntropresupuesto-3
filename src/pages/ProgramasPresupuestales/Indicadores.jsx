import { useState, useEffect } from 'react'
import { useSelector} from 'react-redux'
import axios from '../../api/axios'
import Card from 'react-bootstrap/Card';

import './Indicadores.css';

const Indicadores = ({claveProgramaPresupuestal}) => {
    const estadoActual = useSelector(state => state.estado.actualEstado);
    const [indicadores, setIndicadores] = useState([]);

    useEffect(() => {
        console.log("Fetching indicadores for:", claveProgramaPresupuestal);
        const fetchIndicadores = async () => {
            try {
                const response = await axios.get(estadoActual.Codigo+`/Indicadores/${claveProgramaPresupuestal}`);
                setIndicadores(response.data || []);
            } catch (error) {
                console.error("Error fetching indicadores:", error);
            }
        };

        fetchIndicadores();
    }, [claveProgramaPresupuestal]);
  
    return (
        <div className="indicadores-container">
            <h2>Indicadores del Programa Presupuestal</h2>
            {
            indicadores.filter((indicador) => indicador.Nivel=="Fin").map((indicador) => {
                return (<>
                    <div className='mb-4'>
                        <h4>Fin <small>Contribución a largo plazo</small></h4>
                        <div className='row'>
                            <div className='col-12 col-md-6 offset-md-3'>
                                <Card>
                                    <h5 className="card-title">{indicador.Nombre}</h5>
                                    <p className="card-text mb-3">{indicador.Resumen}</p>
                                    <p className="card-text mb-3 small-text"><b>Supuesto:</b> {indicador.Supuesto}</p>
                                    <p className="card-text mb-3 small-text"><b>Medios de verificación:</b> {indicador.Medios}</p>
                                    <p className="card-text mb-3 small-text text-end"><span className='idMIR'>Id: {indicador.IdMIR}</span></p>
                                </Card>
                            </div>
                        </div>
                        
                    </div>
                </>)})
            }
            {
            indicadores.filter((indicador) => indicador.Nivel=="Propósito").map((indicador) => {
                return (<>
                    <div className='mb-4'>
                        <h4>Propósito <small>Cambio directo que se busca lograr</small></h4>
                        <div className='col-12 col-md-6 offset-md-3'>
                            <Card>
                                <h5 className="card-title">{indicador.Nombre}</h5>
                                <p className="card-text mb-3">{indicador.Resumen}</p>
                                <p className="card-text mb-3 small-text"><b>Supuesto:</b> {indicador.Supuesto}</p>
                                <p className="card-text mb-3 small-text"><b>Medios de verificación:</b> {indicador.Medios}</p>
                                <p className="card-text mb-3 small-text text-end"><span className='idMIR'>Id: {indicador.IdMIR}</span></p>
                            </Card>
                        </div>
                    </div>
                </>)})
            }
            <div className='mb-4'>
                <h4>Componentes <small>Productos o servicios que se producen</small></h4>
                <div className='row'>
                {
                indicadores.filter((indicador) => indicador.Nivel=="Componente").map((indicador) => {
                    return (<>
                            <div className='col-12 col-md-6 mb-3'>
                                <Card>
                                    <h5 className="card-title">{indicador.Nombre}</h5>
                                    <p className="card-text mb-3">{indicador.Resumen}</p>
                                    <p className="card-text mb-3 small-text"><b>Supuesto:</b> {indicador.Supuesto}</p>
                                    <p className="card-text mb-3 small-text"><b>Medios de verificación:</b> {indicador.Medios}</p>
                                    <p className="card-text mb-3 small-text text-end"><span className='idMIR'>Id: {indicador.IdMIR}</span></p>
                                </Card>
                            </div>
                    </>)})
                }
                </div>
            </div>
            <div className='mb-4'>
                <h4>Actividades <small>Acciones concretas a realizar</small></h4>
                <div className='row'>
                {
                indicadores.filter((indicador) => indicador.Nivel=="Actividad").map((indicador) => {
                    return (<>
                            <div className='col-12 col-md-6 mb-3'>
                                <Card>
                                    <h5 className="card-title">{indicador.Nombre}</h5>
                                    <p className="card-text mb-3">{indicador.Resumen}</p>
                                    <p className="card-text mb-3 small-text"><b>Supuesto:</b> {indicador.Supuesto}</p>
                                    <p className="card-text mb-3 small-text"><b>Medios de verificación:</b> {indicador.Medios}</p>
                                    <p className="card-text mb-3 small-text text-end"><span className='idMIR'>Id: {indicador.IdMIR}</span></p>
                                </Card>
                            </div>
                    </>)})
                }
                </div>
            </div>
            {
            indicadores.length == 0 ? (
                <p>No hay indicadores disponibles para este programa.</p>
            ): null 
            }
        </div>
    );
}
export default Indicadores;