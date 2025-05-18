import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from "../../assets";
import {Preferences} from '@capacitor/preferences';
import {deleteApi, loginApi, registerApi} from "../../services/auth/authApi";
import {
    AuthContext,
    AuthState,
    ClearAuthenticationErrorFn,
    ClearIsRegisteredFn, DeleteAccountFn,
    initialState,
    LoginFn,
    LogoutFn,
    RegisterFn,
    SetTokenExpiredFn
} from "./AuthContext";
import axios from "axios";

const log = getLogger('AuthProvider');

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [state, setState] = useState<AuthState>(initialState);
    const {username, isAuthenticated,isDeletingAccount, isAuthenticating,isRegistered, authenticationError, token, isAuthResolved, tokenExpired} = state;

    //FUNCTIONS
    const login = useCallback<LoginFn>(loginCallback, []);
    const register = useCallback<RegisterFn>(registerCallback, []);
    const setTokenExpired = useCallback<SetTokenExpiredFn>(setTokenExpiredCallback, []);
    const clearAuthenticationError = useCallback<ClearAuthenticationErrorFn>(clearAuthenticationErrorCallback, [])
    const clearIsRegistered = useCallback<ClearIsRegisteredFn>(clearIsRegisteredCallback, [])
    const deleteAccount = useCallback<DeleteAccountFn>(deleteAccountCallback, [token])
    const logout = useCallback<LogoutFn>(logoutCallback, []);

    useEffect(() => {
        loadToken().then(() => {});
    }, []);


    const value = {
        username,
        isAuthenticated,
        login,
        register,
        logout,
        clearAuthenticationError,
        clearIsRegistered,
        token,
        authenticationError,
        isAuthenticating,
        isAuthResolved,
        isRegistered,
        isDeletingAccount,
        deleteAccount,
        tokenExpired,
        setTokenExpired
    };
    log('render');
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

    async function loadToken() {
        log('checking for token and username')
        const {value: token} = await Preferences.get({key: 'authToken'});
        const {value: username} = await Preferences.get({key: 'username'});

        if (token && username) {
            setState(prev => ({
                ...prev,
                token: token,
                username: username,
                isAuthenticated: true,
                isAuthenticating: false,
                authenticationError: null,
                isAuthResolved: true,
            }));
        }else{
            setState(prev=>({
                ...prev,
                isAuthResolved: true
            }));
        }
    }

    async function setTokenExpiredCallback(val:boolean): Promise<void> {
        log('set token expired');
        setState(prevState => ({
            ...prevState,
            tokenExpired: val
        }))
    }

    async function deleteAccountCallback(username: string, password: string): Promise<void> {
        log('trying to delete account');
        try {
            setState(prev=>({
                ...prev,
                isDeletingAccount: true,
            }));
            await deleteApi(username, password,token);
            setState(prev=>({
                ...prev,
                isDeletingAccount: false,
            }));

        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('delete failed error:', error.response?.data.message);
                setState(prev=>({
                    ...prev,
                    authenticationError: {status_code:error.response?.data.status_code,message:error.response?.data.message},
                    isDeletingAccount: false,
                }));
            } else {
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                setState(prev=> ({
                    ...prev,
                    authenticationError: {status_code:500, message:"Server Error"},
                    isDeletingAccount: false,
                }));
            }
        }
    }
    async function logoutCallback(): Promise<void> {
        log('logout');
        await Preferences.remove({key: 'authToken'});
        await Preferences.remove({key: 'username'});
        setState(initialState)
        setState(prevState => ({
            ...prevState,
            isAuthResolved:true
        }))
    }

    async function loginCallback(username: string, password: string): Promise<void> {
        log('trying to log in');
        try {
            setState(prev=>({
                ...prev,
                isAuthenticating: true,
            }));
            const {token} = await loginApi(username, password);
            await Preferences.set({key: 'authToken', value: token});
            await Preferences.set({key: 'username', value: username});
            setState(prev=>({
                ...prev,
                token: token,
                username: username,
                isAuthenticated: true,
                isAuthenticating: false,
                authenticationError: null,
            }));
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('login failed error:', error.response?.data.message);
                setState(prev=>({
                    ...prev,
                    authenticationError: {status_code:error.response?.data.status_code,message:error.response?.data.message},
                    isAuthenticating: false,
                }));
            } else {
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                setState(prev=> ({
                    ...prev,
                    authenticationError: {status_code:500, message:"Server Error"},
                    isAuthenticating: false,
                }));
            }
        }
    }

    async function registerCallback(username: string, password: string): Promise<void> {
        log('trying to register');
        try {
            setState(prev=>({
                ...prev,
                isAuthenticating: true,
            }));
            await registerApi(username, password);
            setState(prev=>({
                ...prev,
                isAuthenticating: false,
                isRegistered: true,
                authenticationError: null
            }));
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('register failed error:', error.response?.data.message);
                setState(prev=>({
                    ...prev,
                    authenticationError: {status_code:error.response?.data.status_code,message:error.response?.data.message},
                    isAuthenticating: false,
                }));
            } else {
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                setState(prev=> ({
                    ...prev,
                    authenticationError: {status_code:500, message:"Server Error"},
                    isAuthenticating: false,
                }));
            }

        }
    }

    async function clearAuthenticationErrorCallback(): Promise<void> {
        log('clear authenticationErr');
        setState(prev=>({
            ...prev,
            authenticationError: null
        }));
    }

    async function clearIsRegisteredCallback(): Promise<void> {
        log('clear isRegistered');
        setState(prev=>({
            ...prev,
            isRegistered: false
        }));
    }

};
