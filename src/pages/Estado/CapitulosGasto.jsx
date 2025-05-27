import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Chart } from 'react-chartjs-2';
import { Link } from 'react-router-dom'
import axios from  '../../api/axios'
import './CapitulosGasto.css';

const CapitulosGasto = () => {
    const [capitulosGasto,setCapitulosGasto] = useState([]);
    const _colores = useSelector(state => state.parameters.colores);
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc);
    const versionActual = useSelector(state => state.estado.versionActual);
    const estadoActual = useSelector(state => state.estado.actualEstado);
    const [rowsTabla,setRowsTabla] = useState([]);
    const [totalPresupuesto,setTotalPresupuesto] = useState(null);
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
        if(versionActual.Id && estadoActual.Codigo){
            let url='/'+estadoActual.Codigo+'/CapituloGasto?v='+versionActual?.Id;
            const getPresupuestoCapituloGasto = async (url) => {
                const response = await axios(url);
                const data = response?.data;
                let presupuesto=data.presupuesto.map((capitulo, index) => {
                    return {
                        ...capitulo,
                        color: getColor(index)
                    }
                });
                setCapitulosGasto(presupuesto);
            }
            getPresupuestoCapituloGasto(url);
        }
    },[estadoActual,versionActual]);
    
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
        let valoresTabla=capitulosGasto.map((capitulo) => {
            return {
                ...capitulo,
                Monto: capitulo.Monto*inpc[selectedYear]/inpc[versionActual.Anio],
            }
        });
        let total=valoresTabla.reduce( (total,capitulo) => {
            return total+capitulo.Monto
        }, 0);
        setTotalPresupuesto(total);
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
                <td><span className='leyenda' style={{backgroundColor: capitulo.color}}></span>{capitulo.Clave} - {capitulo.Nombre} <Link to={'./CapituloGasto/'+capitulo.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link></td>
                <td className='text-end font-monospace'>{capitulo.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                <td className='text-end font-monospace'>{(capitulo.Monto/total).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 1})}</td>
            </tr>)
        });
        setRowsTabla(tableBody);

        let labels=valoresTabla.map((capitulo) => {
            return capitulo.Clave+' - '+capitulo.Nombre;
        });
        let dataChart=valoresTabla.map((capitulo) => {
            return capitulo.Monto;
        });
        let backgroundColor=valoresTabla.map((capitulo,index) => {
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
    },[capitulosGasto,orderBy,selectedYear]);

    return (
        <>
        <div className='row mb-4'>
            <div className='col-12 mb-3'>
                <h3>Capítulos de gasto <small>¿En qué se gasta?</small></h3>
            </div>
            <div className='col-xs-12 col-md-6'>
                    <Chart
                        ref={chartRef}
                        type='pie' 
                        data={configChart}  
                        options={optionsChart}
                        width='100%'
                        height='50vw'
                    />
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
                                Presupuesto { versionActual?.Anio   }
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
                    <tfoot>
                        <tr>
                            <td className='text-end'>Total:</td>
                            <td className='font-monospace text-end'>{totalPresupuesto ? totalPresupuesto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) : null}</td>
                            <td className='font-monospace text-end'>100%</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        </>
    )
}

export default CapitulosGasto