import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";

import { useSelector, useDispatch } from 'react-redux';
import { updateUser, logoutUser } from '../parametersSlice';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth();
    const dispatch = useDispatch();
    const user = useSelector(state => state.parameters.user);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try{
                await refresh();
            }
            catch(err){
                console.log(err);
            }
            finally {
                setIsLoading(false);
            }
        }
        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);
    },[]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosPrivate.get('/User');
                for (const [key, value] of Object.entries(response.data)) {
                    if(value===null){
                        response.data[key]='';
                    }
                }
                dispatch(updateUser({
                    UUID: response.data.UUID,
                    sobrenombre: response.data.Sobrenombre,
                    image: response.data.Image
                }))
            } catch (err) {
                console.log(err);
                dispatch(logoutUser());
            }
        };
        
        !isLoading && auth?.accessToken && !user.UUID ? fetchUserData() : null ;
    },[isLoading])
    
    return(
        <>
        {isLoading
            ? <p>Loading...</p>
            : <Outlet />}
        </>
    )
}

export default PersistLogin;