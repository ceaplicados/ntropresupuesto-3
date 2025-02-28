import { useState, useEffect, useRef } from 'react'
import {Chart as ChartJS,
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip,} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import './GastoFederalizado.css'

ChartJS.register(
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip
  );

function GastoFederalizado({selectedYear,inpc}) {
    const [dataPresupuesto, setDataPresupuesto] = useState({
        labels: [],
        datasets: [{
            label: 'Presupuesto federal',
            data: [],
            borderColor: 'rgb(140, 180, 193)',
            backgroundColor: 'rgba(140, 180, 193, 0.5)',
          },],
    });

    const optionsPresupuesto = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Presupuesto federal',
            },
        },
    };

    const chartRefPresupuesto = useRef(null);

    // Obtener los datos del API
    useEffect(() => {
        fetch('https://api.nuestropresupuesto.mx/Federal/GastoFederalizado')
          .then(response => response.json())
          .then(data => {
            let labelsGraph = [];
            let valuesGraph = [];
            labelsGraph=Object.keys(data).map(year => (
                year
            ));
            valuesGraph=Object.values(data).map(monto => (
                monto
            ));
            setDataPresupuesto({
                labels: labelsGraph,
                datasets: [{
                    label: 'Presupuesto federal',
                    data: valuesGraph,
                    borderColor: 'rgb(140, 180, 193)',
                    backgroundColor: 'rgba(140, 180, 193, 0.5)',
                  },],
            });
            
        })
        .catch(error => {
            console.error(error);
        });
    }, []);
    
    // actualizar el gráfico cuando cambien los datos, el año seleccionado o el INPC
    useEffect(() => {
        const chart = chartRefPresupuesto.current;
        if (chart) {
            chart.data.labels=dataPresupuesto.labels;
            let dataChart=[];
            if(inpc[selectedYear]){
                console.log('inpc[selectedYear]',inpc[selectedYear]);
                for(let i=0;i<dataPresupuesto.labels.length;i++){
                    dataChart.push(dataPresupuesto.datasets[0].data[i]*inpc[selectedYear]/inpc[dataPresupuesto.labels[i]]);
                }
            }
            chart.data.datasets[0].data=dataChart;
            chart.update();
            }
        }
    , [dataPresupuesto,selectedYear,inpc]);
    
    return (
        <>
        <div className='row'>
            <div className='col-md-12 col-lg-6'>
            <Chart 
                ref={chartRefPresupuesto}
                type='line' 
                data={dataPresupuesto}  
                options={optionsPresupuesto}
            />
            </div>
        </div>
        </>
    );
}

export default GastoFederalizado