import axios from 'axios';
import {baseUrl, config, withLogs} from "../../assets";

const authUrl = `http://${baseUrl}/auth`;

export interface AuthProps {
  message:string,
  status_code:bigint,
  token: string,
}

export const loginApi: (username: string, password: string) => Promise<AuthProps> = (username, password) => {
  return withLogs(axios.post(`${authUrl}/login`, { username, password }, config), 'login');
}

export const registerApi: (username: string, password: string) => Promise<AuthProps> = (username, password) => {
  return withLogs(axios.post(`${authUrl}/signup`, { username, password }, config), 'register');
}
