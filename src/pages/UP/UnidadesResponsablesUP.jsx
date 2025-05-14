import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Chart } from 'react-chartjs-2';
import axios from '../../api/axios';
import { Col } from 'react-bootstrap';

const UnidadesResponsablesUP = ({upActual}) => {
    const selectedYear = useSelector(state => state.parameters.selectedYear);
    const versionActual = useSelector(state => state.estado.versionActual);
    const versiones = useSelector(state => state.estado.versiones)
    const estadoActual = useSelector(state => state.estado.actualEstado);
    const _colores = useSelector(state => state.parameters.colores);
    const inpc = useSelector(state => state.parameters.inpc);
    const [unidadPresupuestal,setUnidadPresupuestal] = useState({});
    const [unidadesResponsables,setUnidadesResponsables] = useState([]);
    const [showGraphPresupuesto, setShowGraphPresupuesto] = useState('historico-stacked');
    const [presupuestosURs,setPresupuestosURs] = useState([]);
    const [presupuestosURsDeflactados,setPresupuestosURsDeflactados] = useState([]);
    const [deflactado,setDeflactado] = useState([]);
    const [renglonesTablaHistorico, setRenglonesTablaHistorico] = useState([]);
    const [renglonesTablaDiferencias, setRenglonesTablaDiferencias] = useState([]);
    const [totalesPresupuestos, setTotalesPresupuestos] = useState([]);
    const chartRefActual = useRef(null);
    const chartRef = useRef(null);
    const chartRefDiferencias = useRef(null);
    const [configChartActual, setConfigChartActual] = useState({
        labels: [],
        datasets: [{
            data: [],
        }],
    });
    const optionsChartActual = {
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
    const [configChart, setConfigChart] = useState({
        labels: [],
        datasets: [{
            data: [],
        }],
    });
    const [optionsChart,setOptionsChart] = useState({});
    const [configChartDiferencias, setConfigChartDiferencias] = useState({
        labels: [],
        datasets: [{
            label: 'Diferencia anual',
            data: [],
            borderColor: 'rgb(140, 180, 193)',
            backgroundColor: 'rgba(140, 180, 193, 0.5)',
            fill: true
          },],
    });
    const optionsChartDiferencias = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: 'Diferencia anual',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = ' '+context.dataset.label || ' ';
                        if (context.parsed.y !== null) {
                            label += ' '+(context.parsed.y).toFixed(2) + '%';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + '%';
                    }
                }
            }
        }
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
        if(upActual.Id && versionActual.Id && estadoActual.Codigo){
            const fetchDataUP = async () => {
                try {
                    const response = await axios.get(estadoActual.Codigo+'/UPs/Presupuesto/'+upActual.Clave+'?v='+versionActual.Id);
                    setUnidadPresupuestal(response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchDataUP();
        }
    }, [estadoActual,versionActual,upActual]);

    // Obtener las unidades responsables de la unidad presupuestal
    useEffect(() => {
        if(upActual.Id && estadoActual.Codigo){
            const fetchDataURs = async () => {
                try {
                    const response = await axios.get(estadoActual.Codigo+'/URs?q='+upActual.Clave+'-');
                    setUnidadesResponsables(response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchDataURs();
        }
    }, [estadoActual,upActual]);


    // Obtener los presupuestos de las unidades responsables
    useEffect(() => {
        const valores = unidadesResponsables.map((ur,index) => {
            const fetchDataUR = async (id) => {
                try {
                    const idsVersiones= versiones.filter((version) => version.Actual).map((version) => {
                        return version.Id;
                    });
                    const response = await axios.get(estadoActual.Codigo+'/URs/Presupuesto/'+ur.Clave+'?v='+idsVersiones.join(','));
                    return response.data;
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            return fetchDataUR(ur.Id);
        })
        Promise.all(valores).then((valores) => {
            setPresupuestosURs(valores);
        }
        );
    }, [unidadesResponsables]);

    // Deflactar los presupuestos de las unidades responsables
    useEffect(() => {
        if(presupuestosURs.length>0){
            // Deflactar para la gráfica y tabla de Actual
            const actual= presupuestosURs.map((ur,index) => {
                const presupuestoActual = ur.presupuesto.filter((presupuesto) => {
                    if(presupuesto.Id==versionActual.Id){
                        return presupuesto;
                    }
                }
                );
                let presupuestoDeflactado = null;
                const color = getColor(index);
                if(presupuestoActual.length>0){
                    presupuestoDeflactado = presupuestoActual[0].Monto/ inpc[presupuestoActual[0].Anio]*inpc[selectedYear];
                } 
                return {
                    ... ur.unidadResponsable,
                    Monto: presupuestoDeflactado,
                    Color: getColor(index),
                }  
            })
            setDeflactado(actual);

            // Deflactar para la gráfica y tabla de Histórico
            const historico= presupuestosURs.map((ur,index) => {
                const color = getColor(index);
                const presupuestoHistorico = ur.presupuesto.map((presupuesto) => {
                    const montoDeflactado = presupuesto.Monto*inpc[selectedYear]/inpc[presupuesto.Anio];
                    return {
                        ...presupuesto,
                        Monto: montoDeflactado
                    }
                });
                return {
                    ur: ur.unidadResponsable,
                    Presupuestos: presupuestoHistorico,
                    Color: color,
                }  
            });
            console.log('historico',historico);
            setPresupuestosURsDeflactados(historico);

            const totales = versiones.filter((version) => version.Actual).map((version) => {
                let totalVersion = 0;
                historico.map((ur) => {
                    ur.Presupuestos.filter((presupuesto) => {
                        if(presupuesto.Id==version.Id){
                            totalVersion += presupuesto.Monto;
                        }
                    });
                });

                return {
                    Version: version,
                    Monto: totalVersion
                }
            });
            setTotalesPresupuestos(totales);

            // Configurar las gráficas históricas
            const optionsChartHistorico = {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = ' '+context.dataset.label || ' ';
                                if (context.parsed.y !== null) {
                                    label += ': '+ (context.parsed.y).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2});
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        stacked: false
                    }
                }
            };
            const configChartHistorico = {
                labels: versiones.filter((version) => version.Actual).map((version) => {
                    return version.Anio;
                }),
                datasets: historico.map((unidadResponsable) => {
                    return {
                        label: unidadResponsable.ur.Clave+' - '+unidadResponsable.ur.Nombre,
                        data: versiones.filter((version) => version.Actual).map((version) => {
                            let monto=0;
                            unidadResponsable.Presupuestos.map((presupuesto) => {
                                if(presupuesto.Id==version.Id){
                                    monto=presupuesto.Monto;
                                }
                            })
                            return monto;
                        }),
                        backgroundColor: unidadResponsable.Color,
                        color: unidadResponsable.Color,
                        borderColor: unidadResponsable.Color,
                        tension: 0.3,
                        fill: false
                    }
                }).sort().filter(n => n),
            };
            if(showGraphPresupuesto === 'historico'){
                setConfigChart(configChartHistorico)
                setOptionsChart(optionsChartHistorico);
            }else{
                setConfigChart({
                    ...configChartHistorico,
                    datasets: configChartHistorico.datasets.map((dataset) => {
                        return {
                            ...dataset,
                            fill: true
                        }
                    }
                    )
                });
                setOptionsChart({
                    ...optionsChartHistorico,
                    scales: {
                        y:{
                            stacked: true,
                        }
                    }
                })
            }
            if(chartRef.current && (showGraphPresupuesto === 'historico' || showGraphPresupuesto === 'historico-stacked')){
                chartRef.current.update();
            }

            // Configurar la gráfica de diferencias
            const versionesDiferencias = versiones.filter((version) => version.Actual);
            const labelDiferencias=versionesDiferencias.map((version) => {
                return version.Anio;
            }).splice(1);
            const renglonesDiferencias = historico.map((unidadResponsable) => {
                const dataDiferencias=[];
                for(let i=1; i<versionesDiferencias.length; i++){
                    let monto=0;
                    let montoAnterior=0;
                    unidadResponsable.Presupuestos.map((presupuesto) => {
                        if(presupuesto.Id==versionesDiferencias[i].Id){
                            monto=presupuesto.Monto;
                        }
                        if(presupuesto.Id==versionesDiferencias[i-1].Id){
                            montoAnterior=presupuesto.Monto;
                        }
                    })
                    const diferencia = (monto-montoAnterior)/montoAnterior;
                    dataDiferencias.push(diferencia);
                }
                return {
                    ur: unidadResponsable.ur,
                    Color: unidadResponsable.Color,
                    Diferencias: dataDiferencias,
                }
            }).sort().filter(n => n);
            console.log('renglonesDiferencias',renglonesDiferencias);
            const dataChartDiferencias={
                labels: labelDiferencias,
                datasets: renglonesDiferencias.map((unidadResponsable) => {
                    return {
                        label: unidadResponsable.ur.Clave+' - '+unidadResponsable.ur.Nombre,
                        data: unidadResponsable.Diferencias.map((diferencia) => {
                            if(diferencia){
                                return diferencia*100;
                            }else{
                                return null;
                            }
                        }
                        ),
                        backgroundColor: unidadResponsable.Color,
                        color: unidadResponsable.Color,
                        borderColor: unidadResponsable.Color,
                        fill: true
                    }
                })
            };
            setConfigChartDiferencias(dataChartDiferencias);
            if(chartRefDiferencias.current && showGraphPresupuesto === 'diferencia'){
                chartRefDiferencias.current.update();
            }
            setRenglonesTablaDiferencias(renglonesDiferencias);
        }
    }, [presupuestosURs,inpc, selectedYear,versionActual, showGraphPresupuesto]);

    useEffect(() => {
        // Configurar la gráfica actual
        const labelsActual=deflactado.map((ur) => {
            return ur.Clave+' - '+ur.Nombre;
        });
        const dataChartActual=deflactado.map((ur) => {
            return ur.Monto;
        });
        const backgroundColorActual=deflactado.map((ur) => {
            return ur.Color;
        });

        setConfigChartActual({
        labels: labelsActual,
        datasets: [{
            label: 'Unidades Responsables',
            data: dataChartActual,
            backgroundColor: backgroundColorActual,
        }],
        });
        if(chartRefActual.current && showGraphPresupuesto === 'actual'){
            chartRefActual.current.update();
        }
    }, [deflactado,showGraphPresupuesto]);

    return (<>
        <div className='row mb-4 mt-4'>
            <div className='col-12 mb-3'>
                <h3><small>Los entes públicos que ejercen el presupuesto dentro de esta Unidad Presupuestal son:</small></h3>
            </div>
            <div className='col-12 mb-4'>
                <div className='text-end opcionesGraph mb-2'>
                <button 
                        className={ showGraphPresupuesto=='actual' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }
                        title='Actual'
                        onClick={()=>setShowGraphPresupuesto('actual')}
                        >
                        <span className="material-symbols-outlined">pie_chart</span>
                    </button>
                    <button 
                        className={ showGraphPresupuesto=='historico' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }
                        title='Histórico'
                        onClick={()=>setShowGraphPresupuesto('historico')}
                        >
                        <span className="material-symbols-outlined">show_chart</span>
                    </button>
                    <button 
                        className={ showGraphPresupuesto=='historico-stacked' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }
                        title='Histórico'
                        onClick={()=>setShowGraphPresupuesto('historico-stacked')}
                        >
                        <span className="material-symbols-outlined">area_chart</span>
                    </button>
                    <button 
                        className={ showGraphPresupuesto=='diferencia' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }  
                        title='Diferencia anual'
                        onClick={()=>setShowGraphPresupuesto('diferencia')}
                        >
                        <span className="material-symbols-outlined">waterfall_chart</span>
                    </button>
                </div>
            </div>
            {showGraphPresupuesto === 'actual' ? (
                <>
            <div className='col-12 col-md-6 mb-4'>
                <Chart
                    ref={chartRefActual}
                    type='pie' 
                    data={configChartActual}  
                    options={optionsChartActual}
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
                                <td>{ur.Nombre} <Link to={'./../../ur/'+ur.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link></td>
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
            </>)  : showGraphPresupuesto === 'historico' || showGraphPresupuesto === 'historico-stacked' ? (
                <>
                    <div className='col-12 mb-3'>
                    <Chart
                        ref={chartRef}
                        type='line' 
                        data={configChart}  
                        options={optionsChart}
                        id='chartHistorico'
                        width='100%'
                        height={'40em'}
                    />
                    </div>
                </>
            ) : (
                <>
                    <div className='col-12 mb-3'>
                    <Chart
                        ref={chartRefDiferencias}
                        type='bar' 
                        data={configChartDiferencias}  
                        options={optionsChartDiferencias}
                        id='chartDiferencias'
                        width='100%'
                        height={'40em'}
                    />
                    </div>
                </>
            )}   
            {showGraphPresupuesto === 'historico' ||  showGraphPresupuesto === 'historico-stacked' ? (<>
            <div className='col-12 mb-3 mt-3'>
                <table className='table table-striped table-bordered table-responsive' id='tablaCapitulosGasto'>
                    <thead>
                        <tr>
                            <th>Capítulo</th>
                            { versiones.filter((version) => version.Actual).map((version) => {
                                    return (
                                        <th key={version.Id} className='text-center'>{version.Anio}</th>
                                    );
                                }
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {presupuestosURsDeflactados.map((renglon) => {
                            return (
                                <tr key={renglon.ur.Id}>
                                    <td>
                                        <span className='leyenda' style={{backgroundColor: renglon.Color}}></span>
                                        {renglon.ur.Clave} - {renglon.ur.Nombre} <Link to={'./../../ur/'+renglon.ur.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link>
                                    </td>
                                    { versiones.filter((version) => version.Actual).map((version) => {
                                        let presupuestoVersion = null;
                                        renglon.Presupuestos.filter((presupuesto) => {
                                            if(presupuesto.Id==version.Id){
                                                return presupuesto;
                                            }
                                        }
                                        ).map((presupuesto) => {
                                            presupuestoVersion = presupuesto;
                                            
                                        })
                                        return (
                                            <td key={version.Id} className='font-monospace text-end'>{presupuestoVersion ? presupuestoVersion.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) : '-'}</td>
                                        )
                                    }) }
                                </tr>
                            )  
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className='text-end'>Total:</td>
                            { versiones.filter((version) => version.Actual).map((version) => {
                                return totalesPresupuestos.filter((presupuesto) => {
                                    if(presupuesto.Version.Id===version.Id){
                                        return presupuesto;
                                    }
                                }
                                ).map((presupuesto) => {
                                    return (
                                        <td key={version.Id} className='font-monospace text-end'>{presupuesto.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                                    )
                                })
                            }) }
                        </tr>
                    </tfoot>
                </table>
            </div>
            </>) : null }         
            {showGraphPresupuesto === 'diferencia' ? (<>
            <div className='col-12 mb-3'>
                <table className='table table-striped table-bordered table-responsive' id='tablaCapitulosGasto'>
                    <thead>
                        <tr>
                            <th>Capítulo</th>
                            { versiones.filter((version) => version.Actual).map((version,index) => {
                                    if(index>0){
                                        return (
                                            <th key={version.Id} className='text-center'>{version.Anio}</th>
                                        );
                                    }
                                }
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {renglonesTablaDiferencias.map((renglon) => {
                            return (
                                <tr key={renglon.ur.Id}>
                                    <td>
                                        <span className='leyenda' style={{backgroundColor: renglon.Color}}></span>
                                        {renglon.ur.Clave} - {renglon.ur.Nombre} <Link to={'./../../ur/'+renglon.ur.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link>
                                    </td>
                                    { renglon.Diferencias.map((diferencia,index) => {
                                        return (
                                            <td key={index} className='font-monospace text-end'>{diferencia ? diferencia.toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2}) : '-' }</td>
                                        )
                                    }) }
                                </tr>
                            )  
                        })}
                    </tbody>
                </table>
            </div>
            </>) : null } 
        </div>  
    </>);
};

export default UnidadesResponsablesUP;