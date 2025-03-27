import { useState, useEffect, use } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useCookies } from 'react-cookie'
import { addToast, logoutUser} from '../parametersSlice'

import Header from './Header';
import Breadcrumb from './Breadcrumb'
import OffcanvasMenu from './OffcanvasMenu';

import './Usuario.css';

function Usuario() {
    const dispatch = useDispatch();
    const api_url=useSelector(state => state.parameters.api_url);
    const user = useSelector(state => state.parameters.user);
    const estados = useSelector(state => state.parameters.estados);
    const [cookies, setCookie, removeCookie] = useCookies(['jwt']);
    const [updatingUser, setUpdatingUser]=useState(false);

    const [datosUsuario,setDatosUsuario]=useState({
        Nombre: '',
        Apellidos: '',
        Sobrenombre: '',
        Email: '',
        Telefono: '',
        Estado: ''
    });

    useEffect(() => {
        if(api_url && datosUsuario.Email==='' && user.accessToken){
            // obtener los datos del usuario
            let token=user.accessToken;
            fetch(api_url+'/User',{headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'

            }})
            .then( response => {
                let data={}
                if(response.ok){
                    data=response.json();
                }else{
                    setCookie('accessToken',null);
                    removeCookie('accessToken');
                    dispatch(logoutUser());
                    window.location.href='/login';
                }
                return data;
            })
            .then(data => {
                for (const [key, value] of Object.entries(data)) {
                    if(value===null){
                        data[key]='';
                    }
                }
                setDatosUsuario(data);
            })
            .catch(error => {
                console.error(error);
            });
        }else if(user.init && api_url){
            setCookie('accessToken',null);
            removeCookie('accessToken');
            dispatch(logoutUser());
            window.location.href='/login';
        }
    },[api_url,user]);

    const updateUsuario = () => {
        if(!updatingUser){
            setUpdatingUser(true);
            let token=user.accessToken;
            fetch(api_url+'/User',{
                headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": 'application/json'
                },
                method: 'PUT',
                body: JSON.stringify(datosUsuario)
                }
            )
            .then( response => {
                let data={}
                if(response.ok){
                    data=response.json();
                    dispatch(addToast({texto: 'Datos actualizados correctamente'}));
                    setUpdatingUser(false);
                }else{
                    setCookie('accessToken',null);
                    removeCookie('accessToken');
                    dispatch(logoutUser());
                    window.location.href='/login';
                }
                return data;
            })
            .then(data => {
                for (const [key, value] of Object.entries(data)) {
                    if(value===null){
                        data[key]='';
                    }
                }
                setDatosUsuario(data);
            })
            .catch(error => {
                console.error(error);
            });
        }
    }
    const breadcrumb=[{
        texto: "Mi perfil"
    }];

  return (
    <>
    <Header/>
    <Breadcrumb breadcrumb={breadcrumb} ocultarDeflactor={false}/>
    <OffcanvasMenu />

    <section className='container' id='workspace'>
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
        </div>
    </section>
    </>
  )
}

export default Usuario
