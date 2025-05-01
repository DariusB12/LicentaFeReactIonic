import React from 'react';
import './VerticalMenu.css';
import {IonContent,  IonMenu, IonSplitPane} from "@ionic/react";

const VerticalMenu: React.FC = () => {
    return (
        <IonSplitPane contentId="main">
            <IonMenu className="vertical-menu-main-box" contentId="main">
                <div >
                        <p>SocialMind</p>
                        <>you: anoni_name</>
                </div>
                <IonContent className="ion-padding">This is the menu content.</IonContent>
            </IonMenu>
        </IonSplitPane>

    );
};

export default VerticalMenu;