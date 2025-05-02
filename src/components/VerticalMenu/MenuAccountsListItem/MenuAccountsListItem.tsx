import React from 'react';
import {IonItem} from "@ionic/react";
import './MenuAccountsListItem.css'
import {AccountDTO} from "../../../assets/entities/AccountDTO";

interface MenuAccountsListItemProps {
    account: AccountDTO;
}

const MenuAccountsListItem: React.FC<MenuAccountsListItemProps> = ({account}) => {
    return (
        <IonItem className="unstyled-ion-item roboto-style">
            <div className="accounts-list-item-container">
                {account.profile_photo ?
                    <img
                        src={`data:image/jpeg;base64,${account.profile_photo}`}
                        alt="profile_img"
                        className="accounts-list-item-profile-image"
                    /> :
                    <img
                        src="/icons/anonim_image.png"
                        alt="anonim_image"
                        className="accounts-list-item-profile-image"
                    />
                }
                <div className="accounts-list-item-username">{account.username}</div>
            </div>
        </IonItem>
    );
};

export default MenuAccountsListItem;
