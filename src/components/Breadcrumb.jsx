import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams, Link } from 'react-router-dom'
import { selectNewYear } from '../parametersSlice'
import './Breadcrumb.css'

function Breadcrumb() {
    const [urlVariables,setUrlVariables] = useSearchParams();
    const dispatch = useDispatch();
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)
    const page = useSelector(state => state.parameters.page)
    const [breadcrumb,setBreadcrumb] = useState([]);
    const [ocultarDeflactor,setOcultarDeflactor] = useState([]);

    useEffect(() => {
        setBreadcrumb(page.breadcrumb);
        setOcultarDeflactor(page.ocultarDeflactor);
    },[page])

    // Cambiar el valor del selectedYear y actualizarlo en variable de la URL
    const updateSelectedYear = (e) => {
        const params = {};
        urlVariables.forEach((value, key) => {
            params[key] = value;
        })
        params["i"]=e.value
        setUrlVariables(params);
        dispatch(selectNewYear(e.value));
    };

    return (
        <>
        <section className='container d-flex justify-content-between sticky-top' id='breadcrumb'>
        <nav aria-label="breadcrumb">
        <ol key={'breadcrumb'} className="breadcrumb">
            <li key={'Home'} className="breadcrumb-item">
            <Link to={{
                pathname:"/", 
                search:(urlVariables.get("i") ? '?i='+urlVariables.get("i") : '')
            }}><img src='/img/logo.svg'/></Link>
            </li>
            {
                breadcrumb.map((page) => {
                    if(page.url){
                        return (<>
                            <li key={page.url} className="breadcrumb-item" aria-current="page">
                                <Link to={page.url}>{page.texto}</Link>
                            </li></>)
                    }else{
                        return (<li key='actual' className="breadcrumb-item active" aria-current="page">
                            {page.texto}
                            </li>)
                    }
                })
            }
        </ol>
        </nav>
        <div className='row row-cols-lg-auto align-items-center'>
            { ocultarDeflactor!== true ? 
            (
            <>
            <div className='col-12'>A valores del </div>
            <div className='col-12'>
                <select id='yearSelector' className="form-select form-select-sm" value={selectedYear} onChange={(e) => updateSelectedYear(e.target)}>
                {Object.keys(inpc).map(year => (
                    <option key={year} value={year}>
                    {year}
                    </option>
                ))}
                </select>
            </div>
            </>)
            : null }
        </div>
    </section>
        </>
    );
}

export default Breadcrumb