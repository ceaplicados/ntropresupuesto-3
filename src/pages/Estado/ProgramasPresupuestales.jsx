import { useState, useEffect } from 'react'
import axios from '../../api/axios'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const ProgramasPresupuestales = () => {
    const dataPresupuesto = useSelector(state => state.estado.presupuestoUR);
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)
    const versionActual = useSelector(state => state.estado.versionActual);
    const estadoActual = useSelector(state => state.estado.actualEstado);
    const [busqueda,setBusqueda] = useState('');
    const [programas,setProgramas] = useState([]);
    const [data,setData] = useState([]);
    const [rowsTabla,setRowsTabla] = useState([]);
    const [orderBy,setOrderBy] = useState({Campo: 'Monto', Orden: 'DESC'});
    
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
    // Obtener los datos de la API
    useEffect(() => {
        if(estadoActual.Id && versionActual?.Id){
            let url='/'+estadoActual.Codigo+'/Programas?v='+versionActual.Id;
            if(busqueda.trim().length>=4){
                url+='&b='+busqueda;
            }
            const getProgramas = async (url) => {
                const response = await axios(url);
                const data = response?.data;
                setProgramas(data.programas);
            }
            getProgramas(url);
        }
    }, [busqueda,estadoActual,versionActual]);

    // Deflactar los datos y ordenarlos
    useEffect(() => {
        let datos=programas.map((programa) => {
            return {
                ...programa,
                Monto: programa.Monto*inpc[selectedYear]/inpc[versionActual.Anio],
            }
        });
        let campoReorder=orderBy.Campo;
        if(campoReorder==='Porcentaje'){
            campoReorder='Monto';
        }
        if(orderBy.Orden==='ASC'){
            datos.sort(dynamicSort(campoReorder))
        }else{
            datos.sort(dynamicSort('-'+campoReorder))
        }
        setData(datos);
    },[programas,selectedYear,inpc,orderBy]);
    // Crear tabla con los datos deflactados y ordenados
    useEffect(() => {
        if(dataPresupuesto.presupuesto){
            let totalPresupuesto=dataPresupuesto.presupuesto.reduce( (total,ur) => {
                return total+ur.Monto
            }, 0);
            let tableBody=data.map((programa) => {
                return (<>
                <tr key={programa.Id}>
                    <td className='text-nowrap font-monospace'>{programa.Clave}</td>
                    <td>{programa.Nombre} <Link to={'./programa/'+programa.Clave}><span className="material-symbols-outlined">arrow_circle_right</span></Link></td>
                    <td className='text-end font-monospace'>{programa.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                    <td className='text-end font-monospace'>{(programa.Monto/totalPresupuesto).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 1})}</td>
                </tr>
                </>)
            })
            setRowsTabla(tableBody);
        }
    },[data,dataPresupuesto]);
    
    return (
        <>
        <div className='row mb-3'>
            <div className='col-12 mb-3 mt-4'>
                <h3>Programas presupuestales <small>¿Para qué se gasta?</small></h3>
            </div>
            <div className='col-xs-12 col-md-6 col-lg-4'>
                <div className='input-group flex-nowrap'>
                    <span className="input-group-text" id="addon-wrapping">
                        <span className="material-symbols-outlined">search</span>
                    </span>
                    <input type="text" className='form-control' id='buscarPrograma' placeholder='Buscar programa' value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
            </div>
        </div>
        { busqueda.trim().length==0 ? (<><p><small>Top 25 por monto asignado</small></p></>) : null}
        { busqueda.trim().length>0 && busqueda.trim().length<4 ? (<><p><small>Refina tu búsqueda</small></p></>) : null}
        <table className='table table-striped table-bordered table-responsive'>
          <thead>
            <tr>
                <th onClick={changeOrder} data-order="Clave">
                    Clave 
                    { orderBy.Campo==='Clave' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                </th>
                <th onClick={changeOrder} data-order="Nombre">
                    Programa Presupuestal
                    { orderBy.Campo==='Nombre' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                </th>
                <th onClick={changeOrder} data-order="Monto">
                    Presupuesto { dataPresupuesto.versionPresupuesto ? dataPresupuesto.versionPresupuesto.Anio : '' }
                    { orderBy.Campo==='Monto' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                </th>
                <th onClick={changeOrder} data-order="PorcentajeTotal">
                    % Total
                    { orderBy.Campo==='PorcentajeTotal' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                </th>
            </tr>
          </thead>
          <tbody>{rowsTabla}</tbody>
        </table>
        </>
    )
}

export default ProgramasPresupuestales