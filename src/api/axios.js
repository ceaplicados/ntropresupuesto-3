import axios from "axios";
import config_param from '../../config/config'

export default axios.create({
    baseURL: config_param.api_url,
    headers: { 'Content-Type' : 'application/json' }
});

export const axiosPrivate = axios.create({
    baseURL: config_param.api_url,
    headers: { 'Content-Type' : 'application/json' },
    withCredentials: true
});