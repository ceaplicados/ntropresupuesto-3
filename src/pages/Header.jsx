import { useEffect,useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {hideToast} from '../parametersSlice'
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import './Header.css'

function Header() {
  const toasts=useSelector(state => state.parameters.toasts);
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
            <a href='/login'>
              <button type="button" className="btn btn-outline-light" data-bs-dismiss="offcanvas">Iniciar sesión</button>
            </a>
          </div>
        </nav>
      </header>
      <ToastContainer className="position-fixed top-0 end-0 p-3">{toastList}</ToastContainer>
    </>
  );
}

export default Header