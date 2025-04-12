import axios from "../api/axios";
import useAuth from "./useAuth";
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../parametersSlice';

const useLogout = () => {
    const { setAuth } = useAuth(); 
    const dispatch = useDispatch();
    const user = useSelector(state => state.parameters.user);

    const logout = async () => {
        setAuth({});
        try{
            const response = await axios('/auth/logout', {
                withCredentials: true
            });
            dispatch(logoutUser());
        }
        catch (err){
            console.log(err)
        }
    }

    return logout;
}

export default useLogout;