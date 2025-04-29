import {IonPage} from '@ionic/react';
import {RouteComponentProps} from "react-router";
import InstaIconsBar from "../../components/InstaIconsBar/InstaIconsBar";
import React from 'react';
import './Home.css'
import '../../assets/TextStyles.css';
import InstaCarousel from "../../components/InstaCarousel/InstaCarousel";


//TODO: de sters comment-ul asta (history unused reference)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Home: React.FC<RouteComponentProps> = ({ history }) => {
  return (
      <IonPage className="main-container">
          {/* Top Header Title+Subtitle */}
          <div className="top-bar-container">
              <div className="top-bar-container-up kaushan-script-style">
                  SocialMind
              </div>
              <div className="top-bar-container-down roboto-style">
                  - Home -
              </div>
          </div>

          <div className="middle-container">
              <div className="split-container-top roboto-style">
                  <p>Discover the hidden side of Instagram profiles</p>
                  <img src="/images/insta_frame/insta%20frame%20top.png" alt="insta_frame_top" className="insta-frame"/>
              </div>
              <InstaCarousel/>
              <div className="split-container-bottom">
                  <img src="/images/insta_frame/insta%20frame%20bottom.png" alt="insta_frame_bottom" className="insta-frame"/>
              </div>
          </div>
          <div className="bottom-bar-buttons roboto-style">
            <button className="bottom-bar-button roboto-style">Login</button>
              <p>or</p>
              <button className="bottom-bar-button roboto-style">Register</button>
          </div>

          <InstaIconsBar/>
      </IonPage>
  );
};

export default Home;
