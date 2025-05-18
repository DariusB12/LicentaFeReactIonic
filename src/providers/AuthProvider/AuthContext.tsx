import React from "react";

export type LoginFn = (username: string, password: string) => Promise<void>;
export type RegisterFn = (username: string, password: string) => Promise<void>;
export type LogoutFn = () => Promise<void>;
export type ClearAuthenticationErrorFn = () => Promise<void>;
export type ClearIsRegisteredFn = () => Promise<void>;
export type DeleteAccountFn = (username: string, password: string) => Promise<void>;
export type SetTokenExpiredFn = (val:boolean) => Promise<void>;

export interface ErrorResponse {
    status_code: number,
    message: string
}

export interface AuthState {
    isAuthenticated: boolean;
    isRegistered:boolean;
    login?: LoginFn;
    register?: RegisterFn;
    logout?: LogoutFn;
    deleteAccount?: DeleteAccountFn;
    isDeletingAccount: boolean;
    username: string | null;
    token: string | null;
    authenticationError: ErrorResponse | null;
    clearAuthenticationError?: ClearAuthenticationErrorFn;
    clearIsRegistered?: ClearIsRegisteredFn;
    isAuthenticating: boolean;
    isAuthResolved: boolean;

    setTokenExpired?: SetTokenExpiredFn;
    tokenExpired: boolean;
}

export const initialState: AuthState = {
    isAuthenticating: false,
    isDeletingAccount: false,
    isRegistered:false,
    token: '',
    username: '',
    isAuthenticated: false,
    authenticationError: null,
    isAuthResolved: false,
    tokenExpired: false
};

export const AuthContext = React.createContext<AuthState>(initialState);
