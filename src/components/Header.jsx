import { useEffect,useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { hideToast } from '../parametersSlice'
import useLogout from '../hooks/useLogout';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import './Header.css'

function Header() {
  const toasts = useSelector(state => state.parameters.toasts);
  const user = useSelector(state => state.parameters.user);
  const logout = useLogout();
  const [toastList,setToastList]=useState([]);
  const dispatch = useDispatch();

  const toggleToastShow = (index) => {
    dispatch(hideToast(index))
  }

  useEffect(() => {
    setToastList(toasts.map((toast,index) => {
      return (
        <>
          <Toast key={'toast_'+index} show={toast.show ? true : false} delay={3000} autohide onClose={() => toggleToastShow({index}) }>
            <Toast.Header key={'toast_header_'+index} >
              <strong className="me-auto">#NuestroPresupuesto</strong>
            </Toast.Header>
            <Toast.Body key={'toast_body_'+index} >{toast.texto}</Toast.Body>
          </Toast>
        </>
      )
    })
  )
  },[toasts])

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
            { user.UUID ? 
            (<>
            <nav className="navbar navbar-expand-lg navbar-dark">
              <div className="container-fluid">
                <div className="collapse navbar-collapse" id="menuUsuario">
                  <ul className="navbar-nav">
                    <li className="nav-item dropdown">
                      <a className="nav-link active dropdown-toggle" href="#" id="menuUsuarioDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img className='imagen-usuario' src={user.image}/> 
                        <span className='nombre-usuario'>¡Hola {user.sobrenombre}!</span>
                      </a>
                      <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="menuUsuarioDropdown">
                        <li key='menuCuadernos'><Link className="dropdown-item" to='/cuadernos'><span className="material-symbols-outlined">book_5</span> Mis cuadernos</Link></li>
                        <li key='menuProfile'><Link className="dropdown-item" to='/profile'><span className="material-symbols-outlined">account_circle</span> Mi perfil</Link></li>
                        <li key='menuLogout'><Link className="dropdown-item" onClick={ logout }><span className="material-symbols-outlined">logout</span>Cerrar sesión</Link></li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
            </>)
            :
            (<>
            <Link to='/login'>
              <button type="button" className="btn btn-outline-light" data-bs-dismiss="offcanvas">Iniciar sesión</button>
            </Link>
            </>)
            }
          </div>
        </nav>
      </header>
      <ToastContainer className="position-fixed top-0 end-0 p-3">{toastList}</ToastContainer>
    </>
  );
}

export default Header