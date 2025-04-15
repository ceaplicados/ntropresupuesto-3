import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { addToast, updateUser, logoutUser, setPage } from '../parametersSlice'

import './Usuario.css';

function Usuario() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();
    const user = useSelector(state => state.parameters.user);
    const estados = useSelector(state => state.parameters.estados);
    const [updatingUser, setUpdatingUser]=useState(false);
    const page = useSelector(state => state.parameters.page);

    const [datosUsuario,setDatosUsuario]=useState({
        Nombre: '',
        Apellidos: '',
        Sobrenombre: '',
        Email: '',
        Telefono: '',
        Estado: ''
    });

    useEffect(() => {
        const datosPage={
            ...page,
            breadcrumb: [{
                texto: "Mi perfil"
            }],
            ocultarDeflactor: true
          }
          dispatch(setPage(datosPage));
    },[])

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosPrivate.get('/User');
                for (const [key, value] of Object.entries(response.data)) {
                    if(value===null){
                        response.data[key]='';
                    }
                }
                setDatosUsuario(response.data);
                dispatch(updateUser({
                    ...user,
                    UUID: response.data.UUID,
                    sobrenombre: response.data.Sobrenombre,
                    image: response.data.Image
                }))
            } catch (err) {
                console.log(err);
                dispatch(logoutUser());
                navigate('/login', { state: {from: location }, replace: true })
            }
        };

        fetchUserData();
    }, [axiosPrivate]);
    
    const updateUsuario = async () => {
        if(!updatingUser){
            setUpdatingUser(true);
            try{
                const response = await axiosPrivate.put('/User',JSON.stringify(datosUsuario));
                dispatch(addToast({texto: 'Datos actualizados correctamente'}));
                setUpdatingUser(false);
                for (const [key, value] of Object.entries(response.data)) {
                    if(value===null){
                        response.data[key]='';
                    }
                }
                setDatosUsuario(response.data);
                dispatch(updateUser({
                    ...user,
                    UUID: response.data.UUID,
                    sobrenombre: response.data.Sobrenombre,
                    image: response.data.Image
                }))
            }
            catch(err){
                console.log(err);
                dispatch(logoutUser());
                navigate('/login', { state: {from: location }, replace: true })
            }
        }
    }

  return (
    <>
    <h1>Perfil <small>de usuario</small></h1>
    <div className='row mb-4'>
        <div className='col-xs-12 col-md-6'>
            <div className='card'>
                <h3>Mis datos</h3>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='nombre'>Nombre</label>
                    <input type='text' className='form-control' id='nombre' value={datosUsuario.Nombre} onChange={(e) => setDatosUsuario({...datosUsuario,Nombre: e.target.value})}/>
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='apellidos'>Apellidos</label>
                    <input type='text' className='form-control' id='apellidos' value={datosUsuario.Apellidos} onChange={(e) => setDatosUsuario({...datosUsuario,Apellidos: e.target.value})}/>
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='sobrenombre'>Sobrenombre</label>
                    <input type='text' className='form-control' id='sobrenombre' value={datosUsuario.Sobrenombre} onChange={(e) => setDatosUsuario({...datosUsuario,Sobrenombre: e.target.value})}/>
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='email'>Correo electrónico</label>
                    <input type='email' className='form-control' id='email' value={datosUsuario.Email} onChange={(e) => setDatosUsuario({...datosUsuario,Email: e.target.value})}/>
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='telefono'>Whatsapp</label>
                    <input type='tel' className='form-control' id='telefono' value={datosUsuario.Telefono} onChange={(e) => setDatosUsuario({...datosUsuario,Telefono: e.target.value})}/>
                </div>
                <div className='mb-3'>
                    <label className='form-label' htmlFor='estado'>Estado de procedencia / preferencia</label>
                    <select className='form-select' id='estado' value={datosUsuario.Estado}  onChange={(e) => setDatosUsuario({...datosUsuario,Estado: e.target.value})}>
                        <option value=''>Selecciona tu estado</option>
                        { estados.map((estado, index) => {
                            return <option key={index} value={estado.Id}>{estado.Nombre}</option>
                        }
                        )}
                    </select>
                </div>
                <div className='mb-3 mt-4 text-end'>
                    <button className={updatingUser ? 'btn btn-primary thinking' : 'btn btn-primary'} onClick={updateUsuario}>Guardar cambios</button>
                </div>
            </div>
        </div>
        <div className='col-xs-12 col-md-6'>
            <div className='card mb-3'>
                <h3>Mis cuadernos</h3>
                <p>La herramienta de cuadernos de trabajo te permite realizar colaborativamente análisis y comparaciones del presupuesto histórico usando todos los datos de #NuestroPresupuesto.</p>
                <p className='text-end'><Link className='btn btn-primary' to='/cuadernos'>Ir</Link></p>
            </div>
        </div>
    </div>
    </>
  )
}

export default Usuario
