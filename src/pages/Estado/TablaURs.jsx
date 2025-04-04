import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import './TablaURs.css'

const TablaURs = () => {
    const dataPresupuesto = useSelector(state => state.estado.presupuestoUR);
    const unidadesPresupuestales = useSelector(state => state.estado.unidadesPresupuestales);
    const [filtroTabla,setFiltroTabla] = useState('');
    const [rowsTabla,setRowsTabla] = useState([]);
    const [totalTabla,setTotalTabla] = useState(0);
    const [totalFiltro,setTotalFiltro] = useState(0);
    const [orderBy,setOrderBy] = useState({Campo: 'Clave', Orden: 'ASC'});
    
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
        let tableBody=null;
        if(dataPresupuesto.versionPresupuesto){
            let valoresTabla=[...dataPresupuesto.presupuesto];
            
            let totalPresupuesto=valoresTabla.reduce( (total,partida) => {
                return total+partida.Monto
            }, 0);

            setTotalTabla(totalPresupuesto);
            let sumaFiltro=0;
            if(filtroTabla){
                valoresTabla=valoresTabla.filter((partida) => { 
                    return partida.Clave.toUpperCase().indexOf(filtroTabla.toUpperCase())>=0 || partida.Nombre.toUpperCase().indexOf(filtroTabla.toUpperCase())>=0 || (partida.OtrosNombres && partida.OtrosNombres.toUpperCase().indexOf(filtroTabla.toUpperCase())>=0) 
                });
                sumaFiltro=valoresTabla.reduce((total,partida) => {
                    return total+partida.Monto
                }, 0);
                setTotalFiltro(sumaFiltro);
            }

            let campoReorder=orderBy.Campo;
            if(campoReorder==='PorcentajeTotal' || campoReorder==='PorcentajeFiltro'){
                campoReorder='Monto';
            }
            if(orderBy.Orden==='ASC'){
                valoresTabla.sort(dynamicSort(campoReorder))
            }else{
                valoresTabla.sort(dynamicSort('-'+campoReorder))
            }

            tableBody=valoresTabla.map((partida) => {
                return (<tr key={partida.Id}>
                    <td className='font-monospace'>{partida.Clave}</td>
                    <td>{partida.Nombre}</td>
                    <td className='text-end font-monospace'>{partida.Monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                    <td className='text-end font-monospace'>{(partida.Monto/totalPresupuesto).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 1})}</td>
                    {filtroTabla ? (<td className='text-end font-monospace'>{(partida.Monto/sumaFiltro).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 1})}</td>) : null}
                </tr>)
            });
        }
        setRowsTabla(tableBody);
    },[dataPresupuesto,filtroTabla,orderBy]);

    return (
        <>
        <div className='row mb-3'>
            <div className='col-12 mb-3'>
                <h3>Unidades Responsables <small>¿Quién se lo gasta?</small></h3>
            </div>
            <div className='col-xs-12 col-md-6 col-lg-4'>
                <div className='input-group flex-nowrap'>
                    <span className="input-group-text" id="addon-wrapping">
                        <span className="material-symbols-outlined">search</span>
                    </span>
                    <input type="text" className='form-control' id='filtroTablaURs' placeholder='Filtrar tabla' value={filtroTabla} onChange={(e) => setFiltroTabla(e.target.value)} />
                </div>
            </div>
        </div>
        <table className='table table-striped table-bordered table-responsive'>
          <thead>
            <tr>
                <th onClick={changeOrder} data-order="Clave">
                    Clave 
                    { orderBy.Campo==='Clave' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                </th>
                <th onClick={changeOrder} data-order="Nombre">
                    Unidad Responsable
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
                { filtroTabla ? (<th onClick={changeOrder} data-order="PorcentajeFiltro">
                    % Filtro
                    { orderBy.Campo==='PorcentajeFiltro' ? (<span className="material-symbols-outlined">arrow_circle_{ orderBy.Orden==='ASC' ? 'down' : 'up' }</span>) : null }
                </th>) : null }
            </tr>
          </thead>
          <tbody>{rowsTabla}</tbody>
          <tfoot>
            <tr>
                <td colSpan='2' className='text-end'>Presupuesto total:</td>
                <td className='text-end font-monospace'>{totalTabla.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                <td className='text-end font-monospace'>100%</td>
                { filtroTabla ? (<td></td>) : null }
            </tr>
            { filtroTabla ? (
                <tr className='totalFiltro'>
                    <td colSpan='2' className='text-end'>Suma filtro:</td>
                    <td className='text-end font-monospace'>{totalFiltro.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td>
                    <td></td>
                    <td className='text-end font-monospace'>{(totalFiltro/totalTabla).toLocaleString("en-MX", {style:"percent", minimumFractionDigits: 1})}</td>
                </tr>
            ) : null }
          </tfoot>
        </table>
        </>
    )
}

export default TablaURs