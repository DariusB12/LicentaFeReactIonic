import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React from "react";
import {IonPage} from "@ionic/react";
import './About.css'
import VerticalMenu from "../../components/VerticalMenu/VerticalMenu";

const log = getLogger('About');


export const About: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    return (
        <IonPage className="about-main-container">
            <VerticalMenu/>
            <div className="about-content-container">
                <div className="about-container-texts">
                    <div className="about-content-title roboto-style">
                        About the app
                    </div>
                    <div className="about-content-description roboto-style">
                        <p>With SocialMind, you can input people's Instagram posts to analyze their personality
                            traits.</p>
                        <p>For greater accuracy, fill in all the available fields when adding a post, and all the
                            account details when creating it.</p>
                    </div>
                </div>
            </div>
        </IonPage>

    )
};
