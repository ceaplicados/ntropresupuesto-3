import { useState, useEffect, useRef } from 'react'
import { Chart } from 'react-chartjs-2';
import axios from '../../api/axios'
import './PresupuestoFederal.css'


function PresupuestoFederal({selectedYear,inpc}) {
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
            label: 'Diferencia presupuesto federal',
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
            },
            title: {
                display: true,
                text: 'Histórico de presupuesto federal',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = ' ';
                        if (context.parsed.y !== null) {
                            label += (context.parsed.y).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) + ' mmdp';
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
                display: false,
            },
            title: {
                display: true,
                text: 'Diferencia anual',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = ' ';
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
        const getPresupuestoFederal = async () => {
            const response = await axios('/Federal/Presupuesto');
            const data=response?.data;
            setDataPresupuesto(data);
        }
        getPresupuestoFederal();        
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
            setConfigChartPresupuesto({
                labels: labelsGraph,
                datasets: [{...configChartPresupuesto.datasets[0], data: dataChart}],
            });
            chartHistorico.update();
        }
        const chartDiferencia = chartRefPresupuestoDiferencia.current;
        if(chartDiferencia){
            labelsGraph.shift()
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
            
            setConfigDiferenciaPresupuesto({
                labels: labelsGraph,
                datasets: [{...configDiferenciaPresupuesto.datasets[0], 
                    data: dataChartDiferencia,
                    borderColor: dataChartBorderColor,
                    backgroundColor: dataChartBackgroundColor}],
            });
            chartDiferencia.update();
        }
    }
    , [selectedYear,inpc,dataPresupuesto,showGraphPresupuesto]);
    
    const tablaPresupuesto = () => {
        let tabla = [];
        let rowMontos = [];
        let rowDiferencias = [];
        for(let i=0;i<configChartPresupuesto.labels.length;i++){
            let monto=configChartPresupuesto.datasets[0].data[i];
            let montoAnterior = i==0 ? 0 : configChartPresupuesto.datasets[0].data[i-1];
            rowMontos.push(monto);
            rowDiferencias.push(i==0 ? '-' :  ((monto-montoAnterior)/montoAnterior));
        }
        tabla.push(
            <tr key='rowPresupuesto'>
                <td key='labelMonto'>Monto <small>mmdp del {selectedYear}</small></td>
                {rowMontos.map((monto,i) => (
                    <td key={'Monto_'+i} className='text-end'>{monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                ))}
            </tr>
        );
        tabla.push(
            <tr key='rowDiferencias'>
                <td key='labelDiferencia'>Diferencia</td>
                {rowDiferencias.map((monto,i) => (
                    <td key={'Diferencia_'+i} className={ monto>0 ? 'text-end': 'text-end text-danger' }>{monto.toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2})}</td>
                ))}
            </tr>
        );
        return tabla;
    };

    const toggleTablePresupuesto = () => {
        setShowTablePresupuesto(!showTablePresupuesto);
    }
    return (
        <>
        <div className='row mb-2'>
            <div className='col'>
                <h3 className='text-center'>Presupuesto federal</h3>
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
            </div>
            <div className='col-md-12 col-lg-6'>
                <div className='texto'>
                    <p>Muestra el presupuesto total que se establece en la Ley de Egresos de cada año.  En ella cada poder y organismo autónomo establece en qué y para qué se va a gastar el monto solicitado, y cada año es aprobada por la Cámara de Diputados.</p>
                    <p>De aquí se pagan todos los gastos de todas las instituciones a nivel federal, así como los programas sociales, inversiones y deuda federales.  Una parte de este monto se pasa a los estados y municipios, quienes deben de tener sus propios ingresos como complemento a lo que les da la federación.</p>
                </div>
            </div>
            <div className='col-12 mt-3'>
                { showTablePresupuesto ? 
                <table className='table table-striped table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th key='labelYear'>Año</th>
                            {configChartPresupuesto.labels.map(year => (
                                <th key={year}>{year}</th>
                            ))}
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

export default PresupuestoFederal