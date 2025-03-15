import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {Chart as ChartJS,
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    BarElement,
    Legend,
    Title,
    Tooltip,
    Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import './GastoFederalizado.css'

ChartJS.register(
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    BarElement,
    Legend,
    Title,
    Tooltip,
    Filler,
  );

function GastoFederalizado({selectedYear,inpc}) {
    const api_url=useSelector(state => state.parameters.api_url)
    const [showTablePresupuesto, setShowTablePresupuesto] = useState(false);
    const [dataPresupuesto, setDataPresupuesto] = useState({});
    const [showGraphPresupuesto, setShowGraphPresupuesto] = useState('historico');
    const [configChartPresupuesto, setConfigChartPresupuesto] = useState({
        labels: [],
        datasets: [{
            label: 'Gasto federalizado',
            data: [],
            borderColor: 'rgb(140, 180, 193)',
            backgroundColor: 'rgba(140, 180, 193, 1)',
            fill: false,
            tension: 0.3,
          },],
    });
    const [configDiferenciaPresupuesto, setConfigDiferenciaPresupuesto] = useState({
        labels: [],
        datasets: [{
            label: 'Diferencia gasto federalizado',
            data: [],
            borderColor: 'rgb(140, 180, 193)',
            backgroundColor: 'rgba(140, 180, 193, 1)',
            fill: true
          },],
    });
    const [configPorcentajePresupuesto, setConfigPorcentajePresupuesto] = useState({
        labels: [],
        datasets: [{
            label: 'Porcentaje por tipo de gasto',
            data: [],
            borderColor: 'rgb(140, 180, 193)',
            backgroundColor: 'rgba(140, 180, 193, 1)',
            fill: true
          },],
    });
    const optionsPresupuesto = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: 'Histórico por tipo de gasto federalizado',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = ' '+context.dataset.label || ' ';
                        if (context.parsed.y !== null) {
                            label += ': '+ (context.parsed.y).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) + ' mmdp';
                        }
                        return label;
                    }
                }
            }
        },
    };
    const optionsPresupuestoDiferencia = {
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
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += (context.parsed.y).toFixed(2) + '%';
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
    const optionsPorcentajePresupuesto = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: 'Total por tipo de gasto',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = ' '+context.dataset.label || ' ';
                        if (context.parsed.y !== null) {
                            label += ': '+ (context.parsed.y).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) + ' mmdp';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                ticks: {
                    callback: function(value, index, ticks) {
                        return value + '%';
                    }
                }
            }
        }
    };

    const chartRefPresupuesto = useRef(null);
    const chartRefPresupuestoDiferencia = useRef(null);
    const chartRefPorcentajePresupuesto = useRef(null);

    // Obtener los datos del API
    useEffect(() => {
        if(api_url){
            fetch(api_url+'/Federal/GastoFederalizado')
            .then(response => response.json())
            .then(data => {
                setDataPresupuesto(data);
            })
            .catch(error => {
                console.error(error);
            });
        }
    }, [api_url]);
    
    // actualizar el gráfico cuando cambien los datos, el año seleccionado o el INPC
    useEffect(() => {
        let labelsGraph = [];
        let valuesGraph = [];

        labelsGraph=Object.keys(dataPresupuesto).map(year => (
            year
        ));
        valuesGraph=Object.values(dataPresupuesto).map(monto => (
            monto
        ));

        let dataChartParticipaciones=[];
        let dataChartAportaciones=[];
        let dataChartConvenios=[];
        let dataChartSubsidios=[];

        if(inpc[selectedYear]){
            for(let i=0;i<labelsGraph.length;i++){
                dataChartParticipaciones.push(valuesGraph[i].Participaciones*inpc[selectedYear]/inpc[labelsGraph[i]]);
                dataChartAportaciones.push(valuesGraph[i].Aportaciones*inpc[selectedYear]/inpc[labelsGraph[i]]);
                dataChartConvenios.push(valuesGraph[i].Convenios*inpc[selectedYear]/inpc[labelsGraph[i]]);
                dataChartSubsidios.push(valuesGraph[i].Subsidios*inpc[selectedYear]/inpc[labelsGraph[i]]);
            }
        }
        const chartHistorico = chartRefPresupuesto.current;
        if (chartHistorico) {
            setConfigChartPresupuesto({
                labels: labelsGraph,
                datasets: [
                    {...configChartPresupuesto.datasets[0], 
                        label: 'Participaciones',
                        data: dataChartParticipaciones
                    },
                    {...configChartPresupuesto.datasets[0], 
                        label: 'Aportaciones',
                        data: dataChartAportaciones,
                        borderColor: 'rgb(149, 171, 130)',
                        backgroundColor: 'rgba(149, 171, 130, 1)',
                    },
                    {...configChartPresupuesto.datasets[0], 
                        label: 'Convenios',
                        data: dataChartConvenios,
                        borderColor: 'rgb(189, 144, 91)',
                        backgroundColor: 'rgba(189, 144, 91, 1)',
                    },
                    {...configChartPresupuesto.datasets[0], 
                        label: 'Subsidios',
                        data: dataChartSubsidios,
                        borderColor: 'rgb(217, 91, 91)',
                        backgroundColor: 'rgba(217, 91, 91, 1)',
                    },
                ],
            });
            chartHistorico.update();
        }
        const chartPorcentaje = chartRefPorcentajePresupuesto.current;
        if(chartPorcentaje){
            let dataChartPorcentajeParticipaciones=[];
            for(let i=0;i<dataChartParticipaciones.length;i++){
                dataChartPorcentajeParticipaciones.push(dataChartParticipaciones[i] ? dataChartParticipaciones[i] : 0);
            }
            let dataChartPorcentajeAportaciones=[];
            for(let i=0;i<dataChartParticipaciones.length;i++){
                dataChartPorcentajeAportaciones.push(dataChartAportaciones[i] ? dataChartAportaciones[i] : 0);
            }
            let dataChartPorcentajeConvenios=[];
            for(let i=0;i<dataChartConvenios.length;i++){
                dataChartPorcentajeConvenios.push(dataChartConvenios[i] ? dataChartConvenios[i] : 0);
            }
            let dataChartPorcentajeSubsidios=[];
            for(let i=0;i<dataChartSubsidios.length;i++){
                dataChartPorcentajeSubsidios.push(dataChartSubsidios[i] ? dataChartSubsidios[i] : 0);
            }
            setConfigPorcentajePresupuesto({
                labels: labelsGraph,
                datasets: [
                    {...configPorcentajePresupuesto.datasets[0], 
                        label: 'Participaciones',
                        data: dataChartPorcentajeParticipaciones,
                    },
                    {...configPorcentajePresupuesto.datasets[0], 
                        label: 'Aportaciones',
                        data: dataChartPorcentajeAportaciones,
                        borderColor: 'rgb(149, 171, 130)',
                        backgroundColor: 'rgba(149, 171, 130, 1)',
                    },
                    {...configPorcentajePresupuesto.datasets[0], 
                        label: 'Convenios',
                        data: dataChartPorcentajeConvenios,
                        borderColor: 'rgb(189, 144, 91)',
                        backgroundColor: 'rgb(189, 144, 91)',
                    },
                    {...configPorcentajePresupuesto.datasets[0], 
                        label: 'Subsidios',
                        data: dataChartPorcentajeSubsidios,
                        borderColor: 'rgb(217, 91, 91)',
                        backgroundColor: 'rgb(217, 91, 91)',
                    },
                ],
            });
            chartPorcentaje.update();
        }
        const chartDiferencia = chartRefPresupuestoDiferencia.current;
        if(chartDiferencia){
            labelsGraph.shift()
            let dataChartDiferenciaParticipaciones=[];
            for(let i=1;i<dataChartParticipaciones.length;i++){
                dataChartDiferenciaParticipaciones.push(dataChartParticipaciones[i] && dataChartParticipaciones[i-1] ? (dataChartParticipaciones[i]-dataChartParticipaciones[i-1])/dataChartParticipaciones[i-1]*100 : null);
            }
            let dataChartDiferenciaAportaciones=[];
            for(let i=1;i<dataChartParticipaciones.length;i++){
                dataChartDiferenciaAportaciones.push(dataChartAportaciones[i] && dataChartAportaciones[i-1] ? (dataChartAportaciones[i]-dataChartAportaciones[i-1])/dataChartAportaciones[i-1]*100 : null);
            }
            let dataChartDiferenciaConvenios=[];
            for(let i=1;i<dataChartConvenios.length;i++){
                dataChartDiferenciaConvenios.push(dataChartConvenios[i] && dataChartConvenios[i-1] ? (dataChartConvenios[i]-dataChartConvenios[i-1])/dataChartConvenios[i-1]*100 : null);
            }
            let dataChartDiferenciaSubsidios=[];
            for(let i=1;i<dataChartSubsidios.length;i++){
                dataChartDiferenciaSubsidios.push(dataChartSubsidios[i] && dataChartSubsidios[i-1] ? (dataChartSubsidios[i]-dataChartSubsidios[i-1])/dataChartSubsidios[i-1]*100 : null);
            }
            setConfigDiferenciaPresupuesto({
                labels: labelsGraph,
                datasets: [
                    {...configDiferenciaPresupuesto.datasets[0], 
                        label: 'Participaciones',
                        data: dataChartDiferenciaParticipaciones,
                    },
                    {...configDiferenciaPresupuesto.datasets[0], 
                        label: 'Aportaciones',
                        data: dataChartDiferenciaAportaciones,
                        borderColor: 'rgb(149, 171, 130)',
                        backgroundColor: 'rgba(149, 171, 130, 1)',
                    },
                    {...configDiferenciaPresupuesto.datasets[0], 
                        label: 'Convenios',
                        data: dataChartDiferenciaConvenios,
                        borderColor: 'rgb(189, 144, 91)',
                        backgroundColor: 'rgb(189, 144, 91)',
                    },
                    {...configDiferenciaPresupuesto.datasets[0], 
                        label: 'Subsidios',
                        data: dataChartDiferenciaSubsidios,
                        borderColor: 'rgb(217, 91, 91)',
                        backgroundColor: 'rgb(217, 91, 91)',
                    },
                ],
            });
            chartDiferencia.update();
        }
    }
    , [selectedYear,inpc,dataPresupuesto,showGraphPresupuesto]);
    
    const tablaPresupuesto = () => {
        let tabla = [];
        for(let i=0;i<configChartPresupuesto.labels.length;i++){
            let colsMontos = [];
            let colsMontosAnteriores = [];
            let colsDiferencias = [];
            // Participaciones
            let monto= configChartPresupuesto.datasets[0].data[i] ? configChartPresupuesto.datasets[0].data[i] : null;
            let montoAnterior = i==0 ? null : configChartPresupuesto.datasets[0].data[i-1];
            colsMontos.push(monto);
            colsMontosAnteriores.push(montoAnterior);
            colsDiferencias.push(montoAnterior && monto ?  ((monto-montoAnterior)/montoAnterior) : null);

            // Aportaciones
            monto=configChartPresupuesto.datasets[1].data[i] ? configChartPresupuesto.datasets[1].data[i] : null;
            montoAnterior = i==0 ? null : configChartPresupuesto.datasets[1].data[i-1];
            colsMontos.push(monto);
            colsMontosAnteriores.push(montoAnterior);
            colsDiferencias.push(montoAnterior && monto ?  ((monto-montoAnterior)/montoAnterior) : null);

            // Convenios
            monto=configChartPresupuesto.datasets[2].data[i] ? configChartPresupuesto.datasets[2].data[i] : null;
            montoAnterior = i==0 ? null : configChartPresupuesto.datasets[2].data[i-1];
            colsMontos.push(monto);
            colsMontosAnteriores.push(montoAnterior);
            colsDiferencias.push(montoAnterior && monto ?  ((monto-montoAnterior)/montoAnterior) : null);

            // Subsidios
            monto=configChartPresupuesto.datasets[3].data[i] ? configChartPresupuesto.datasets[3].data[i] : null;
            montoAnterior = i==0 ? null : configChartPresupuesto.datasets[3].data[i-1];
            colsMontos.push(monto);
            colsMontosAnteriores.push(montoAnterior);
            colsDiferencias.push(montoAnterior && monto ?  ((monto-montoAnterior)/montoAnterior) : null);
            
            tabla.push(
                <tr key={configChartPresupuesto.labels[i]}>
                    <td key={'yearLabel'+configChartPresupuesto.labels[i]}>{configChartPresupuesto.labels[i]}</td>
                    {
                        colsMontos.map((monto,index) => (
                            <td key={'Monto'+configChartPresupuesto.labels[i]+'_'+index} className='text-end'>{ monto ? monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) : '-'}</td>
                        ))
                    }
                    <td key={'Total'+configChartPresupuesto.labels[i]} className='text-end Total'>{ 
                        colsMontos.reduce((a,b)=>a+b,0).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) 
                    }</td>
                    {
                        colsDiferencias.map((diferencia,index) => (
                            <td key={'Diferencia'+configChartPresupuesto.labels[i]+'_'+index} className={ diferencia && diferencia>0 ? 'text-end': 'text-end text-danger' }>{ diferencia ? diferencia.toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2}) : '-' }</td>
                        ))
                    }
                    <td key={'TotalDiferencia'+configChartPresupuesto.labels[i]} className={ colsMontos.reduce((a,b)=>a+b,0) > colsMontosAnteriores.reduce((a,b)=>a+b,0) ? 'text-end Total' : 'text-end Total text-danger'}>{ 
                        colsMontos.reduce((a,b)=>a+b,0) && colsMontosAnteriores.reduce((a,b)=>a+b,0) ? ((colsMontos.reduce((a,b)=>a+b,0) - colsMontosAnteriores.reduce((a,b)=>a+b,0))/colsMontosAnteriores.reduce((a,b)=>a+b,0)).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2}) : '-' 
                    }</td>
                </tr>
            );
        }
        return tabla;
    };

    const toggleTablePresupuesto = () => {
        setShowTablePresupuesto(!showTablePresupuesto);
    }
    return (
        <>
        <div className='row mb-2'>
            <div className='col'>
                <h3 className='text-center'>Gasto federalizado</h3>
            </div>
            <div className='opcionesGraph col text-end'>
                    <button 
                        className={ showGraphPresupuesto=='historico' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }
                        title='Presupuesto histórico'
                        onClick={()=>setShowGraphPresupuesto('historico')}
                        >
                        <span className="material-symbols-outlined">show_chart</span>
                    </button>
                    <button 
                        className={ showGraphPresupuesto=='diferencia' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }  
                        title='Diferencia anual'
                        onClick={()=>setShowGraphPresupuesto('diferencia')}
                        >
                        <span className="material-symbols-outlined">waterfall_chart</span>
                    </button>
                    <button 
                        className={ showGraphPresupuesto=='porcentaje' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }  
                        title='Total por tipo de gasto'
                        onClick={()=>setShowGraphPresupuesto('porcentaje')}
                        >
                        <span className="material-symbols-outlined">stacked_bar_chart</span>
                    </button>

                    <span className='verticalDivider'></span>
                    <button className={ showTablePresupuesto ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary' } title='Mostrar tabla' onClick={toggleTablePresupuesto}>
                        <span className="material-symbols-outlined">table_chart</span>
                    </button>
            </div>
        </div>
        <div className='row mb-4'>
            <div className='col-md-12 col-lg-6'>
                { showGraphPresupuesto=='historico' ? 
                <Chart 
                    ref={chartRefPresupuesto}
                    type='line' 
                    data={configChartPresupuesto}  
                    options={optionsPresupuesto}
                    width='100%'
                    height='50vw'
                />
                : null }
                { showGraphPresupuesto=='diferencia' ? 
                <Chart 
                    ref={chartRefPresupuestoDiferencia}
                    type='bar' 
                    data={configDiferenciaPresupuesto}  
                    options={optionsPresupuestoDiferencia}
                    width='100%'
                    height='50vw'
                />
                : null }
                { showGraphPresupuesto=='porcentaje' ? 
                <Chart 
                    ref={chartRefPorcentajePresupuesto}
                    type='bar' 
                    data={configPorcentajePresupuesto}  
                    options={optionsPorcentajePresupuesto}
                    width='100%'
                    height='50vw'
                />
                : null }
            </div>
            <div className='col-md-12 col-lg-6'>
                <div className='texto'>
                    <p>Son las distintas formas en las que la federación envía recursos a los estados y municipios.</p>
                    <p>Las <b>Participaciones</b> son recursos transferidos a las entidades y que pueden ejercerse de manera libre.</p>
                    <p>Las <b>Aportaciones</b> son recursos que se transfieren para un fin definido y que no pueden ser utilizados para un fin distinto al etiquetado.</p>
                    <p>Los <b>Convenios</b> es gasto federal que se acuerda con los estados, como puede ser el desarrollo de infraestructura.</p>
                    <p>Los <b>Subsidios</b> son recursos que se transfieren a los estados para apoyar a la federación con responsabilidades que le tocan, pero que no tiene el despliegue territorial para ejecutarlas.</p>
                    <p>Los montos a transferir a cada entidad son el resultado de reglas y fórmulas establecidas en la Ley de Coordinación Fiscal.</p>
                </div>
            </div>
            <div className='col-12 mt-3'>
                <div className='tableContainer'>
                { showTablePresupuesto ? 
                    <table className='table table-striped table-bordered'>
                        <thead>
                            <tr>
                                <th rowSpan='2'>Año</th>
                                <th colSpan='5'>Monto <small>(mmdp del {selectedYear})</small></th>
                                <th colSpan='5'>Diferencia</th>
                            </tr>
                            <tr>
                                <th>Participaciones</th>
                                <th>Aportaciones</th>
                                <th>Convenios</th>
                                <th>Subsidios</th>
                                <th className='Total'>Total</th>
                                <th>Participaciones</th>
                                <th>Aportaciones</th>
                                <th>Convenios</th>
                                <th>Subsidios</th>
                                <th className='Total'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                        {tablaPresupuesto()}
                        </tbody>
                    </table>
                    : null }
                </div>
            </div>
        </div>
        </>
    );
}

export default GastoFederalizado