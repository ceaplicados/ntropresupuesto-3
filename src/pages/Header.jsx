import { useState } from 'react'
import './Header.css'

function Header() {
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
        </>
    );
}

export default Header