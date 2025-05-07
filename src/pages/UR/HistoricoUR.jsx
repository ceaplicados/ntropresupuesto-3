import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Chart } from 'react-chartjs-2';

const HistoricoUR = ({presupuestoHistorico}) => {
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)
    const [rowsTabla,setRowsTabla] = useState([]);
    const [showGraphPresupuesto, setShowGraphPresupuesto] = useState('historico');
    const chartRef = useRef(null);
    const chartRefDiferencias = useRef(null);
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
                        let label = ' ';
                        if (context.parsed.y !== null) {
                            label += ': '+ (context.parsed.y).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2});
                        }
                        return label;
                    }
                }
            }
        },
    };
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

    useEffect(() => {
        const historico=presupuestoHistorico;
        if(historico.length>0){
            let labels = [];
            let data = [];
            let dataDiferencias = [];
            let dataChartBorderColor=[];
            let dataChartBackgroundColor=[];
            let rows=[];
            historico.map((version) => {
                labels.push(version.Anio);
                data.push(version.Monto*inpc[selectedYear]/inpc[version.Anio]);
            });
            rows=historico.map((version,index) => {
                let diferencia=null;
                let monto=version.Monto*inpc[selectedYear]/inpc[version.Anio]
                if(index>0){
                    let montoAnterior=historico[index-1].Monto*inpc[selectedYear]/inpc[historico[index-1].Anio];
                    diferencia= (monto-montoAnterior)/montoAnterior;
                    dataDiferencias.push(diferencia*100);
                    if(diferencia>0){
                        dataChartBorderColor.push('rgb(140, 180, 193)');
                        dataChartBackgroundColor.push('rgba(140, 180, 193, 0.5)');
                    }else{
                        dataChartBorderColor.push('rgb(217, 91, 91)');
                        dataChartBackgroundColor.push('rgba(217, 91, 91, 0.5)');
                    }
                }
                return(<><tr key={'tr_'+version.Anio}>
                    <td>{version.Anio} <small>{version.Tipo}</small></td>
                    <td className='font-monospace text-end'>
                    {monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}
                    </td>
                    <td className={ diferencia<0 ? 'font-monospace text-end text-danger' : 'font-monospace text-end'}>{ diferencia ? diferencia.toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 2}) : '-' }</td>
                    </tr></>)
            })
            setRowsTabla(rows);
            setConfigChart({
                labels: labels,
                datasets: [{
                    label: 'Monto',
                    data: data,
                    fill: true,
                    tension: 0.3
                }]
            });
            if(chartRef.current && showGraphPresupuesto === 'historico'){
                chartRef.current.update();
            }   
            let labelsDiferencias = [...labels]
            labelsDiferencias.shift();
            setConfigChartDiferencias({
                labels: labelsDiferencias,
                datasets: [{...configChartDiferencias.datasets[0], 
                    data: dataDiferencias,
                    borderColor: dataChartBorderColor,
                    backgroundColor: dataChartBackgroundColor}],
            });
            if(chartRefDiferencias.current && showGraphPresupuesto === 'diferencia'){
                chartRefDiferencias.current.update();
            }
        }
    },[presupuestoHistorico,selectedYear,showGraphPresupuesto]);
    
    return(<>
    <div className='row mb-4'>
        <div className='col-12 mb-2'>
            <h3>Histórico</h3>
        </div>
        <div className='col-12 col-md-6 mb-4'>
            { showGraphPresupuesto === 'historico' ? (<>
            <Chart
                ref={chartRef}
                type='line' 
                data={configChart}  
                options={optionsChart}
                id='chartHistorico'
                width='100%'
                height={'80vw'}
            />
            </>) : (<>
            <Chart
                ref={chartRefDiferencias}
                type='bar' 
                data={configChartDiferencias}  
                options={optionsChartDiferencias}
                id='chartDiferencias'
                width='100%'
                height={'80vw'}
            />
            </>) }
        </div>
        <div className='col-12 col-md-6 mb-4'>
        <div className='text-end opcionesGraph mb-2'>
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
            </div>
            <table className='table table-bordered table-responsive' id='tablaHistorico'>
                <thead>
                    <tr>
                        <th>Ejercicio</th>
                        <th>Monto</th>
                        <th>Diferencia</th>
                    </tr>
                </thead>
                <tbody>
                    {rowsTabla}
                </tbody>
            </table>
        </div>
    </div>
    </>);
}
export default HistoricoUR;