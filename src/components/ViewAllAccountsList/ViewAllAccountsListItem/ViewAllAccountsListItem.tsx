import React from 'react';
import {IonItem} from "@ionic/react";
import './ViewAllAccountsListItem.css'
import {AccountDTO} from "../../../assets/entities/AccountDTO";
import {formatNumber} from "../../../assets";

interface ViewAllAccountsListItemProps {
    account: AccountDTO
}

const ViewAllAccountsListItem: React.FC<ViewAllAccountsListItemProps> = ({account}) => {
    return (
        <IonItem className="unstyled-ion-item roboto-style">
            <div className="view-all-accounts-list-item-container">
                {account.profile_photo ?
                    <img
                        src={`data:image/jpeg;base64,${account.profile_photo}`}
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
                            analysed
                            <img src="/icons/tick.png" alt="tick_img" className="view-all-accounts-list-analised-tick"/>
                        </div>
                    ) : (
                        <div className="view-all-accounts-list-analised-false roboto-style">
                            unanalysed
                            <img src="/icons/cancel.png" alt="cancel_img"
                                 className="view-all-accounts-list-analised-cancel"/>
                        </div>
                    )}
                </div>
                <div className="view-all-accounts-list-delete-profile roboto-style">
                    <button className="view-all-accounts-list-delete-profile-button roboto-style">
                        <div className="view-all-accounts-list-delete-profile-text">delete profile</div>
                        <img src="/icons/delete.png" alt="delete_img"
                             className="view-all-accounts-list-analised-delete"/>
                    </button>
                </div>
            </div>
        </IonItem>
    );
};

export default ViewAllAccountsListItem;
