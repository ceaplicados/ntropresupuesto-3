import { useSelector, useDispatch } from 'react-redux'
import { addToast } from '../../parametersSlice'
import Header from '../Header';
import Breadcrumb from '../Breadcrumb'
import OffcanvasMenu from '../OffcanvasMenu';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css'
import { useEffect } from 'react';

function Login() {
    const api_url = useSelector(state => state.parameters.api_url);
    const dispatch = useDispatch();
    const breadcrumb=[{
        texto: "Iniciar sesión"
    }];
    
    return (
        <>
        <Header/>
        <Breadcrumb breadcrumb={breadcrumb}/>
        <OffcanvasMenu />
            <script src="https://accounts.google.com/gsi/client" async></script>
            <section className='container' id='workspace'>
            <div className='row'>
                <div className='col-xs-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4'>
                    <h3>Iniciar sesión</h3>
                    <p>Si ya cuentas con una cuenta registrada inicia sesión:</p>
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            //const decoded = jwtDecode(credentialResponse.credential);
                            const data_post = {
                                credential: credentialResponse.credential
                                };
                            fetch(api_url+'/auth/Google', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(data_post)
                                })
                                .then(response => response.json())
                                .then(data => {console.log(data)})
                                .catch(error => {
                                    dispatch(addToast({texto: 'Error al iniciar sesión en la API'}))
                                    console.error(error);
                                });
                        }}
                        onError={() => {
                            dispatch(addToast({texto: 'Error al iniciar sesión en Google'}))
                            console.log('Login Failed');
                        }}
                        />                    
                </div>
                    
                </div>
            </section>
        </>
    )
}

export default Login
