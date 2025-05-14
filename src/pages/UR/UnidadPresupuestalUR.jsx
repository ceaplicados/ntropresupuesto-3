import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Chart } from 'react-chartjs-2';
import axios from '../../api/axios';

const UnidadPresupuestalUR = ({urActual,presupuestoTotal}) => {
    const selectedYear = useSelector(state => state.parameters.selectedYear);
    const versionActual = useSelector(state => state.estado.versionActual)
    const estadoActual = useSelector(state => state.estado.actualEstado);
    const _colores = useSelector(state => state.parameters.colores);
    const inpc = useSelector(state => state.parameters.inpc);
    const [unidadPresupuestal,setUnidadPresupuestal] = useState({});
    const [unidadesResponsables,setUnidadesResponsables] = useState([]);
    const [deflactado,setDeflactado] = useState([]);
    const chartRef = useRef(null);
    const [configChart, setConfigChart] = useState({
        labels: [],
        datasets: [{
            data: [],
        }],
    });
    const optionsChart = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = ' '+context.dataset.label || ' ';
                        if (context.parsed !== null) {
                            label += ': '+ (context.parsed).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2});
                        }
                        return label;
                    }
                }
            }
        },
    };
    
    const getColor = (index) => {
        if (index < _colores.length) {
            return _colores[index];
        } else {
            return _colores[index % _colores.length];
        }
    }

    // Obtener la unidad presupuestal
    useEffect(() => {
        if(urActual.Id && versionActual.Id && estadoActual.Codigo){
            const fetchDataUP = async () => {
                try {
                    const response = await axios.get(estadoActual.Codigo+'/UPs/Presupuesto/'+urActual.Clave.substring(0,3)+'?v='+versionActual.Id);
                    setUnidadPresupuestal(response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchDataUP();
        }
    }, [estadoActual,versionActual,urActual]);

    // Obtener las unidades responsables de la unidad presupuestal
    useEffect(() => {
        if(urActual.Id && estadoActual.Codigo){
            const fetchDataURs = async () => {
                try {
                    const response = await axios.get(estadoActual.Codigo+'/URs?q='+urActual.Clave.substring(0,4));
                    setUnidadesResponsables(response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchDataURs();
        }
    }, [estadoActual,urActual]);


    // Obtener los presupuestos de las unidades responsables
    useEffect(() => {
        const valores = unidadesResponsables.map((ur,index) => {
            if(ur.Id===urActual.Id){
                return {
                    ...ur,
                    Monto: presupuestoTotal,
                    Color: getColor(index)
                }
            }
            else{
                const fetchDataUR = async (id) => {
                    try {
                        const response = await axios.get(estadoActual.Codigo+'/URs/Presupuesto/'+ur.Clave+'?v='+versionActual.Id);
                        let monto = null;
                        response.data.presupuesto.length>0 ? monto = response.data.presupuesto[0].Monto : null;
                        let montoDeflactado = null;
                        monto ? montoDeflactado = (monto / inpc[versionActual.Anio]) * inpc[selectedYear] : null;
                        return {
                            ...ur,
                            Monto: montoDeflactado,
                            Color: getColor(index)
                        }
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                };
                return fetchDataUR(ur.Id);
            }
        })
        Promise.all(valores).then((valores) => {
            setDeflactado(valores);

            // Configurar la gráfica
            const labels=valores.map((ur) => {
                return ur.Clave+' - '+ur.Nombre;
            });
            const dataChart=valores.map((ur) => {
                return ur.Monto;
            });
            const backgroundColor=valores.map((ur) => {
                return ur.Color;
            });

            setConfigChart({
            labels: labels,
            datasets: [{
                label: 'Unidades Responsables',
                data: dataChart,
                backgroundColor: backgroundColor,
            }],
            });
            if(chartRef.current){
                chartRef.current.update();
            }
        }
        );
    }, [unidadesResponsables,inpc, selectedYear,versionActual,presupuestoTotal]);

    return (<>
        <div className='row mb-4'>
            <div className='col-12 mb-3'>
                <h3>Unidad Presupuestal <small>Ente público a quien está sectorizado <i>{urActual.Nombre}</i></small></h3>
            </div>
            <div className='col-12 col-md-6 mb-4'>
                <h5 className='text-center mb-3'>{unidadPresupuestal?.unidadPresupuestal?.Clave} - {unidadPresupuestal?.unidadPresupuestal?.Nombre} <Link to={'./../../up/'+unidadPresupuestal?.unidadPresupuestal?.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link></h5>
                <Chart
                    ref={chartRef}
                    type='pie' 
                    data={configChart}  
                    options={optionsChart}
                    id='chartActual'
                    width='100%'
                    height={'80vw'}
                />
            </div>
            <div className='col-12 col-lg-6'>
                <table className='table table-bordered table-hover align-middle'>
                    <thead>
                        <tr>
                            <th scope='col'>Clave</th>
                            <th scope='col'>Unidad Responsable</th>
                            <th scope='col'>Monto {selectedYear}</th>
                            <th scope='col'>Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        { deflactado.filter((ur) => ur.Monto).map((ur) => {
                            return (
                            <tr key={ur.Id}>
                                <td className='text-nowrap'><span className='leyenda' style={{backgroundColor: ur.Color}}></span> {ur.Clave}</td>
                                <td>{ur.Nombre} <Link to={'./../'+ur.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link></td>
                                <td className='font-monospace text-end'>{ur.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                                <td className='font-monospace text-end'>{(ur.Monto/unidadPresupuestal?.presupuestos[0]?.Monto).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2})}</td>
                            </tr>
                            )}
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan='2' className='text-end'>Total</td>
                            <td className='font-monospace text-end'>{deflactado.reduce((total, ur) =>  total + ur.Monto, 0).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                            <td className='font-monospace text-end'>100%</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>  
    </>);
};

export default UnidadPresupuestalUR;