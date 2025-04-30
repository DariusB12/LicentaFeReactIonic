
import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useCallback} from "react";
import {IonPage} from "@ionic/react";
import './Login.css'

const log = getLogger('Login');


export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    log('render')

    const handleOnClickHome = useCallback(async () => {
        log('redirecting to Home page');
        history.push('/home')
    }, [history]);

    const handleOnClickRegister = useCallback(async () => {
        log('redirecting to Register page');
        history.push('/register')
    }, [history]);

    return (
        <IonPage className="login-main-container">

            <div className="login-home-button-bar">
                <button className="blue-button roboto-style login-home-button" onClick={handleOnClickHome}>Home <img src="/icons/home.png"
                                                                       alt="home_img"
                                                                       className="login-home-img"/>
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
                           placeholder={"username"}/>
                    <input type={"password"} className="login-input input-reset roboto-style"
                           placeholder={"password"}/>
                </div>
                <button className="blue-button roboto-style">Login</button>

                <hr className="login-divider"/>

                <div className="login-content-register-text roboto-style">
                    Don’t have an account? <button onClick={handleOnClickRegister} className="login-register-button roboto-style">register</button>
                </div>
            </div>

        </IonPage>
    )
};
