import React, {useContext} from 'react';
import {Redirect, Route} from 'react-router-dom';
import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import {AuthContext, AuthState} from "../../providers/AuthProvider/AuthContext";


const log = getLogger('PrivateRoute');

export interface PrivateRouteProps {
    component: React.ComponentType<RouteComponentProps>;
    path: string;
    exact?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({component: Component, ...rest}) => {
    const {isAuthenticated, isAuthResolved} = useContext<AuthState>(AuthContext);
    log('render, isAuthenticated', isAuthenticated);
    log('render, isAuthResolved', isAuthResolved);

    if (!isAuthResolved) {
        return null; // or show a loading spinner
    }

    return (
        //PRIVATE ROUTE - IF IS NOT AUTHENTICATED THEN ALL THE PRIVATE ROUTES WILL REDIRECT TO HOME
        <Route {...rest} render={props => {
            if (isAuthenticated) {
                return <Component {...props} />;
            }
            log('redirect to home');
            return <Redirect to={{pathname: '/home'}}/>
        }}/>
    );
}
