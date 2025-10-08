import { useSelector } from 'react-redux'
import { NavLink, Link } from "react-router";
import { useSearchParams } from 'react-router-dom'
import './OffcanvasMenu.css'

function OffcanvasMenu() {
    const [urlVariables,setUrlVariables] = useSearchParams();
    return (
        <>
        <div id="lateral-menu" className='offcanvas offcanvas-start' data-bs-scroll="true" tabIndex="-1">
            <div className="offcanvas-header">
            <Link className='offcanvas-title text-start' to={{
                pathname: "/",
                search: urlVariables.get("i") ? '?i='+urlVariables.get("i") : ''
            }} end>
                <img className='offcanvas-logo' src="/img/logo_blanco.svg" alt="#NuestroPresupuesto"  data-bs-dismiss="offcanvas"/>
            </Link>
            <div className='align-self-start'>
                <button type="button" className="btn text-light" data-bs-dismiss="offcanvas">
                <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            </div>
            <hr/>
            <div className="offcanvas-body">
            <nav>
                <h3>Presupuestos</h3>
                <ul className="offcanvas-menu">
                <li data-bs-dismiss="offcanvas">
                    <NavLink to={{
                        pathname: "/",
                        search: (urlVariables.get("i") ? '?i='+urlVariables.get("i") : '')
                    }} end>
                    <span className="material-symbols-outlined">dashboard</span>
                    Gasto federalizado
                    </NavLink>
                </li>
                <li data-bs-dismiss="offcanvas">
                    <NavLink to={{
                        pathname:"/JAL", 
                        search: (urlVariables.get("i") ? '?i='+urlVariables.get("i") : '')
                    }}  end>
                    <span className="material-symbols-outlined">dashboard</span>
                    Jalisco
                    </NavLink>
                </li>
                <li data-bs-dismiss="offcanvas">
                    <NavLink to={{
                        pathname: "/CDMX",
                        search: (urlVariables.get("i") ? '?i='+urlVariables.get("i") : '')
                    }} end>
                    <span className="material-symbols-outlined">dashboard</span>
                    Ciudad de México
                    </NavLink>
                </li>
                </ul>
                <h3>Comunidad</h3>
                <ul className="offcanvas-menu">
                <li data-bs-dismiss="offcanvas">
                    <NavLink to='/cuadernos' end>
                    <span className="material-symbols-outlined">book_5</span>
                    Cuadernos
                    </NavLink>
                </li>
                </ul>
            </nav>
            <nav>
                <h3>Ligas</h3>
                <ul className="offcanvas-menu">
                    <li>
                        <Link to="https://www.postman.com/centro-de-estudios-aplicados/centro-de-estudios-aplicados/collection/rk0qzko/nuestropresupuesto-api-1-0?action=share&creator=499645" target='_blank'><span className="material-symbols-outlined">api</span> Documentación de la API</Link>
                    </li>
                </ul>
            </nav>
            </div>
        </div>
        </>
    );
}

export default OffcanvasMenu