import { useState, useEffect, useRef } from 'react'
import {Chart as ChartJS,
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    BarElement,
    Legend,
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
    Tooltip,
    Filler,
  );

function GastoFederalizado({selectedYear,inpc}) {
    const [showTablePresupuesto, setShowTablePresupuesto] = useState(false);
    const [dataPresupuesto, setDataPresupuesto] = useState({});
    const [showGraphPresupuesto, setShowGraphPresupuesto] = useState('historico');
    const [configChartPresupuesto, setConfigChartPresupuesto] = useState({
        labels: [],
        datasets: [{
            label: 'Presupuesto federal',
            data: [],
            borderColor: 'rgb(140, 180, 193)',
            backgroundColor: 'rgba(140, 180, 193, 0.5)',
            fill: true,
            tension: 0.3,
          },],
    });
    const [configDiferenciaPresupuesto, setConfigDiferenciaPresupuesto] = useState({
        labels: [],
        datasets: [{
            label: 'Presupuesto federal',
            data: [],
            borderColor: 'rgb(140, 180, 193)',
            backgroundColor: 'rgba(140, 180, 193, 0.5)',
            fill: true
          },],
    });
    const optionsPresupuesto = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            }
        },
    };
    const optionsPresupuestoDiferencia = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
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

    const chartRefPresupuesto = useRef(null);
    const chartRefPresupuestoDiferencia = useRef(null);

    // Obtener los datos del API
    useEffect(() => {
        fetch('https://api.nuestropresupuesto.mx/Federal/Presupuesto')
          .then(response => response.json())
          .then(data => {
            setDataPresupuesto(data);
        })
        .catch(error => {
            console.error(error);
        });
    }, []);
    
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

        let dataChart=[];
        if(inpc[selectedYear]){
            for(let i=0;i<labelsGraph.length;i++){
                dataChart.push(valuesGraph[i]*inpc[selectedYear]/inpc[labelsGraph[i]]);
            }
        }

        const chartHistorico = chartRefPresupuesto.current;
        if (chartHistorico) {
            chartHistorico.data.labels=labelsGraph;
            
            chartHistorico.data.datasets[0].data=dataChart;
            setConfigChartPresupuesto({
                labels: labelsGraph,
                datasets: [{...configChartPresupuesto.datasets[0], data: dataChart}],
            });
            chartHistorico.update();
        }
        const chartDiferencia = chartRefPresupuestoDiferencia.current;
        if(chartDiferencia){
            labelsGraph.shift()
            chartDiferencia.data.labels=labelsGraph;
            
            let dataChartDiferencia=[];
            let dataChartBorderColor=[];
            let dataChartBackgroundColor=[];
            for(let i=1;i<dataChart.length;i++){
                dataChartDiferencia.push((dataChart[i]-dataChart[i-1])/dataChart[i-1]*100);
                if(dataChart[i]-dataChart[i-1]>0){
                    dataChartBorderColor.push('rgb(140, 180, 193)');
                    dataChartBackgroundColor.push('rgba(140, 180, 193, 0.5)');
                }else{
                    dataChartBorderColor.push('rgb(217, 91, 91)');
                    dataChartBackgroundColor.push('rgba(217, 91, 91, 0.5)');
                }
            }
            console.log(dataChartDiferencia);
            setConfigDiferenciaPresupuesto({
                labels: labelsGraph,
                datasets: [{...configDiferenciaPresupuesto.datasets[0], 
                    data: dataChartDiferencia,
                    borderColor: dataChartBorderColor,
                    backgroundColor: dataChartBackgroundColor}],
            });
            chartDiferencia.data.datasets[0].data=dataChartDiferencia;
            chartDiferencia.data.datasets[0].data=dataChartDiferencia;
            chartDiferencia.update();
        }
    }
    , [selectedYear,inpc,dataPresupuesto,showGraphPresupuesto]);
    
    const tablaPresupuesto = () => {
        let tabla = [];
        for(let i=0;i<configChartPresupuesto.labels.length;i++){
            let monto=configChartPresupuesto.datasets[0].data[i]*inpc[selectedYear]/inpc[configChartPresupuesto.labels[i]];
            let montoAnterior = i==0 ? 0 : configChartPresupuesto.datasets[0].data[i-1]*inpc[selectedYear]/inpc[configChartPresupuesto.labels[i-1]];
            tabla.push(
                <tr key={configChartPresupuesto.labels[i]}>
                    <td>{configChartPresupuesto.labels[i]}</td>
                    <td className='text-end'>{monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                    <td className='text-end'>{ i==0 ? '-' :  ((monto-montoAnterior)/montoAnterior).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2}) }</td>
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
        <div className='row'>
            <div className='col-12'>
                <h3 className='text-center'>Presupuesto federal</h3>
            </div>
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
            </div>
            <div className='col-md-12 col-lg-6'>
                <div className='opcionesGraph text-end mb-4'>
                    <button 
                        className={ showGraphPresupuesto=='historico' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }
                        title='Presupuesto histórico'
                        onClick={()=>setShowGraphPresupuesto('historico')}
                        >
                        <span className="material-symbols-outlined">show_chart</span>
                    </button>
                    <button 
                        className={ showGraphPresupuesto=='diferencia' ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary ' }  
                        title='Presupuesto histórico'
                        onClick={()=>setShowGraphPresupuesto('diferencia')}
                        >
                        <span className="material-symbols-outlined">waterfall_chart</span>
                    </button>
                    <span className='verticalDivider'></span>
                    <button className={ showTablePresupuesto ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary' } title='Mostrar tabla' onClick={toggleTablePresupuesto}>
                        <span className="material-symbols-outlined">table_chart</span>
                    </button>
                </div>
                { !showTablePresupuesto ? 
                <div className='texto'>
                    <p>Muestra el presupuesto total que se establece en la Ley de Egresos de cada año.  En ella cada poder y organismo autónomo establece en qué y para qué se va a gastar el monto solicitado, y cada año es aprobada por la Cámara de Diputados.</p>
                    <p>De aquí se pagan todos los gastos de todas las instituciones a nivel federal, así como los programas sociales, inversiones y deuda federales.  Una parte de este monto se pasa a los estados y municipios, quienes deben de tener sus propios ingresos como complemento a lo que les da la federación.</p>
                </div>
                : null }
                { showTablePresupuesto ? 
                <table className='table table-striped table-bordered'>
                    <thead>
                        <tr>
                            <th>Año</th>
                            <th>Monto <small>(mmdp del {selectedYear})</small></th>
                            <th>Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
                    {tablaPresupuesto()}
                    </tbody>
                </table>
                : null }
            </div>
        </div>
        </>
    );
}

export default GastoFederalizado