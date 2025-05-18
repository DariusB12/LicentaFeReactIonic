import React, {useCallback, useContext} from 'react';
import "./ExpiredSessionPopUp.css"
import {getLogger, handleRedirect} from "../../assets";
import {useHistory} from "react-router";
import {AuthContext} from "../../providers/AuthProvider/AuthContext";

const log = getLogger('ExpiredSessionPopUp');


const ExpiredSessionPopUp = () => {
    log('render')
    const {logout,setTokenExpired,clearAuthenticationError} = useContext(AuthContext);
    const history = useHistory();

    const handleLogInOnClick = useCallback(async () => {
        log('log in clicked')
        await logout?.(); // first logout the user (delete local storage stored token)
        log('logout successfully')
        setTokenExpired?.(false)
        clearAuthenticationError?.() // CLEAR THE ERROR STATE FROM AUTH CONTEXT SO THAT NO ERROR STATE REMAINS TRUE
        handleRedirect('/login',history)
    }, [logout, history,setTokenExpired,clearAuthenticationError]);

    return (
        <div className="expired-session-popup-container">
            <div className="expired-session-popup-content">
                <div className="expired-session-popup-header roboto-style">
                    Your session has expired
                </div>
                <div className="expired-session-popup-message roboto-style">
                    Please log in again
                </div>
                <div className="expired-session-popup-close-button-container">
                    <button onClick={handleLogInOnClick} className="expired-session-popup-close-button grey-button roboto-style">Log In</button>
                </div>
            </div>
        </div>
    );
};

export default ExpiredSessionPopUp;
