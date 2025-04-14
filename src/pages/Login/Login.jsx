import { useSelector, useDispatch } from 'react-redux';
import { addToast, setPage } from '../../parametersSlice';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css'
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';
import { useEffect } from 'react';

function Login() {
    const user = useSelector(state => state.parameters.user);
    
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/profile";
    const page = useSelector(state => state.parameters.page);

    const dispatch = useDispatch();

    useEffect(() => {
        const datosPage={
            ...page,
            breadcrumb: [{
                texto: "Iniciar sesión"
            }],
            ocultarDeflactor: true
          }
          dispatch(setPage(datosPage));
    },[])

    const handleCredentialResponse = async (credentialResponse) => {
        try{
            const response = await axios.post('/auth/Google',
                JSON.stringify({ credential: credentialResponse}),
                { withCredentials: true });

            const accessToken = response?.data?.access_token;
            
            setAuth({ accessToken });
            navigate(from, { replace: true })
        } 
        catch (error) {
            if(!error?.response){
                dispatch(addToast({texto: 'Error de red'}))
            }else if(error.response?.status===400){
                dispatch(addToast({texto: 'Error de credenciales'}))
            }else{
                dispatch(addToast({texto: 'Error al iniciar sesión'}))
            }
        }  
    }
    
    return (
        <>
            <script src="https://accounts.google.com/gsi/client" async></script>
            <section className='container' id='workspace'>
                <div className='row'>
                    <div className='col-xs-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4'>
                        { user.UUID ? 
                        (<>
                            <p>¡Hola {user.sobrenombre}!</p>
                            <p><Link className='btn btn-primary' to='/Cuadernos'>Ir a mis cuadernos</Link></p>
                            <p>Si quieres iniciar sesión con otra cuenta, primero cierra tu sesión actual dando clic sobre tu nombre en el menú superior.</p>
                        </>) 
                        : 
                        (<>                                
                            <h3>Iniciar sesión</h3>
                            <p>Si ya cuentas con una cuenta registrada inicia sesión:</p>
                            <GoogleLogin
                                onSuccess={credentialResponse => {
                                    handleCredentialResponse(credentialResponse);
                                }}
                                onError={() => {
                                    dispatch(addToast({texto: 'Error al iniciar sesión en Google'}))
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
