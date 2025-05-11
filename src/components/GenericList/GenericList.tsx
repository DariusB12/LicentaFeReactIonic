import React from 'react';
import {IonContent, IonList} from "@ionic/react";
import {getLogger} from "../../assets";
import './GenericList.css'

export interface GenericListProps {
    items:React.ReactNode;
    className?:string;
}

const log = getLogger('AccountDetailsList');


const GenericList: React.FC<GenericListProps> = ({items,className}) => {
    log('render')
    return (

            <IonContent className="unstyled-ion-content">
                <div className={`generic-list-container-list ${className} custom-scroll-area`}>
                    <IonList className="unstyled-ion-list">
                        {items}
                    </IonList>
                </div>
            </IonContent>
    );
};

export default GenericList;