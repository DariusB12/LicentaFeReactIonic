import React from 'react';
import {IonContent, IonList} from "@ionic/react";
import {getLogger} from "../../../assets";
import {AccountDTO} from "../../../assets/entities/AccountDTO";
import MenuAccountsListItem from "../MenuAccountsListItem/MenuAccountsListItem";
import './MenuAccountsList.css'

export interface AccountsListProps {
    accounts: AccountDTO[]
}

const log = getLogger('MenuAccountsList');


const MenuAccountsList: React.FC<AccountsListProps> = ({accounts}) => {
    log('render')
    return (
        <div className="accounts-list-container-content">
            <IonContent className="unstyled-ion-content">
                <div className="accounts-list-container-list custom-scroll-area">
                    <IonList className="unstyled-ion-list">
                        {accounts.map(({id, username, profile_photo}) =>
                            <MenuAccountsListItem key={id} _id={id} username={username} profile_photo={profile_photo}/>
                        )}
                    </IonList>
                </div>
            </IonContent>
        </div>
    );
};

export default MenuAccountsList;