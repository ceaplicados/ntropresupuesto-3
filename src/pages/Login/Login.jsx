import { useSelector, useDispatch } from 'react-redux'
import { addToast, updateUser } from '../../parametersSlice'
import Header from '../Header';
import Breadcrumb from '../Breadcrumb'
import OffcanvasMenu from '../OffcanvasMenu';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css'
import { useCookies } from 'react-cookie'

function Login() {
    const api_url = useSelector(state => state.parameters.api_url);
    const user = useSelector(state => state.parameters.user);
    const dispatch = useDispatch();
    const breadcrumb=[{
        texto: "Iniciar sesión"
    }];
    const [cookies, setCookie] = useCookies(['jwt'])
    
    return (
        <>
        <Header/>
        <Breadcrumb breadcrumb={breadcrumb} ocultarDeflactor={false}/>
        <OffcanvasMenu />
            <script src="https://accounts.google.com/gsi/client" async></script>
            <section className='container' id='workspace'>
                <div className='row'>
                    <div className='col-xs-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4'>
                        { user.UUID ? 
                        (<>
                            <p>¡Hola {user.sobrenombre}!</p>
                            <p><a className='btn btn-primary' href='/Cuadernos'>Ir a mis cuadernos</a></p>
                            <p>Si quieres iniciar sesión con otra cuenta, primero cierra tu sesión actual dando clic sobre tu nombre en el menú superior.</p>
                        </>) 
                        : 
                        (<>                                
                            <h3>Iniciar sesión</h3>
                            <p>Si ya cuentas con una cuenta registrada inicia sesión:</p>
                            <GoogleLogin
                                onSuccess={credentialResponse => {
                                    const data_post = {
                                        credential: credentialResponse.credential
                                        };
                                    fetch(api_url+'/auth/Google', {
                                        method: 'POST',
                                        credentials: 'include',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(data_post)
                                        })
                                        .then(response => response.json())
                                        .then(data => {
                                            setCookie('accessToken',data.access_token);
                                            if(user.accessToken!==data.access_token){
                                                const user={
                                                    UUID: null,
                                                    sobrenombre: null,
                                                    accessToken: data.access_token,
                                                    expiresIn: data.expires_in,
                                                    image: null
                                                }
                                                dispatch(updateUser(user)); 
                                            }
                                        })
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
                        </>)}
                    </div>                        
                </div>
            </section>
        </>
    )
}

export default Login
