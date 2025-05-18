import {IonPage} from '@ionic/react';
import {RouteComponentProps} from "react-router";
import InstaIconsBar from "../../components/InstaIconsBar/InstaIconsBar";
import React, {useCallback, useState} from 'react';
import './Home.css'
import '../../assets/TextStyles.css';
import InstaCarousel from "../../components/InstaCarousel/InstaCarousel";
import {getLogger} from "../../assets";

const log = getLogger('Home');


const Home: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
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

    const handleLogin = useCallback(async () => {
        log('redirecting to Login page');
        // history.push('/login')
        handleRedirect('/login')
    }, [handleRedirect]);
    const handleRegister = useCallback(async () => {
        log('redirecting to Register page');
        // history.push('/register')
        handleRedirect('/register')
    }, [handleRedirect]);

    return (
        <IonPage className={`home-main-container ${transitionClass}`}>
            {/* Top Header Title+Subtitle */}
            <div className="home-top-bar-container">
                <div className="home-top-bar-container-up kaushan-script-style">
                    SocialMind
                </div>
                <div className="home-top-bar-container-down roboto-style">
                    - Home -
                </div>
            </div>

            <div className="home-middle-container">
                <div className="home-split-container-top roboto-style">
                    <p>Discover the hidden side of Instagram profiles</p>
                    <img src="/images/insta_frame/insta%20frame%20top.png" alt="insta_frame_top"
                         className="home-insta-frame"/>
                </div>
                <InstaCarousel/>
                <div className="home-split-container-bottom">
                    <img src="/images/insta_frame/insta%20frame%20bottom.png" alt="insta_frame_bottom"
                         className="home-insta-frame"/>
                </div>
            </div>
            <div className="home-bottom-bar-buttons roboto-style">
                <button onClick={handleLogin} className="blue-button roboto-style">Login</button>
                <p>or</p>
                <button onClick={handleRegister} className="blue-button roboto-style">Register</button>
            </div>

            <InstaIconsBar/>
        </IonPage>
    );
};

export default Home;
