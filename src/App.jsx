import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header>
        <nav className='navbar'>
          <div className="container-fluid">
            <button type="button" className="btn text-light" data-bs-toggle="offcanvas" data-bs-target="#lateral-menu">
              <span className="material-symbols-outlined">
                menu
              </span>
            </button>
            <button type="button" className="btn btn-outline-light" data-bs-dismiss="offcanvas">Iniciar sesión</button>
          </div>
        </nav>
      </header>
      <section className='container' id='breadcrumb'>
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
      </section>
      <div id="lateral-menu" className='offcanvas offcanvas-start' data-bs-scroll="true" tabIndex="-1">
        <div className="offcanvas-header">
          <a className='offcanvas-title text-start' href="/">
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
                <a href="/">
                  <span className="material-symbols-outlined">dashboard</span>
                  Gasto federalizado
                </a>
              </li>
              <li>
                <a href="/JAL">
                  <span className="material-symbols-outlined">dashboard</span>
                  Jalisco
                </a>
              </li>
              <li>
                <a href="/CDMX">
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
  )
}

export default App
