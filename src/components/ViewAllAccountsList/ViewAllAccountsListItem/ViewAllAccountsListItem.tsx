import React from 'react';
import {IonItem} from "@ionic/react";
import './ViewAllAccountsListItem.css'
import {SocialAccountDTOUrl} from "../../../assets/entities/SocialAccountDTOUrl";
import {formatNumber} from "../../../assets";

interface ViewAllAccountsListItemProps {
    account: SocialAccountDTOUrl
    onClickDelete: (account_id:number) =>void
    onClick: (account_id: number) => void
}

const ViewAllAccountsListItem: React.FC<ViewAllAccountsListItemProps> = ({account,onClickDelete,onClick}) => {

    return (
        <IonItem className="unstyled-ion-item roboto-style" onClick={() => onClick(account.id)}>
                <div className="view-all-accounts-list-item-container">
                    {account.profile_photo_url ?
                        <img
                            src={account.profile_photo_url}
                            alt="profile_img"
                            className="view-all-accounts-list-item-profile-image"
                        /> :
                        <img
                            src="/icons/anonim_image.png"
                            alt="anonim_image"
                            className="view-all-accounts-list-item-profile-image"
                        />
                    }
                    <div className="view-all-accounts-list-item-user-details">
                        <div className="view-all-accounts-list-item-username roboto-style">
                            {account.username}
                        </div>
                        <div className="view-all-accounts-list-item-details">
                            <div className="view-all-accounts-list-item-details-posts roboto-style">
                                {formatNumber(account.no_of_posts)}
                                <div style={{color: "#8c8c8c"}}>posts</div>
                            </div>
                            <div className="view-all-accounts-list-item-details-followers roboto-style">
                                {formatNumber(account.no_followers)}
                                <div style={{color: "#8c8c8c"}}>followers</div>
                            </div>
                            <div className="view-all-accounts-list-item-details-following roboto-style">
                                {formatNumber(account.no_following)}
                                <div style={{color: "#8c8c8c"}}>following</div>
                            </div>
                        </div>

                    </div>
                    <div className="view-all-accounts-list-empty-div">

                    </div>
                    <div className="view-all-accounts-list-analised roboto-style">
                        {account.analysed ? (
                            <div className="view-all-accounts-list-analised-true roboto-style">
                                <div className="view-all-accounts-list-analised-true-text"> analysed</div>
                                <img src="/icons/tick.png" alt="tick_img"
                                     className="view-all-accounts-list-analised-tick icon-size"/>
                            </div>
                        ) : (
                            <div className="view-all-accounts-list-analised-false roboto-style">
                                <div className="view-all-accounts-list-analised-false-text">unanalysed</div>
                                <img src="/icons/cancel.png" alt="cancel_img"
                                     className="view-all-accounts-list-analised-cancel icon-size"/>
                            </div>
                        )}
                    </div>
                    <div className="view-all-accounts-list-delete-profile roboto-style">
                        <button className="view-all-accounts-list-delete-profile-button roboto-style"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClickDelete(account.id)
                                }}>
                            <div className="view-all-accounts-list-delete-profile-text">delete profile</div>
                            <img src="/icons/delete.png" alt="delete_img"
                                 className="view-all-accounts-list-delete-profile-icon icon-size"/>
                        </button>
                    </div>
                </div>
        </IonItem>
);
};

export default ViewAllAccountsListItem;
