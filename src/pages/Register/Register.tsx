
import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useCallback} from "react";
import {IonPage} from "@ionic/react";
import './Register.css'

const log = getLogger('Register');


export const Register: React.FC<RouteComponentProps> = ({ history }) => {
    log('render')
    const handleOnClickHome = useCallback(async () => {
        log('redirecting to Home page');
        history.push('/home')
    }, [history]);

    const handleOnClickLogin  = useCallback(async () => {
        log('redirecting to Login page');
        history.push('/login')
    }, [history]);

    return (
        <IonPage className="register-main-container">

            <div className="register-home-button-bar">
                <button className="register-home-button blue-button roboto-style" onClick={handleOnClickHome}>Home <img src="/icons/home.png"
                                                                                                                     alt="home_img"
                                                                                                                     className="register-home-img"/>
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
                           placeholder={"username"}/>
                    <input type={"password"} className="register-input input-reset roboto-style"
                           placeholder={"password"}/>
                    <input type={"password"} className="register-input input-reset roboto-style"
                           placeholder={"retype password"}/>
                </div>
                <button className="blue-button roboto-style">Register</button>

                <hr className="register-divider"/>

                <div className="register-content-register-text roboto-style">
                    Already have an account? <button onClick={handleOnClickLogin} className="register-login-button roboto-style">login</button>
                </div>
            </div>

        </IonPage>
    )
};
