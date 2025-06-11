import React from 'react';
import {IonContent, IonList} from "@ionic/react";
import {getLogger} from "../../../assets";
import {SocialAccountDTOUrl} from "../../../assets/entities/SocialAccountDTOUrl";
import MenuAccountsListItem from "../MenuAccountsListItem/MenuAccountsListItem";
import './MenuAccountsList.css'

export interface AccountsListProps {
    accounts: SocialAccountDTOUrl[]
    onClick: (account_id: number) => void
}

const log = getLogger('MenuAccountsList');


const MenuAccountsList: React.FC<AccountsListProps> = ({accounts, onClick}) => {
    log('render')
    return (
        <div className="accounts-list-container-content">
            <IonContent className="unstyled-ion-content">
                <div className="accounts-list-container-list custom-scroll-area">
                    <IonList className="unstyled-ion-list">
                        {accounts.map((account) =>
                                <MenuAccountsListItem key={account.id} account={account} onClick={onClick}/>
                        )}
                    </IonList>
                </div>
            </IonContent>
        </div>
    );
};

export default MenuAccountsList;