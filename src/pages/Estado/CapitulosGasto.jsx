import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Chart } from 'react-chartjs-2';
import './CapitulosGasto.css';

const CapitulosGasto = ({estadoActual, presupuestoActual}) => {
    const [capitulosGasto,setCapitulosGasto] = useState([]);
    const api_url=useSelector(state => state.parameters.api_url);
    const _colores = useSelector(state => state.parameters.colores);
    const [rowsTabla,setRowsTabla] = useState([]);
    const [orderBy,setOrderBy] = useState({Campo: 'Clave', Orden: 'ASC'});
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
    const chartRef = useRef(null);
    const getColor = (index) => {
        if (index < _colores.length) {
            return _colores[index];
        } else {
            return _colores[index % _colores.length];
        }
    }

    useEffect(() => {
        if(presupuestoActual.Id && estadoActual.Codigo){
            let url=api_url+'/'+estadoActual.Codigo+'/CapituloGasto?v='+presupuestoActual.Id;
            fetch(url)
            .then(response => response.json())
            .then(data => {  
                // deflactar valores
                let presupuesto=data.presupuesto.map((capitulo, index) => {
                    return {
                        ...capitulo,
                        color: getColor(index)
                    }
                });
                setCapitulosGasto(presupuesto);
                let labels=presupuesto.map((capitulo) => {
                    return capitulo.Clave+' - '+capitulo.Nombre;
                });
                let dataChart=presupuesto.map((capitulo) => {
                    return capitulo.Monto;
                });
                let backgroundColor=presupuesto.map((capitulo,index) => {
                    return getColor(index);
                });
                setConfigChart({
                    labels: labels,
                    datasets: [{
                        label: 'Capítulos de gasto',
                        data: dataChart,
                        backgroundColor: backgroundColor,
                    }],
                });
                if(chartRef.current){
                    chartRef.current.update();
                }
            })
            .catch(error => {
                console.error(error);
            });
        }
    },[estadoActual,presupuestoActual]);
    
    const changeOrder = (e) => {
        let newOrder='ASC';
        if(orderBy.Campo===e.target.attributes['data-order'].value){
            if(orderBy.Orden==='ASC'){
                newOrder='DESC';
            }
        }
        setOrderBy({Campo: e.target.attributes['data-order'].value, Orden: newOrder});
    }

    const  dynamicSort = (property) => {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    useEffect( () => {
        let valoresTabla=[...capitulosGasto];
        let totalPresupuesto=valoresTabla.reduce( (total,capitulo) => {
            return total+capitulo.Monto
        }, 0);

        let tableBody=null;
        let campoReorder=orderBy.Campo;
        if(campoReorder==='Porcentaje'){
            campoReorder='Monto';
        }
        if(orderBy.Orden==='ASC'){
            valoresTabla.sort(dynamicSort(campoReorder))
        }else{
            valoresTabla.sort(dynamicSort('-'+campoReorder))
        }
        tableBody=valoresTabla.map((capitulo) => {
            return (<tr key={capitulo.Clave}>
                <td><span className='leyenda' style={{backgroundColor: capitulo.color}}></span>{capitulo.Clave} - {capitulo.Nombre}</td>
                <td className='text-end font-monospace'>{capitulo.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                <td className='text-end font-monospace'>{(capitulo.Monto/totalPresupuesto).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 1})}</td>
            </tr>)
        });
        setRowsTabla(tableBody);
    },[capitulosGasto,orderBy]);

    return (
        <>
        <div className='row mb-3'>
            <div className='col-12 mb-3'>
                <h3>Capítulos de gasto <small>¿En qué se gasta?</small></h3>
            </div>
            <div className='col-xs-12 col-md-6'>
                <div className='card'>
                    <Chart
                        ref={chartRef}
                        type='pie' 
                        data={configChart}  
                        options={optionsChart}
                        width='100%'
                        height='50vw'
                    />
                </div>
            </div>
            <div className='col-xs-12 col-md-6'>
                <table className='table table-striped table-bordered table-responsive' id='tablaCapitulosGasto'>
                    <thead>
                        <tr>    
                            <th onClick={changeOrder} data-order="Clave">
                                Capítulo de Gasto
                                { orderBy.Campo==='Clave' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                            </th>
                            <th onClick={changeOrder} data-order="Monto">
                                Presupuesto { /*presupuestoActual ? presupuestoActual.Anio : '' */ }
                                { orderBy.Campo==='Monto' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                            </th>
                            <th onClick={changeOrder} data-order="Porcentaje">
                                Porcentaje
                                { orderBy.Campo==='Porcentaje' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowsTabla}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    )
}

export default CapitulosGasto