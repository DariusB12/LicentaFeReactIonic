import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useCallback, useContext, useEffect, useState} from "react";
import './Login.css'
import {AuthContext} from "../../providers/AuthProvider/AuthContext";
import CirclesLoading from "../../components/CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../../components/CustomInfoAlert/CustomInfoAlert";
import {IonPage} from "@ionic/react";

const log = getLogger('Login');


export const Login: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    const {
        isAuthenticating,
        login,
        isAuthenticated,
        authenticationError,
        clearAuthenticationError
    } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    // FOR PAGE FADE OUT TRANSITION
    const [transitionClass, setTransitionClass] = useState('page-transition');
    // FUNCTION FOR REDIRECTIONS
    const handleRedirect = useCallback((path: string) => {
        // Add exit class
        setTransitionClass('page-transition-exit');
        history.push(path);
    },[history]);

    const handleOnClickHome = useCallback(async () => {
        log('redirecting to Home page');
        // history.push('/home')
        handleRedirect('/home')
    }, [handleRedirect]);

    const handleOnClickRegister = useCallback(async () => {
        log('redirecting to Register page');
        // history.push('/register')
        handleRedirect('/register')

    }, [handleRedirect]);

    const handleOnClickLogin = useCallback(async () => {
        log('trying to log in');
        await login?.(username, password);

    }, [login, username, password]);

    useEffect(() => {
        if (!isAuthenticated && authenticationError) {
            log('error trying to log in', authenticationError.message);
            if (authenticationError.status_code === 400) {
                setErrorMessage('Invalid credentials');
            } else {
                setErrorMessage('Network Error');
            }
            setShowAlert(true);
            setPassword('');
        }
        if (isAuthenticated) {
            log('log in successfully, redirecting to main page');
            // history.push('/about');
            handleRedirect('/about')
        }
    }, [handleRedirect, authenticationError, isAuthenticated]);

    return (
        <IonPage className={`login-main-container ${transitionClass}`}>

            <div className="login-home-button-bar">
                <button className="blue-button roboto-style login-home-button" onClick={handleOnClickHome}>Home <img
                    src="/icons/home.png"
                    alt="home_img"
                    className="login-home-img icon-size"/>
                </button>
            </div>

            <div className="login-top-titles">
                <div className="login-top-titles-up kaushan-script-style">
                    SocialMind
                </div>
                <div className="login-top-titles-down roboto-style">
                    - Login -
                </div>
            </div>

            <div className="login-content-container">
                <div className="login-content-container-inputs">
                    <input type={"text"} className="login-input input-reset roboto-style"
                           placeholder={"username"}
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                    />
                    <input type={"password"} className="login-input input-reset roboto-style"
                           placeholder={"password"} value={password}
                           onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <button className="blue-button roboto-style" onClick={handleOnClickLogin}>Login</button>

                <hr className="login-divider"/>

                <div className="login-content-register-text roboto-style">
                    Don’t have an account? <button onClick={handleOnClickRegister}
                                                   className="login-register-button roboto-style">register</button>
                </div>

            </div>
            <CirclesLoading
                isOpen={isAuthenticating}
                message="Login..."
            />
            <CustomInfoAlert
                isOpen={showAlert}
                // isOpen={true}
                header={"Login Failed"}
                message={errorMessage}
                onDismiss={() => {
                    clearAuthenticationError?.().then(() => {
                    })
                    setShowAlert(false)
                }}/>
        </IonPage>
    )
};
