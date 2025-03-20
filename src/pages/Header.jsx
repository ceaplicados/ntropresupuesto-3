import { useEffect,useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import General from './General'
import {hideToast, updateUser} from '../parametersSlice'
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import './Header.css'
import { useCookies } from 'react-cookie'

function Header() {
  const toasts = useSelector(state => state.parameters.toasts);
  const user = useSelector(state => state.parameters.user);
  const [toastList,setToastList]=useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(['jwt'])
  const dispatch = useDispatch();

  const toggleToastShow = (index) => {
    dispatch(hideToast(index))
  }

  useEffect(() => {
    setToastList(toasts.map((toast,index) => {
      return (
        <>
          <Toast key={'toast_'+index} show={toast.show ? true : false} delay={3000} autohide onClose={() => toggleToastShow({index}) }>
            <Toast.Header >
              <strong className="me-auto">#NuestroPresupuesto</strong>
            </Toast.Header>
            <Toast.Body>{toast.texto}</Toast.Body>
          </Toast>
        </>
      )
    })
  )
  },[toasts])

  const cerrarSesion = () => {
    setCookie('accessToken',null);
      removeCookie('accessToken');
      const user = {
        UUID: null,
        sobrenombre: null,
        accessToken: null,
        expiresIn: null,
        image: null
      }
      dispatch(updateUser(user))
  }

  return (
    <>
      <General/>
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
                        <li><a className="dropdown-item" onClick={ cerrarSesion }>Cerrar sesión</a></li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
            </>)
            :
            (<>
            <a href='/login'>
              <button type="button" className="btn btn-outline-light" data-bs-dismiss="offcanvas">Iniciar sesión</button>
            </a>
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