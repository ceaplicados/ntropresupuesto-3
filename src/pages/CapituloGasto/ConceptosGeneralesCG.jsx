import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Chart } from 'react-chartjs-2';
import axios from '../../api/axios'

const ConceptosGeneralesCG = ({cgActual}) => {
    const [conceptosGenerales,setConceptosGenerales]=useState([]);
    const [conceptosGeneralesDeflactado,setConceptosGeneralesDeflactado]=useState([]);
    const [urlVariables,setUrlVariables] = useSearchParams();
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)
    const versiones = useSelector(state => state.estado.versiones)
    const versionActual = useSelector(state => state.estado.versionActual)
    const estadoActual = useSelector(state => state.estado.actualEstado);
    const _colores = useSelector(state => state.parameters.colores);
    const [showGraphPresupuesto, setShowGraphPresupuesto] = useState('historico-stacked');
    const [renglonesTablaActual, setRenglonesTablaActual] = useState([]);
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
    
    // Obtener el presupuesto histórico por conceptos generales
    useEffect(() => {
        if(cgActual.Clave){
            const getHistoricoCG = async (claveCG) => {
                const idsVersiones=versiones.filter((version) => version.Actual).map((version) => version.Id);
                urlVariables.get('v') ?
                    !idsVersiones.includes(urlVariables.get('v')) ? idsVersiones.push(urlVariables.get('v')) : null
                    : null; 
                const response = await axios(estadoActual.Codigo+'/ConceptosGenerales/'+claveCG+'?v='+idsVersiones.join(','));
                response?.data?.length>0 ? setConceptosGenerales(response.data) : null;
            }
            getHistoricoCG(cgActual.Clave);
        }
    },[cgActual]);

    // Deflactar el presupuesto de los conceptos generales
    useEffect(() => {
        if(conceptosGenerales.length>0 && selectedYear){
            const defactado=conceptosGenerales.map((concepto,index) => {
                const presupuestos=concepto.presupuestos.map((presupuesto) => {
                    const monto=presupuesto.Monto*inpc[selectedYear]/inpc[presupuesto.Anio];
                    return {
                        ...presupuesto,
                        Monto: monto
                    }
                })
                return {
                    ...concepto,
                    presupuestos: presupuestos,
                    Color: getColor(index),
                }
            })
            setConceptosGeneralesDeflactado(defactado);

            // Calcular totales por año
            const totales=versiones.filter((version) => version.Actual).map((version) => {
                let total=0;
                defactado.map((concepto) => {
                    concepto.presupuestos.filter((presupuesto) => {
                        if(presupuesto.Id==version.Id){
                            total+=presupuesto.Monto;
                        }
                    })
                })
                return {Version: version, Monto: total}
            })
            setTotalesPresupuestos(totales);
        }
    },[conceptosGenerales,selectedYear,inpc]);

    // Actualizar las gráficas
    useEffect(() => {
        // Configurar la gráfica actual
        const labelsActual=conceptosGeneralesDeflactado.map((concepto) => {
            return concepto.conceptoGeneral.Clave+' - '+concepto.conceptoGeneral.Nombre;
        });
        let tablaActual=[];
        const dataChartActual=conceptosGeneralesDeflactado.map((concepto) => {
            let Monto = concepto.presupuestos.filter((presupuesto) => {
                if(presupuesto.Id==versionActual.Id){
                    tablaActual.push({
                        concepto: concepto.conceptoGeneral,
                        Monto: presupuesto.Monto,
                        Color: concepto.Color,
                    })
                    return presupuesto;
                }
            }
            ).map((presupuesto) => {
                return presupuesto;
            })
            return Monto[0] ? Monto[0].Monto : 0;
        });
        const backgroundColorActual=conceptosGeneralesDeflactado.map((conceptosGeneralesDeflactado) => {
            return conceptosGeneralesDeflactado.Color;
        });
        setRenglonesTablaActual(tablaActual);
        setConfigChartActual({
            labels: labelsActual,
            datasets: [{
                label: 'Conceptos Generales',
                data: dataChartActual,
                backgroundColor: backgroundColorActual,
            }],
        });
        if(chartRefActual.current && showGraphPresupuesto === 'actual'){
            chartRefActual.current.update();
        }

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
            datasets: conceptosGeneralesDeflactado.map((concepto) => {
                return {
                    label: concepto.conceptoGeneral.Clave+' - '+concepto.conceptoGeneral.Nombre,
                    data: versiones.filter((version) => version.Actual).map((version) => {
                        let monto=0;
                        concepto.presupuestos.map((presupuesto) => {
                            if(presupuesto.Id==version.Id){
                                monto=presupuesto.Monto;
                            }
                        })
                        return monto;
                    }),
                    backgroundColor: concepto.Color,
                    color: concepto.Color,
                    borderColor: concepto.Color,
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
        const renglonesDiferencias = conceptosGeneralesDeflactado.map((concepto) => {
            const dataDiferencias=[];
            for(let i=1; i<versionesDiferencias.length; i++){
                let monto=0;
                let montoAnterior=0;
                concepto.presupuestos.map((presupuesto) => {
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
                conceptoGeneral: concepto.conceptoGeneral,
                Color: concepto.Color,
                Diferencias: dataDiferencias,
            }
        }).sort().filter(n => n);
        
        const dataChartDiferencias={
            labels: labelDiferencias,
            datasets: renglonesDiferencias.map((renglon) => {
                return {
                    label: renglon.conceptoGeneral.Clave+' - '+renglon.conceptoGeneral.Nombre,
                    data: renglon.Diferencias.map((diferencia) => {
                        if(diferencia){
                            return diferencia*100;
                        }else{
                            return null;
                        }
                    }
                    ),
                    backgroundColor: renglon.Color,
                    color: renglon.Color,
                    borderColor: renglon.Color,
                    fill: true
                }
            })
        };
        setConfigChartDiferencias(dataChartDiferencias);
        if(chartRefDiferencias.current && showGraphPresupuesto === 'diferencia'){
            chartRefDiferencias.current.update();
        }
        setRenglonesTablaDiferencias(renglonesDiferencias);

    },[conceptosGeneralesDeflactado, showGraphPresupuesto]);


    return(<>
    <div className='row mt-4'>
        <div className='col-12'>
            <h3>Conceptos Generales<small> de gasto</small></h3>
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
                            <th scope='col'>Concepto General</th>
                            <th scope='col'>Monto {selectedYear}</th>
                            <th scope='col'>Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        { renglonesTablaActual.map((renglon) => {
                            return (
                            <tr key={renglon.concepto.Id}>
                                <td className='text-nowrap'><span className='leyenda' style={{backgroundColor: renglon.Color}}></span> {renglon.concepto.Clave}</td>
                                <td>{renglon.concepto.Nombre} <Link to={'./../../ConceptosGenerales/'+renglon.concepto.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link></td>
                                <td className='font-monospace text-end'>{renglon.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                                <td className='font-monospace text-end'>{ (renglon.Monto/renglonesTablaActual.reduce((total, concepto) =>  total + concepto.Monto, 0)).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2}) }</td>
                            </tr>
                            )}
                        ) }
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan='2' className='text-end'>Total</td>
                            <td className='font-monospace text-end'>{  renglonesTablaActual.reduce((total, concepto) =>  total + concepto.Monto, 0).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) }</td>
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
                        {conceptosGeneralesDeflactado.map((renglon) => {
                            return (
                                <tr key={renglon.Id}>
                                    <td>
                                        <span className='leyenda' style={{backgroundColor: renglon.Color}}></span>
                                        {renglon.conceptoGeneral.Clave} - {renglon.conceptoGeneral.Nombre} <Link to={'./../../ConceptosGenerales/'+renglon.conceptoGeneral.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link>
                                    </td>
                                    { versiones.filter((version) => version.Actual).map((version) => {
                                        let presupuestoVersion = null;
                                        renglon.presupuestos.filter((presupuesto) => {
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
                                <tr key={renglon.conceptoGeneral.Id}>
                                    <td>
                                        <span className='leyenda' style={{backgroundColor: renglon.Color}}></span>
                                        {renglon.conceptoGeneral.Clave} - {renglon.conceptoGeneral.Nombre} <Link to={'./../../ConceptosGenerales/'+renglon.conceptoGeneral.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link>
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
    </>)
}

export default ConceptosGeneralesCG