import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Chart } from 'react-chartjs-2';
import { selectNewYear } from '../../parametersSlice'
import './DetalleCuaderno.css'
import Header from '../Header';
import Breadcrumb from '../Breadcrumb'
import OffcanvasMenu from '../OffcanvasMenu';

function DetalleCuaderno() {
    const location = useLocation();
    const dispatch = useDispatch();
    const selectedYear = useSelector(state => state.parameters.selectedYear);
    const api_url=useSelector(state => state.parameters.api_url);
    const user = useSelector(state => state.parameters.user);
    const inpc = useSelector(state => state.parameters.inpc)
    const estados = useSelector(state => state.parameters.estados)
    const _colores = useSelector(state => state.parameters.colores);

    const [datosCuaderno,setDatosCuaderno]=useState({
        Id: null,
        Nombre: null,
        Descripcion: null,
        Publico: true,
        AnioINPC: null,
        Owner: {
            Image: null,
            Sobrenombre: null
        },
        Usuarios: [],
        Renglones: [],
        VersionesPresupeusto: [],
        Datos: []
    });
    const [datosTabla,setDatosTabla]=useState([]);
    const [breadcrumb,setBreadcrumb]=useState([{
        texto: "Cuadernos",
        url: "/Cuadernos"
    },{
        texto: "Cuaderno"
    }]);
    const chartRef = useRef(null);
    const [configChart, setConfigChart] = useState({
        labels: [],
        datasets: [],
    });
    const optionsChart = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = ' '+context.dataset.label || ' ';
                        if (context.parsed.y !== null) {
                            label += ': '+ (context.parsed.y).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2});
                        }
                        return label;
                    }
                }
            }
        },
    };

    // obtener el detalle del cuaderno
    useEffect( () => {
        if(api_url && user.init){
            let headers={};
            if(user.accessToken){
                let token=user.accessToken;
                headers={
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }

            let path=location.pathname.split('/');
            let idCuaderno=path[2];

            fetch(api_url+'/Cuadernos/'+idCuaderno,{headers: headers})
            .then(response => response.json())
            .then(data => {
                setDatosCuaderno(data);
            })
            .catch(error => {
                console.error(error);
            });
        }
    },[api_url,user]);

    // Actualizar el breadcrumb con los datos del cuaderno
    useEffect( () => {
        setBreadcrumb([{
            texto: "Cuadernos",
            url: "/Cuadernos"
        },{
            texto: datosCuaderno.Nombre
        }])
        if(datosCuaderno.AnioINPC){
            dispatch(selectNewYear(datosCuaderno.AnioINPC))
        }
    },[datosCuaderno]);

    // Deflactar los datos del cuaderno
    useEffect(() => {
        if(datosCuaderno.Id && selectedYear){
            let data=datosCuaderno.Renglones.map((renglon) => {
                let result={};
                result.Id=renglon.Id;
                result.Mostrar=renglon.Mostrar;
                result.Graph=renglon.Graph;
                result.label="";
                renglon.Filtro ? result.label+=renglon.Filtro.Clave+"-"+renglon.Filtro.Nombre : null;
                if(renglon.TipoFiltro=="Estado"){
                        let estado=estados.filter((itemEstado) => { return itemEstado.Id == parseInt(renglon.Estado) })
                        result.label+=estado[0].Nombre
                };
                renglon.Tipo=="ProgramaPresupuestal" ? result.label+=renglon.Referencia.Clave+"-"+renglon.Referencia.Nombre : null;
                renglon.Tipo!=="Total" && renglon.Tipo!=="ProgramaPresupuestal" ?
                    result.label+=': '+renglon.Referencia.Clave+' - '+renglon.Referencia.Nombre
                    : null;

                let versionesEstado=datosCuaderno.VersionesPresupuesto.filter((versiones) => {
                    return versiones.estado == renglon.Estado
                });
                let renglonData=datosCuaderno.Datos.filter((dato) => {
                    return dato.renglon == renglon.Id
                });
                renglonData=renglonData[0];
                result.datos=datosCuaderno.Anios.map((anio)=>{
                    let versionPresupuesto=versionesEstado[0].versiones.filter((versiones) => {
                        return versiones.Anio == anio.Anio
                    });
                    if(versionPresupuesto.length>0){
                        versionPresupuesto=versionPresupuesto[0];
                        if(renglon.Mostrar == "monto"){
                            let dato=renglonData.data.filter((data) => {
                                return data.version==versionPresupuesto.Id
                            });
                            dato=dato[0].monto;
                            if(dato){
                                dato=dato*inpc[selectedYear]/inpc[anio.Anio];
                            }
                            return dato
                        }
                        if(renglon.Mostrar == "YoY"){
                            let versionPresupuestoAnterior=versionesEstado[0].versiones.filter((versiones) => {
                                return versiones.Anio == (anio.Anio-1)
                            });
                            let datoAnterior={
                                monto: null
                            };
                            if(versionPresupuestoAnterior.length>0){
                                versionPresupuestoAnterior=versionPresupuestoAnterior[0];
                                datoAnterior=renglonData.data.filter((data) => {
                                    return data.version==versionPresupuestoAnterior.Id
                                });
                                datoAnterior=datoAnterior[0];
                            }
                            let dato=renglonData.data.filter((data) => {
                                return data.version==versionPresupuesto.Id
                            });
                            dato=dato[0];
                            let result={
                                anio: anio.Anio,
                                monto: dato.monto*inpc[selectedYear]/inpc[anio.Anio],
                                montoAnterior: datoAnterior.monto*inpc[selectedYear]/inpc[anio.Anio-1]
                            }
                            return result;
                        }
                    }else{
                        // No existe un presupuesto para ese estado / año
                        if(renglon.Mostrar == "monto"){
                            return null;
                        }
                        if(renglon.Mostrar == "YoY"){
                            let result={
                                anio: anio.Anio,
                                monto: null,
                                montoAnterior: null
                            }
                            return result;
                        }
                    }
                })
                return result;
            });
            setDatosTabla(data);
        }
    },[selectedYear,datosCuaderno]);

    const getColor = (index) => {
        if (index < _colores.length) {
            return _colores[index];
        } else {
            return _colores[index % _colores.length];
        }
    }
    // Actualizar gráfica
    useEffect(() => {
        if(datosTabla.length>0){
            let labels=datosCuaderno.Anios.map((anio) => {
                return anio.Anio
            })
            let datasets=datosTabla.map((renglon,index) => {
                let data=[];
                if(renglon.Mostrar=="YoY"){
                    data=renglon.datos.map((dato) => {
                        return dato.monto-dato.montoAnterior
                    })
                }else{
                    data=renglon.datos.map((dato) => {
                        return dato
                    })
                }
                let dataset={
                    label: renglon.label,
                    data: data,
                    borderColor: getColor(index),
                    backgroundColor: getColor(index),
                    fill: false,
                    tension: 0.3,
                  };
                return dataset;
            })
            const chart = chartRef.current;
            if (chart) {
                setConfigChart({
                    labels: labels,
                    datasets: datasets
                })
                chart.update();
            }
        }
    }, [datosTabla]);

    // Rellenar la tabla
    const rowsTablaDatos = () => {
        if(datosCuaderno.Id){
        return datosCuaderno.Renglones.map((renglon) => {
            return(<>
            <tr key={'renglon_'+renglon.Id}>
                <td className='dato'>
                    { renglon.Filtro ? (<>
                    <b>{renglon.Filtro.Clave}</b>
                    {renglon.Filtro.Nombre}</>) : null
                    }
                    { renglon.TipoFiltro=="Estado" ? (<>
                    <b>{(() => {
                        let estado=estados.filter((itemEstado) => { return itemEstado.Id == parseInt(renglon.Estado) });
                        return estado[0].Nombre
                    })()}</b>
                    </>) : null
                    }
                    { renglon.Tipo=="ProgramaPresupuestal" ? (<>
                    <b>{renglon.Referencia.Clave}</b>
                    {renglon.Referencia.Nombre}</>) : null
                    }
                    <span className='tipo'>{
                        (() => {
                            switch(renglon.Tipo) {
                                case "Total":
                                    return "Presupuesto total";
                                case "CapituloGasto":
                                    return (<>Capitulo de gasto<br/><b>{renglon.Referencia.Clave}</b>{renglon.Referencia.Nombre}</>);
                                case "ConceptoGeneral":
                                    return (<>Concepto general<br/><b>{renglon.Referencia.Clave}</b>{renglon.Referencia.Nombre}</>);
                                case "PartidaGenerica":
                                    return (<>Partida genérica<br/><b>{renglon.Referencia.Clave}</b>{renglon.Referencia.Nombre}</>);
                                case "ObjetoGasto":
                                    return (<>Objeto de gasto<br/><b>{renglon.Referencia.Clave}</b>{renglon.Referencia.Nombre}</>);
                                case "ProgramaPresupuestal":
                                    return "Programa presupuestal";
                                default:
                                    return "Otro";
                            }
                        })()
                    }</span>
                    <span className='Estado'>{(() => {
                        let estado=estados.filter((itemEstado) => { return itemEstado.Id == parseInt(renglon.Estado) });
                        return estado[0].Nombre
                    })()}</span>
                    <span className='Mostrar'>{
                        (()=>{
                            if(renglon.Mostrar=="YoY"){
                                return "Variación anual"
                            }else{
                                return "Monto"
                            }
                        })()
                        }</span>
                </td>
                <td className='Graph'>{(() => {
                    if(renglon.Graph==="line"){
                        return (<><span className="material-symbols-outlined active">
                            timeline
                            </span></>)
                    }
                })()}</td>
                {(()=>{
                    if(datosTabla.length>0){
                        let renglonTabla=datosTabla.filter((itemRenglon) => { return itemRenglon.Id == renglon.Id });
                        renglonTabla=renglonTabla[0];
                        return renglonTabla.datos.map((dato,index) => {
                            if(renglonTabla.Mostrar=="YoY"){
                                return(<><td className='font-monospace' key={renglon.Id+"_"+index}>{
                                    (()=>{
                                        if(dato.monto && dato.montoAnterior){
                                            return(<>
                                            {(dato.monto-dato.montoAnterior).toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}                                            
                                            </>)
                                        }else{
                                            return '-'
                                        }
                                    })()
                                }
                                <span className='anio'><b>{dato.anio-1}:</b>{ dato.montoAnterior ? dato.montoAnterior.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) : '-' }</span>
                                <span className='anio'><b>{dato.anio}:</b>{dato.monto ? dato.monto.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2}) : "-" }</span>
                                </td></>)
                            }else{
                                if(dato===null){
                                    return (<><td className='font-monospace' key={renglon.Id+"_"+index}>-</td></>)
                                }else{
                                    return (<><td className='font-monospace' key={renglon.Id+"_"+index}>{dato.toLocaleString("en-MX", {style:"decimal",maximumFractionDigits:2, minimumFractionDigits: 2})}</td></>)
                                }
                            }
                        })
                    }
                })()}
            </tr>
            </>)
        })
        }
    }

  return (
    <>
    <Header/>
    <Breadcrumb breadcrumb={breadcrumb}/>
    <OffcanvasMenu />

      <section className='container' id='workspace'>
        <h1>{datosCuaderno.Nombre} <small>{datosCuaderno.Publico ? 'Cuaderno público' : 'Cuaderno privado'}</small></h1>
        <p className='subtitle'>{datosCuaderno.Descripcion}</p>
        <div className='text-end'>
            <img className='owner-img' src={datosCuaderno.Owner.Image} alt={datosCuaderno.Owner.Sobrenombre} title={datosCuaderno.Owner.Sobrenombre}/>
            <ul key='users-imgs' className='users-imgs'>
                {
                    datosCuaderno.Usuarios.map((usuario) => {
                        return(<>
                        <li key={'user_'+usuario.UUID}><img key={'user_img_'+usuario.UUID} src={usuario.Image} alt={usuario.Sobrenombre} title={usuario.Sobrenombre}/></li>
                        </>);
                    })
                }
            </ul>
        </div>
        <div className='mb-4' id='chart'>
            <Chart 
                ref={chartRef}
                type='line' 
                data={configChart}  
                options={optionsChart}
            />
        </div>
        <div className='datos'>
            <h3>Datos</h3>
            { datosCuaderno.Id ? (
            <table id='tablaDatos' className='table table-striped'>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th colSpan={datosCuaderno.Anios.length}>Años</th>
                    </tr>
                    <tr>
                        <th>Dato</th>
                        <th><span className="material-symbols-outlined">bar_chart_4_bars</span></th>
                        {datosCuaderno.Anios.map((anio) => {
                            return (<>
                            <th>{anio.Anio}</th>
                            </>)
                        })}
                    </tr>
                </thead>
                <tbody>{rowsTablaDatos()}</tbody>
            </table>
            )
            : null
            }
        </div>
      </section>
    </>
  )
}

export default DetalleCuaderno
