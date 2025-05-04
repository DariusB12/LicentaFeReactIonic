import React from 'react';
import "./EditProfilePopUp.css"

interface EditProfilePopUpProps {
    isOpen: boolean,

    id: number,
    username: string,
    profile_description: string,
    profile_photo?: string,
    no_followers: number,
    no_following: number
    no_of_posts: number,

    closeFn: () => void
}

const EditProfilePopUp: React.FC<EditProfilePopUpProps> = (props) => {
    if (!props.isOpen) return null;
    //TODO: TRANSLATE AND SAVE BUTTONS SHOW LOGIC, DE FACUT TEXT INPUTS MUTABLE CU useState<>()
    return (
        <div className="edit-profile-popup-container">
            <div className="edit-profile-popup-content">

                <div className="edit-profile-popup-cancel-conatiner">
                    <button className="edit-profile-popup-cancel-button roboto-style"
                            onClick={props.closeFn}>Cancel <img src="/icons/close.png" alt="close_img"
                                                                className="edit-profile-popup-cancel-icon icon-size"/>
                    </button>
                </div>
                <div className="edit-profile-popup-middle-content">
                    <div className="edit-profile-popup-profile-image-container">
                        <div className="edit-profile-popup-profile-photo-container roboto-style">Profile Photo</div>
                        {props.profile_photo ?
                            <img
                                src={`data:image/jpeg;base64,${props.profile_photo}`}
                                alt="profile_img"
                                className="edit-profile-popup-profile-image"
                            /> :
                            <img
                                src="/icons/anonim_image.png"
                                alt="anonim_image"
                                className="edit-profile-popup-profile-image"
                            />
                        }
                        <div className="edit-profile-popup-profile-buttons-bar">
                            <button className="edit-profile-popup-profile-upload-button grey-button roboto-style">
                                <img src="/icons/upload.png" alt="upload_img"
                                     className="edit-profile-popup-upload-icon icon-size"/> Upload
                            </button>
                            <button className="edit-profile-popup-profile-delete-button grey-button roboto-style">
                                <img src="/icons/delete.png" alt="delete_img"
                                     className="edit-profile-popup-delete-icon icon-size"/> Delete
                            </button>
                        </div>
                    </div>
                    <div className="edit-profile-popup-profile-details-container">
                        <div className="roboto-style">Description</div>
                        <textarea
                               className="edit-profile-popup-profile-description-input edit-profile-inputs input-reset roboto-style"
                               placeholder="profile description"
                               value={props.profile_description}
                        />
                        <div className="edit-profile-posts-container roboto-style">
                            <input type="number"
                                   min="0"
                                   className="edit-profile-popup-profile-posts-input edit-profile-inputs input-reset roboto-style"
                                   value={props.no_of_posts}
                                   placeholder="posts no"/> posts
                        </div>
                        <div className="edit-profile-followers-container roboto-style">
                            <input type="number"
                                   min="0"
                                   className="edit-profile-popup-profile-followers-input edit-profile-inputs input-reset roboto-style"
                                   value={props.no_followers}
                                   placeholder="followers no"/> followers
                        </div>
                        <div className="edit-profile-following-container">
                            <input type="number"
                                   min="0"
                                   className="edit-profile-popup-profile-following-input edit-profile-inputs input-reset roboto-style"
                                   value={props.no_following}
                                   placeholder="following no"/> following
                        </div>
                        <div className="edit-profile-username-container">
                            Username <input type="text"
                                             className="edit-profile-popup-profile-username-input edit-profile-inputs input-reset roboto-style"
                                            value={props.username}
                                            placeholder="username"/>
                        </div>
                    </div>
                </div>
                <div className="edit-profile-popup-bottom-bar">
                    <button className="edit-profile-popup-detect-from-image-button grey-button roboto-style">
                        Detect From Image
                    </button>
                    <button className="edit-profile-popup-translate-to-english-button grey-button roboto-style">
                        Translate to english
                    </button>
                    <button className="edit-profile-popup-save-button grey-button roboto-style">
                        Save
                    </button>
                </div>
            </div>

        </div>
    );
};

export default EditProfilePopUp;
