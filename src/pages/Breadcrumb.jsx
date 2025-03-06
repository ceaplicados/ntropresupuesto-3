import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectNewYear, setInpc, setSearchParams } from '../parametersSlice'
import './Breadcrumb.css'

function Breadcrumb() {
    const dispatch = useDispatch();
    const [urlVariables,setUrlVariables] = useSearchParams();
    const selectedYear = useSelector(state => state.parameters.selectedYear)
    const inpc = useSelector(state => state.parameters.inpc)

    useEffect(() => {
        fetch('https://api.nuestropresupuesto.mx/INPC')
          .then(response => response.json())
          .then(data => {
            dispatch(setInpc(data));
          })
          .catch(error => {
            console.error(error);
          });
      }, []);

      useEffect(() => {
        if(urlVariables.get('i')){
            dispatch(setSearchParams({i: urlVariables.get('i')})) 
            dispatch(selectNewYear(urlVariables.get('i')))
        }
      },[]);

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
            <li className="breadcrumb-item active" aria-current="page">
            Gasto federalizado
            </li>
        </ol>
        </nav>
        <div className='row row-cols-lg-auto align-items-top'>
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
        </div>
    </section>
        </>
    );
}

export default Breadcrumb