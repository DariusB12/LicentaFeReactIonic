import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React from "react";
import {IonPage} from "@ionic/react";
import './About.css'
import VerticalMenu from "../../components/VerticalMenu/VerticalMenu";

const log = getLogger('About');


export const About: React.FC<RouteComponentProps> = ({history}) => {
    log('render')

    return (<IonPage id="main">
            <VerticalMenu></VerticalMenu>
    </IonPage>

    )
};
