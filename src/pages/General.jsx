import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectNewYear, setInpc, setSearchParams, setEstados, setApi_url, updateUser } from '../parametersSlice'
import config_param from '../../config/config'
import { useCookies } from 'react-cookie'

function General({breadcrumb, ocultarDeflactor, redirectLogin}) {
    const dispatch = useDispatch();
    const api_url=useSelector(state => state.parameters.api_url)
    const [urlVariables,setUrlVariables] = useSearchParams();
    const [cookies, setCookie, removeCookie] = useCookies(['jwt'])
    const user = useSelector(state => state.parameters.user);

    // Poner el valor a los parámetros
    useEffect(() => {
        dispatch(setApi_url(config_param.api_url));
      },[]);

    // valores del INPC de la API
    useEffect(() => {
      if(api_url){
          // obtener versiones de los datasets
          fetch(api_url+'/Datos')
          .then(response => response.json())
          .then(data => {
              // obtener la versión actual del dataset INPC
              let datsetINPC = data.filter((dataset) => {
                  return dataset.dataset == "/INPC"
              })
              let versionINPC = datsetINPC.version || 0;                
              if(versionINPC!==parseInt(localStorage.getItem("versionINPC"))){
                  // obtener la versión actualizada del dataset INPC
                  fetch(api_url+'/INPC')
                      .then(response => response.json())
                      .then(data => {
                          dispatch(setInpc(data));
                          localStorage.setItem('INPC', JSON.stringify(data));
                          localStorage.setItem('versionINPC', versionINPC);
                      })
                      .catch(error => {
                          console.error(error);
                      });
              }else{
                  // utilizar el INPC del localStorage
                  dispatch(setInpc(JSON.parse(localStorage.getItem('INPC'))));
              }
          })
      }
    }, [api_url]);

    // Obtener el listado de estados de la API si es que no está en localStorage
    useEffect(() => {
      if(api_url){
          var estadosLocal=localStorage.getItem('estados');
          if(estadosLocal){
              dispatch(setEstados(JSON.parse(estadosLocal)));
          }else{
              fetch(api_url+'/Estados')
              .then(response => response.json())
              .then(data => {
                  localStorage.setItem('estados',JSON.stringify(data));
                  dispatch(setEstados(data));
              })
              .catch(error => {
                  console.error(error);
              });
          }
      }
    },[api_url]);

    // Obtener la variable del selectedYear de la URL
    useEffect(() => {
      if(urlVariables.get('i')){
          dispatch(setSearchParams({i: urlVariables.get('i')})) 
          dispatch(selectNewYear(urlVariables.get('i')))
      }
    },[]);

    // Obtener el access token de las cookies
    useEffect( () => {
      if(cookies){
        /* Falta el expires in */
        if(user.accessToken!==cookies.accessToken){
          const user={
            UUID: null,
            sobrenombre: null,
            accessToken: cookies.accessToken,
            expiresIn: null,
            image: null,
            init: true
          }
          dispatch(updateUser(user)); 
        }
      }
  },[cookies])

  // actualizar los datos del usuario
  useEffect(() => {
    if(api_url && user.accessToken){
      if(!user.UUID){
        let token=user.accessToken;
        fetch(api_url+'/User',{headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'

        }})
        .then(response => {
          let data={
            UUID: null,
            Sobrenombre: null,
            Image: null,
          }
          if(response.ok){
            data=response.json();
          }else{
            // La sesión caducó
            token=null;
            setCookie('accessToken',null);
            removeCookie('accessToken');
            if(redirectLogin){
              window.location.href='/login';
            }
          }
          return data;
        })
        .then( data => {
          const newUser={...user,
            UUID: data.UUID,
            sobrenombre: data.Sobrenombre,
            image: data.Image,
            init: true
          }
          dispatch(updateUser(newUser)); 
        })
      }
    }
  } ,[api_url,user])
}

export default General