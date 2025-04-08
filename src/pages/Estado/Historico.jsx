import { useState, useEffect, useRef, use } from 'react'
import { useSelector } from 'react-redux'
import { Chart } from 'react-chartjs-2';
import './Historico.css';

const Historico = ({estadoActual}) => {
    const api_url=useSelector(state => state.parameters.api_url);
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)
    const [historico,setHistorico] = useState([]);
    const [rowsTabla,setRowsTabla] = useState([]);
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

    useEffect(() => {
        if(api_url && estadoActual.Codigo){
            let url=api_url+'/'+estadoActual.Codigo+'/Historico';
            fetch(url)
            .then(response => response.json())
            .then(data => {  
                setHistorico(data);
            })
            .catch(error => {
                console.error(error);
            });
        }

    },[api_url,estadoActual]);

    useEffect(() => {
        if(historico.length>0){
            let labels = [];
            let data = [];
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
                }
                return(<><tr>
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
            if(chartRef.current){
                chartRef.current.update();
            }   
        }
    },[historico,selectedYear]);
    return(<>
    <div className='row mb-4'>
        <div className='col-12 mb-2'>
            <h3>Histórico</h3>
        </div>
        <div className='col-12 col-md-6 mb-4'>
            <Chart
                ref={chartRef}
                type='line' 
                data={configChart}  
                options={optionsChart}
                id='chartHistorico'
                width='100%'
                height={'70vw'}
            />
        </div>
        <div className='col-12 col-md-6 mb-4'>
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
export default Historico