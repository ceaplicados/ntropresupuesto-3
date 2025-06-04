import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import axios from '../../api/axios';
import { Link } from 'react-router-dom'

const ProgramasUR = ({urActual}) => {
    const selectedYear = useSelector(state => state.parameters.selectedYear);
    const versionActual = useSelector(state => state.estado.versionActual)
    const estadoActual = useSelector(state => state.estado.actualEstado);
    const inpc = useSelector(state => state.parameters.inpc);
    const [programasUR,setProgramasUR] = useState([]);
    const [deflactado,setDeflactado] = useState([]);

    // Obtener los programas para la versión actual
    useEffect(() => {
        if(urActual.Id && versionActual.Id && estadoActual.Codigo){
            const fetchData = async () => {
                try {
                    const response = await axios.get(estadoActual.Codigo+'/URs/Programas/'+urActual.Clave+'?v='+versionActual.Id);
                    setProgramasUR(response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }
    }, [estadoActual,versionActual,urActual]);

    // Deflactar los programas
    useEffect(() => {
        const valores= programasUR.map((programa) => {
            const monto = programa.Monto;
            const deflactado = (monto / inpc[versionActual.Anio]) * inpc[selectedYear];
            return {
                ...programa,
                Monto: deflactado
            };
        }
        );
        setDeflactado(valores);
    }, [programasUR,inpc, selectedYear]);

    return (<>
        <div className='row mb-4'>
            <div className='col-12 mb-3'>
                <h3>Programas presupuestales <small>¿Para qué se gasta?</small></h3>
            </div>
            <div className='col-12'>
                <table className='table table-bordered table-hover'>
                    <thead>
                        <tr>
                            <th scope='col'>Clave</th>
                            <th scope='col'>Nombre</th>
                            <th scope='col'>Monto {selectedYear}</th>
                            <th scope='col'>Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        { deflactado.map((programa) => {
                            const total = deflactado.reduce((total, programa) =>  total + programa.Monto, 0);
                            return (
                            <tr key={programa.Id}>
                                <td className='text-nowrap'>{programa.Clave} <Link to={'./../../programa/'+programa.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link></td>
                                <td>{programa.Nombre}</td>
                                <td className='font-monospace text-end'>{programa.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                                <td className='font-monospace text-end'>{(programa.Monto/total).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2})}</td>
                            </tr>
                            )}
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan='2' className='text-end'>Total</td>
                            <td className='font-monospace text-end'>{deflactado.reduce((total, programa) =>  total + programa.Monto, 0).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                            <td className='font-monospace text-end'>100%</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>  
    </>);
}

export default ProgramasUR;