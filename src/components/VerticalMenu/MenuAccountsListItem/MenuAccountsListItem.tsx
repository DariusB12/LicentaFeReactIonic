import React from 'react';
import {IonItem} from "@ionic/react";
import './MenuAccountsListItem.css'

interface AccountsListItemProps {
    _id: number,
    username: string,
    profile_photo?: string,
}

const MenuAccountsListItem: React.FC<AccountsListItemProps> = ({_id, username, profile_photo}) => {
    return (
        <IonItem className="unstyled-ion-item roboto-style">
            <div className="accounts-list-item-container">
                {profile_photo ?
                    <img
                        src={`data:image/jpeg;base64,${profile_photo}`}
                        alt="profile_img"
                        className="accounts-list-item-profile-image"
                    /> :
                    <img
                        src="/icons/anonim_image.png"
                        alt="anonim_image"
                        className="accounts-list-item-profile-image"
                    />
                }
                <div className="accounts-list-item-username">{username}</div>
            </div>
        </IonItem>
    );
};

export default MenuAccountsListItem;
