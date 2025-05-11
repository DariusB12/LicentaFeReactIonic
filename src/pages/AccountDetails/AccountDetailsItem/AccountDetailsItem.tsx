import React, {useState} from 'react';
import {IonItem} from "@ionic/react";
import './AccountDetailsItem.css'
import {formatNumber} from "../../../assets";
import {Post} from "../../../assets/entities/Post";
import {motion} from 'framer-motion';

export type EditFn = () => void;

interface AccountDetailsItemProps {
    post: Post
    onClickEdit: EditFn
}

const AccountDetailsItem: React.FC<AccountDetailsItemProps> = ({post,onClickEdit}) => {
    const [photoIndex, setPhotoIndex] = useState<number>(0);
    const [commentsButtonIsActive, setCommentsButtonIsActive] = useState(false);

    return (
        <IonItem className="account-details-item unstyled-ion-item roboto-style">
            <div className="account-details-item-container">
                <div className="account-details-item-photos-container">
                    <div className="account-details-item-photo">
                        <motion.img
                            key={photoIndex} // This triggers re-animation when photoIndex changes
                            src={`data:image/jpeg;base64,${post.photos.at(photoIndex)?.photo}`}
                            alt="post_img"
                            className="account-details-item-photo-image"
                            initial={{x: 0, opacity: 0}}
                            animate={{x: 0, opacity: 1}}
                            exit={{x: 0, opacity: 0}}
                            transition={{duration: 0.2}}
                        />
                        <button className="account-details-item-edit-post-button roboto-style" onClick={onClickEdit}>
                            <img src="/icons/edit.png" alt="edit_img"
                                 className="account-details-item-edit-post-icon icon-size"/>
                            Edit post
                        </button>
                        {photoIndex != 0 &&
                            <button className="account-details-item-arrow-back-button" onClick={() => {
                                setPhotoIndex(prevState => prevState - 1);
                            }}>
                                <img src="/icons/arrow_back.png" alt="back_img"
                                     className="account-details-item-arrow-back-icon icon-size"/>
                            </button>
                        }
                        {photoIndex != post.photos.length - 1 &&
                            <button className="account-details-item-arrow-forward-button" onClick={() => {
                                setPhotoIndex(prevState => prevState + 1);
                            }}>
                                <img src="/icons/arrow_forward.png" alt="forward_img"
                                     className="account-details-item-arrow-forward-icon icon-size"/>
                            </button>
                        }
                    </div>
                </div>
                <div className="account-details-item-no-comments-likes-container">
                    <div className="account-details-item-no-likes-container roboto-style">
                        {post.no_likes != -1 && <img src="/icons/heart.png" alt="heart_img"
                              className="account-details-item-no-likes-hear-iocn icon-size"/>}
                        {post.no_likes != -1 ? formatNumber(post.no_likes) : <img src="/icons/lock.png"
                                                                                       alt={`lock_img`}
                                                                                       className="icon-size"/>} likes
                    </div>
                    <button
                        className={`account-details-item-no-comments-button ${commentsButtonIsActive ? 'active' : ''} roboto-style`}
                        onClick={() => setCommentsButtonIsActive(prev => !prev)}
                    >
                        {post.no_comments!=-1 && <img src={`/icons/chat.png`}
                              alt={`chat_img`}
                              className="account-details-item-no-comments-chat-iocn icon-size"/>}
                        {post.no_comments != -1 ? formatNumber(post.no_comments) : <img src="/icons/lock.png"
                                                                                       alt={`lock_img`}
                                                                                       className="icon-size"/>} comments
                    </button>
                </div>
                <div className="account-details-item-description roboto-style">
                    {post.description}
                </div>
                {commentsButtonIsActive &&
                    <>
                        <div className="account-details-item-comments-container">
                            <hr className="account-details-item-divider-comments"/>
                            {post.comments.map((postComment) =>
                                <div className="account-details-item-comment">
                                    {postComment.comment}
                                    <hr className="account-details-item-divider-comments"/>
                                </div>
                            )}
                        </div>
                    </>
                }
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
