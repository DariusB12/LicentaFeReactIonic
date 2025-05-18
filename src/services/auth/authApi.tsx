import axios from 'axios';
import {configToken, baseUrl, configNoToken, withLogs} from "../../assets";

const authUrl = `http://${baseUrl}/auth`;

export interface AuthProps {
    message:string,
    status_code:bigint,
    token: string,
}

export const loginApi: (username: string, password: string) => Promise<AuthProps> = (username, password) => {
    return withLogs(axios.post(`${authUrl}/login`, { username, password }, configNoToken), 'login');
}

export const registerApi: (username: string, password: string) => Promise<AuthProps> = (username, password) => {
    return withLogs(axios.post(`${authUrl}/signup`, { username, password }, configNoToken), 'register');
}

export const deleteApi: (username: string, password: string,token: string|null) => Promise<AuthProps> = (username, password,token) => {
    return withLogs(
        axios.delete(`${authUrl}/delete`, {
            ...configToken(token),
            data: { username, password }
        }),
        'delete'
    );
};