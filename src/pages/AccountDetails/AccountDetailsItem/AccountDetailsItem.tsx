import React from 'react';
import {IonItem} from "@ionic/react";
import './AccountDetailsItem.css'
import {formatNumber} from "../../../assets";
import {Post} from "../../../assets/entities/Post";

interface AccountDetailsItemProps {
    post: Post
}

const AccountDetailsItem: React.FC<AccountDetailsItemProps> = ({post}) => {
    //TODO: DE VAZUT CE ATRIBUTE POT FI UNDEFINED
    return (
        <IonItem className="account-details-item unstyled-ion-item roboto-style">
            <div className="account-details-item-container">
                <div className="account-details-item-photos-container">
                    <div className="account-details-item-photo">
                        <img
                            src={`data:image/jpeg;base64,${post.photos.at(0)}`}
                            alt="post_img"
                            className="account-details-item-photo-image"
                        />
                    </div>
                </div>
                <div className="account-details-item-no-comments-likes-container">
                    <div className="account-details-item-no-likes-container roboto-style">
                        <img src="/icons/heart.png" alt="heart_img"
                             className="account-details-item-no-likes-hear-iocn icon-size"/>
                        {formatNumber(post.no_likes)} likes
                    </div>
                    <button className="account-details-item-no-comments-button roboto-style">
                        <img src="/icons/chat.png" alt="chat_img"
                             className="account-details-item-no-comments-chat-iocn icon-size"/>
                        {formatNumber(post.no_comments)} comments
                    </button>
                </div>
                <div className="account-details-item-description roboto-style">
                    {post.description}
                </div>
                <div className="account-details-item-comments-container">

                </div>
                <div className="account-details-item-date-delete-container">
                    <div className="account-details-item-date roboto-style">
                        {new Date(post.date_posted).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                        })}
                    </div>
                    <button className="account-details-item-delete-button roboto-style">
                        <img src="/icons/delete.png" alt="delete_img"
                             className="account-details-item-delete-button-icon icon-size"/>
                        Delete post
                    </button>
                </div>
                <hr className="account-details-item-divider"/>

            </div>
        </IonItem>
    );
};

export default AccountDetailsItem;
