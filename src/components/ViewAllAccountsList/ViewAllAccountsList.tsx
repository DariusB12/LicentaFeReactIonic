import React from 'react';
import {IonContent, IonList} from "@ionic/react";
import {AccountDTO} from "../../assets/entities/AccountDTO";
import {getLogger} from "../../assets";
import './ViewAllAccountsList.css'
import ViewAllAccountsListItem from "./ViewAllAccountsListItem/ViewAllAccountsListItem";

export interface AccountsListProps {
    accounts: AccountDTO[]
}

const log = getLogger('ViewAllAccountsList');


const ViewAllAccountsList: React.FC<AccountsListProps> = ({accounts}) => {
    log('render')
    return (
        <div className="view-all-accounts-list-container-content">
            <IonContent className="unstyled-ion-content">
                <div className="view-all-accounts-list-container-list custom-scroll-area">
                    <IonList className="unstyled-ion-list">
                        {accounts.map((account) =>
                            <ViewAllAccountsListItem key={account.id} account={account} />
                        )}
                    </IonList>
                </div>
            </IonContent>
        </div>
    );
};

export default ViewAllAccountsList;