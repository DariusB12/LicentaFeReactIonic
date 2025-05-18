import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {IonPage} from "@ionic/react";
import './Register.css'
import {AuthContext} from "../../providers/AuthProvider/AuthContext";
import CirclesLoading from "../../components/CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../../components/CustomInfoAlert/CustomInfoAlert";

const log = getLogger('Register');


export const Register: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    const {
        isAuthenticating,
        register,
        isRegistered,
        clearIsRegistered,
        isAuthenticated,
        authenticationError,
        clearAuthenticationError,
    } = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [retypedPassword, setRetypedPassword] = useState('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [showAlertSuccessRegister, setShowAlertSuccessRegister] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    // FOR PAGE FADE OUT TRANSITION
    const [transitionClass, setTransitionClass] = useState('page-transition');
    // FUNCTION FOR REDIRECTIONS
    const handleRedirect = useCallback((path: string) => {
        // Add exit class
        setTransitionClass('page-transition-exit');

        if (history.location.pathname !== path) {
            history.push(path);
        }
    },[history]);

    const handleOnClickHome = useCallback(async () => {
        log('redirecting to Home page');
        // history.push('/home')
        handleRedirect('/home')
    }, [handleRedirect]);

    const handleOnClickLogin = useCallback(async () => {
        log('redirecting to Login page');
        // history.push('/login')
        handleRedirect('/login')
    }, [handleRedirect]);

    const handleOnClickRegister = useCallback(async () => {
        log('trying to register');
        //VALIDATE THE INPUT
        if (username == '' || username.length < 3) {
            setErrorMessage("Username cannot be empty and must be at least 3 characters in length")
            setShowAlert(true)
        } else if (password != retypedPassword) {
            setErrorMessage("Passwords do not match")
            setShowAlert(true)
            setPassword('');
            setRetypedPassword('');
        } else if (password == '' || password.length < 3) {
            setErrorMessage("Password cannot be empty and must be at least 3 characters in length")
            setShowAlert(true)
            setPassword('');
            setRetypedPassword('');
        } else {
            await register?.(username, password);
        }

    }, [register, username, password, retypedPassword]);

    useEffect(() => {
        if (authenticationError) {
            log('error trying to register', authenticationError.message);

            if (authenticationError.status_code === 409) {
                setErrorMessage('Username already taken');
            } else if (authenticationError.status_code === 422) {
                setErrorMessage('Invalid username or passwords');
            } else {
                setErrorMessage('Network Error');
            }
            setShowAlert(true);
            setPassword('');
            setRetypedPassword('');
        }
        if (isRegistered) {
            log('registered successfully');
            setShowAlertSuccessRegister(true)
        }
    }, [isRegistered, authenticationError, isAuthenticated, isAuthenticated]);

    return (
        <IonPage className={`register-main-container ${transitionClass}`}>

            <div className="register-home-button-bar">
                <button className="register-home-button blue-button roboto-style" onClick={handleOnClickHome}>Home <img
                    src="/icons/home.png"
                    alt="home_img"
                    className="register-home-img icon-size"/>
                </button>
            </div>

            <div className="register-top-titles">
                <div className="register-top-titles-up kaushan-script-style">
                    SocialMind
                </div>
                <div className="register-top-titles-down roboto-style">
                    - Register -
                </div>
            </div>

            <div className="register-content-container">
                <div className="register-content-container-inputs">
                    <input type={"text"} className="register-input input-reset roboto-style"
                           placeholder={"username"}
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}/>
                    <input type={"password"} className="register-input input-reset roboto-style"
                           placeholder={"password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}/>
                    <input type={"password"} className="register-input input-reset roboto-style"
                           placeholder={"retype password"}
                           value={retypedPassword}
                           onChange={(e) => setRetypedPassword(e.target.value)}/>
                </div>
                <button className="blue-button roboto-style" onClick={handleOnClickRegister}>Register</button>

                <hr className="register-divider"/>

                <div className="register-content-register-text roboto-style">
                    Already have an account? <button onClick={handleOnClickLogin}
                                                     className="register-login-button roboto-style">login</button>
                </div>
            </div>
            <CirclesLoading
                isOpen={isAuthenticating}
                message="Register..."
            />
            <CustomInfoAlert
                isOpen={showAlert}
                // isOpen={true}
                header={"Register Failed"}
                message={errorMessage}
                onDismiss={() => {
                    setShowAlert(false)
                    clearAuthenticationError?.().then(() => {
                    })
                }}/>
            <CustomInfoAlert
                isOpen={showAlertSuccessRegister}
                // isOpen={true}
                header={"Registered Successfully"}
                message={"Your account has been created"}
                onDismiss={() => {
                    setShowAlertSuccessRegister(false)
                    clearIsRegistered?.().then(() => {
                    })
                    // history.push('/login');
                    handleRedirect('/login')
                }}/>
        </IonPage>
    )
};
