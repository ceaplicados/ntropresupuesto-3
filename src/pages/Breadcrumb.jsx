import { useSelector, useDispatch } from 'react-redux'
import { selectNewYear, setInpc, setSearchParams, setEstados } from '../parametersSlice'
import './Breadcrumb.css'

function Breadcrumb({breadcrumb, ocultarDeflactor}) {
    const dispatch = useDispatch();
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)

    // Cambiar el valor del selectedYear y actualizarlo en variable de la URL
    const updateSelectedYear = (e) => {
        setUrlVariables({i: e.value});
        dispatch(setSearchParams({i: e.value}));
        dispatch(selectNewYear(e.value));
    };

    return (
        <>
        <section className='container d-flex justify-content-between' id='breadcrumb'>
        <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
            <li className="breadcrumb-item">
            <a href="/"><img src='/img/logo.svg'/></a>
            </li>
            {
                breadcrumb.map((page) => {
                    if(page.url){
                        return (<a href={page.url}><li key={page.url} className="breadcrumb-item" aria-current="page">
                            {page.texto}
                            </li></a>)
                    }else{
                        return (<li key='actual' className="breadcrumb-item active" aria-current="page">
                            {page.texto}
                            </li>)
                    }
                })
            }
        </ol>
        </nav>
        <div className='row row-cols-lg-auto align-items-top'>
            { ocultarDeflactor!== false ? 
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