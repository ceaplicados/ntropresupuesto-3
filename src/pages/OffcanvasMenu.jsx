import { useSelector } from 'react-redux'
import './OffcanvasMenu.css'

function OffcanvasMenu() {
    const searchParams = useSelector(state => state.parameters.searchParams)

    return (
        <>
        <div id="lateral-menu" className='offcanvas offcanvas-start' data-bs-scroll="true" tabIndex="-1">
            <div className="offcanvas-header">
            <a className='offcanvas-title text-start' href={"/"+ (searchParams.i ? '?i='+searchParams.i : '')}>
                <img className='offcanvas-logo' src="/img/logo_blanco.svg" alt="#NuestroPresupuesto"/>
            </a>
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
                <li>
                    <a href={"/"+ (searchParams.i ? '?i='+searchParams.i : '')}>
                    <span className="material-symbols-outlined">dashboard</span>
                    Gasto federalizado
                    </a>
                </li>
                <li>
                    <a href={"/JAL"+ (searchParams.i ? '?i='+searchParams.i : '')}>
                    <span className="material-symbols-outlined">dashboard</span>
                    Jalisco
                    </a>
                </li>
                <li>
                    <a href={"/CDMX"+ (searchParams.i ? '?i='+searchParams.i : '')}>
                    <span className="material-symbols-outlined">dashboard</span>
                    Ciudad de México
                    </a>
                </li>
                </ul>
                <h3>Comunidad</h3>
                <ul className="offcanvas-menu">
                <li>
                    <a href='/cuadernos'>
                    <span className="material-symbols-outlined">book_5</span>
                    Cuadernos
                    </a>
                </li>
                </ul>
            </nav>
            </div>
        </div>
        </>
    );
}

export default OffcanvasMenu