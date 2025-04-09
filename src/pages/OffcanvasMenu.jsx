import { useSelector } from 'react-redux'
import { NavLink, Link } from "react-router";
import './OffcanvasMenu.css'

function OffcanvasMenu() {
    const searchParams = useSelector(state => state.parameters.searchParams)

    return (
        <>
        <div id="lateral-menu" className='offcanvas offcanvas-start' data-bs-scroll="true" tabIndex="-1">
            <div className="offcanvas-header">
            <Link className='offcanvas-title text-start' to={{
                pathname: "/",
                search: searchParams.i ? '?i='+searchParams.i : ''
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
                        search: (searchParams.i ? '?i='+searchParams.i : '')
                    }} end>
                    <span className="material-symbols-outlined">dashboard</span>
                    Gasto federalizado
                    </NavLink>
                </li>
                <li data-bs-dismiss="offcanvas">
                    <NavLink to={{
                        pathname:"/JAL", 
                        search: (searchParams.i ? '?i='+searchParams.i : '')
                    }}  end>
                    <span className="material-symbols-outlined">dashboard</span>
                    Jalisco
                    </NavLink>
                </li>
                <li data-bs-dismiss="offcanvas">
                    <NavLink to={{
                        pathname: "/CDMX",
                        search: (searchParams.i ? '?i='+searchParams.i : '')
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
            </div>
        </div>
        </>
    );
}

export default OffcanvasMenu