import React, {useCallback, useContext, useEffect, useState} from 'react';
import "./DeleteAccountAlert.css"
import {getLogger} from "../../../assets";
import {AuthContext} from "../../../providers/AuthProvider/AuthContext";
import {IonSpinner} from "@ionic/react";
import {useHistory} from "react-router";
import CustomInfoAlert from "../../CustomInfoAlert/CustomInfoAlert";

interface DeleteAccountAlertProps {
    isOpen: boolean,
    header: string,
    message: string,
    closeAlert: () => void // should be a function to close the alert
}

const log = getLogger('VerticalMenu');

const DeleteAccountAlert: React.FC<DeleteAccountAlertProps> = ({isOpen, header, message, closeAlert}) => {
    log('render')
    const {
        isDeletingAccount,
        deleteAccount,
        username,
        authenticationError,
        clearAuthenticationError,
        logout,
        setTokenExpired,
        tokenExpired
    } = useContext(AuthContext);
    const history = useHistory();
    const [password, setPassword] = useState('');
    const [showAlertError, setShowAlertError] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleOnClickDeleteAccount = useCallback(async () => {
        log('delete account clicked')
        if (username)
            await deleteAccount?.(username, password);

        setShowSuccess(true)
    }, [deleteAccount, username, password]);

    useEffect(() => {
        //IF IS NOT WHILE DELETING THE ACCOUNT AND AN ERROR OCCURED THEN SHOW THE ERROR WITH ONLY A BUTTON FOR CLOSING THE ALERT
        if (!isDeletingAccount && authenticationError) {
            log('error trying delete account', authenticationError.message);
            if (authenticationError.status_code === 400) {
                setErrorMessage('Invalid credentials');
            } else if(authenticationError.status_code === 403){
                log('authentication code ========403')
                // 403 means that the server indicated an expired token
                setTokenExpired?.(true)
                // RESET ALL THE VALUES OF THIS COMPONENT, BECAUSE IF THE TOKEN IS EXPIRED
                // THEN THE EXPIRED TOKEN ALERT WILL POPUP
                setShowAlertError(false)
                setShowSuccess(false)
                closeAlert() // should be a function to close the alert
                clearAuthenticationError?.() //clear the error state
            } else {
                setErrorMessage('Network Error');
            }
            setShowAlertError(true);
            setPassword('');
        }
    }, [closeAlert,authenticationError,isDeletingAccount,setTokenExpired,clearAuthenticationError]);


    if (!isOpen) return null;

    return (
        <div className="delete-account-alert-container">
            <div className="delete-account-alert-content">
                {!isDeletingAccount && !showAlertError && !showSuccess && <>
                    <div className="delete-account-alert-header roboto-style">
                        {header}
                    </div>
                    <div className="delete-account-alert-message roboto-style">
                        {message}
                    </div>
                    <input type="password" className="delete-account-alert-input input-reset"
                           onChange={(e) => setPassword(e.target.value)}/>

                    <div className="delete-account-alert-close-button-container">
                        <button onClick={handleOnClickDeleteAccount}
                                className="delete-account-alert-close-button grey-button roboto-style">Delete
                        </button>
                        <button onClick={()=>{closeAlert()}}
                                className="delete-account-alert-close-button grey-button roboto-style">Cancel
                        </button>
                    </div>
                </>
                }
                {isDeletingAccount && <>
                    <IonSpinner name="circles" color="secondary"></IonSpinner>
                </>
                }
                {showAlertError &&
                    <>
                        <div className="delete-account-alert-header-error roboto-style">
                            Error
                        </div>
                        <div className="delete-account-alert-message roboto-style">
                            {errorMessage}
                        </div>
                        <div className="delete-account-alert-close-button-container">
                            <button onClick={()=>{
                                setShowAlertError(false)
                                setShowSuccess(false)
                                closeAlert() // should be a function to close the alert
                                clearAuthenticationError?.() //clear the error state
                            }}
                                    className="delete-account-alert-close-button grey-button roboto-style">Close
                            </button>
                        </div>
                    </>
                }
                {showSuccess && !showAlertError && !tokenExpired &&
                    <>
                        <div className="delete-account-alert-header-success roboto-style">
                            Account Deleted
                        </div>
                        <div className="delete-account-alert-message roboto-style">
                            Your account has been deleted successfully
                        </div>
                        <div className="delete-account-alert-close-button-container">
                            <button onClick={() => {
                                setShowSuccess(false)
                                setShowAlertError(false)
                                clearAuthenticationError?.()
                                logout?.()
                                closeAlert() // should be a function to close the alert
                                if (history.location.pathname !== '/home') {
                                history.push('/home')
                                }
                            }}
                                    className="delete-account-alert-close-button grey-button roboto-style">Go Home
                            </button>
                        </div>
                    </>
                }
            </div>
        </div>
    );
};

export default DeleteAccountAlert;
