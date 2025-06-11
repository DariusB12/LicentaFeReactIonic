import React from 'react';
import {IonItem} from "@ionic/react";
import './MenuAccountsListItem.css'
import {SocialAccountDTOUrl} from "../../../assets/entities/SocialAccountDTOUrl";

interface MenuAccountsListItemProps {
    account: SocialAccountDTOUrl;
    onClick: (account_id:number) => void
}

const MenuAccountsListItem: React.FC<MenuAccountsListItemProps> = ({account, onClick}) => {

    return (
        <IonItem className="unstyled-ion-item roboto-style" onClick={()=>onClick(account.id)}>
            <div className="accounts-list-item-container">
                {account.profile_photo_url ?
                    <img
                        src={account.profile_photo_url}
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
