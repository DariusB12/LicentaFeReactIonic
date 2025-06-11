import React, {useCallback, useContext, useState} from 'react';
import "./EditProfilePopUp.css"
import {getLogger, useWindowWidth} from "../../../assets";
import ImageUploader from "../../../components/ImageUploader/ImageUploader";
import DetectFromImage from "../../../components/DetectFromImage/DetectFromImage";
import {DetectProfileResponse} from "../../../assets/Responses/yoloResponses/DetectProfileResponse";
import {IonToast} from "@ionic/react";
import CirclesLoading from "../../../components/CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../../../components/CustomInfoAlert/CustomInfoAlert";
import {NllbTranslationContext} from "../../../providers/NllbTranslationProvider/NllbTranslationContext";
import {AuthContext} from "../../../providers/AuthProvider/AuthContext";
import {SocialAccountsContext} from "../../../providers/SocialAccountsProvider/SocialAccountsContext";
import {UpdateSocialAccountRequest} from "../../../assets/Requests/socialAccountsRequest/UpdateSocialAccountRequest";

interface EditProfilePopUpProps {
    isOpen: boolean,

    idProfile: number,
    username: string,
    profile_description: string,
    profile_photo?: string,
    no_followers: number,
    no_following: number
    no_of_posts: number,

    savedSuccessfully: () => void
    closeFn: () => void
}

const log = getLogger('EditProfilePopUp');

const EditProfilePopUp: React.FC<EditProfilePopUpProps> = (props) => {
    //useStates FOR INPUT ERRORS
    const [noOfPostsError, setNoOfPostsError] = useState<boolean>(false);
    const [noOfPostsErrorMessage, setNoOfPostsErrorMessage] = useState<string>('');
    const [noOfFollowersError, setNoOfFollowersError] = useState<boolean>(false);
    const [noOfFollowersErrorMessage, setNoOfFollowersErrorMessage] = useState<string>('');
    const [noOfFollowingError, setNoOfFollowingError] = useState<boolean>(false);
    const [noOfFollowingErrorMessage, setNoOfFollowingErrorMessage] = useState<string>('');
    const [usernameError, setUsernameError] = useState<boolean>(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = useState<string>('');

    //useStates FOR INITIALIZING DATA
    const [profilePhotoState, setProfilePhotoState] = useState<string | undefined>(props.profile_photo);
    const [descriptionState, setDescriptionState] = useState<string>(props.profile_description);
    const [noOfPosts, setNoOfPosts] = useState<number | null>(props.no_of_posts);
    const [noOfFollowers, setNoOfFollowers] = useState<number | null>(props.no_followers);
    const [noOfFollowing, setNoOfFollowing] = useState<number | null>(props.no_following);
    const [usernameState, setUsernameState] = useState<string>(props.username);

    const [profileToBeSaved, setProfileToBeSaved] = useState<boolean>(false);
    const [profileToBeTranslated, setProfileToBeTranslated] = useState<boolean>(false);

    const [uploadPhoto, setUploadPhoto] = useState<boolean>(false);
    const [detectFromImage, setDetectFromImage] = useState<boolean>(false);
    const windowWidth = useWindowWidth()

    const [isOpenToastNotification, setIsOpenToastNotification] = useState<boolean>(false)
    const [toastNotificationMessage, setToastNotificationMessage] = useState<string>('');

    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {translateProfile} = useContext(NllbTranslationContext)
    const {setTokenExpired} = useContext(AuthContext);

    const handleTranslateToEnglish = useCallback(async () => {
        log('translate the profile (description)');
        //RESET ALL THE ERRORS, PROPOSING NO ERROR EXISTS
        setNoOfPostsError(false)
        setNoOfFollowersError(false)
        setNoOfFollowingError(false)
        setUsernameError(false)
        setNoOfPostsErrorMessage('')
        setNoOfFollowersErrorMessage('')
        setNoOfFollowingErrorMessage('')
        setUsernameErrorMessage('')

        // SET TOAST NOTIFY TO FALSE
        // AND SLEEP SO THAT THE TOAST TIMEOUT IS RESET (IF OPENING MORE TOAST ONE AFTER ANOTHER FORCE TO RERENDER)
        setIsOpenToastNotification(false)
        await new Promise(resolve => setTimeout(resolve, 5))

        if (descriptionState) {
            setIsLoading(true)
            const response = await translateProfile?.(descriptionState)
            setIsLoading(false)

            //200 OK data detected
            if (response?.status_code == 200) {
                setDescriptionState(response.description ? response.description : '')

                setIsOpenToastNotification(true)
                setToastNotificationMessage('Translated successfully')

                setProfileToBeSaved(true)
                setProfileToBeTranslated(false)
            } else if (response?.status_code == 403) {
                //403 FORBIDDEN if the token is expired
                setTokenExpired?.(true)
            } else {
                //Any other err is a server error
                setErrorMessage('Network error')
                setIsError(true)
            }
        } else {
            setIsOpenToastNotification(true)
            setToastNotificationMessage('No text to be translated')
            setProfileToBeSaved(true)
            setProfileToBeTranslated(false)
        }

    }, [descriptionState, translateProfile, setDescriptionState, setProfileToBeSaved, setProfileToBeTranslated, setTokenExpired]);


    const validateInputs = useCallback(async (): Promise<boolean> => {
        log('validate the inputs')
        //RESET ALL THE ERRORS, PROPOSING NO ERROR EXISTS
        setNoOfPostsError(false)
        setNoOfFollowersError(false)
        setNoOfFollowingError(false)
        setUsernameError(false)
        setNoOfPostsErrorMessage('')
        setNoOfFollowersErrorMessage('')
        setNoOfFollowingErrorMessage('')
        setUsernameErrorMessage('')

        let hasError = false;
        // NUMBER INPUTS SHOULD NOT BE FLOAT (WITH '2.0')
        if (!Number.isInteger(noOfPosts)) {
            setNoOfPostsErrorMessage('Must be >=0')
            setNoOfPostsError(true)
            log('invalid no posts')
            hasError = true;
        }
        if (!Number.isInteger(noOfFollowers)) {
            setNoOfFollowersErrorMessage('Must be >=0')
            setNoOfFollowersError(true)
            log('invalid no of followers')
            hasError = true
        }
        if (!Number.isInteger(noOfFollowing)) {
            setNoOfFollowingErrorMessage('Must be >=0')
            setNoOfFollowingError(true)
            log('invalid no of following')
            hasError = true
        }

        // USERNAME CANNOT START WITH WHITE SPACES, AND CANNOT BE NULL
        const trimmed = usernameState.trim();
        if (trimmed.length === 0) {
            setUsernameErrorMessage('Username cannot be empty.')
            setUsernameError(true)
            log('empty username')
            hasError = true
        }
        if (usernameState.startsWith(' ') || usernameState.endsWith(' ')) {
            setUsernameErrorMessage('Username cannot start/end with a whitespace.');
            setUsernameError(true);
            log('Username cannot start/end with a whitespace.')
            hasError = true;
        }
        return hasError;

    }, [noOfPosts, noOfFollowing, noOfFollowers, usernameState]);


    async function imageUrlToBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const blob = await response.blob();

        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // reader.result is of type string | ArrayBuffer
                if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
                    resolve(reader.result);
                } else {
                    reject('Failed to convert image to base64');
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }



    const {updateSocialAccount} = useContext(SocialAccountsContext)

    const handleSaveOnClick = useCallback(async () => {
        log('save edited profile');
        const hasError = await validateInputs()

        if (!hasError) {
            //IF INPUTS ARE VALID, THEN ADD THE EDITED PROFILE
            // LOAD THE ANONYMOUS IMAGE IN BASE64 IF THE PROFILE IMAGE IS NOT SET
            let anonymous_image = ''
            try {
                anonymous_image = await imageUrlToBase64('/icons/anonim_image.png');
                // log('Base64 image:', anonymous_image);
            } catch (error) {
                log('Error converting image to base64:', error);
                setErrorMessage('Could not save the account')
                setIsError(true)
                return
            }
            const toUpdateAccountRequest: UpdateSocialAccountRequest = {
                id: props.idProfile,
                username: usernameState,
                profile_description: descriptionState ? descriptionState : '',
                no_followers: noOfFollowers ? noOfFollowers : 0,
                no_following: noOfFollowing ? noOfFollowing : 0,
                no_of_posts: noOfPosts ? noOfPosts : 0,
                // IF THE PHOTO IS EMPTY, THEN WE STORE ON THE BACKEND THE ANONYMOUS IMAGE
                profile_photo: profilePhotoState ? profilePhotoState : anonymous_image
            }

            setIsLoading(true)
            const response = await updateSocialAccount?.(toUpdateAccountRequest)
            setIsLoading(false)

            //200 OK data detected
            if (response?.status_code == 200) {
                props.savedSuccessfully()
            } else if (response?.status_code == 422) {
                //422 Unprocessable Content => frontend error
                setErrorMessage('Could not save the account')
                setIsError(true)
            } else if (response?.status_code == 403) {
                //403 FORBIDDEN if the token is expired
                setTokenExpired?.(true)
            } else {
                //Any other err is a server error
                setErrorMessage('Network error')
                setIsError(true)
            }
        }

    }, [validateInputs, usernameState, descriptionState, noOfFollowers, noOfFollowing, noOfPosts, profilePhotoState, updateSocialAccount, props, setTokenExpired]);



    const handleProfileDataDetected = useCallback(async (profileData: DetectProfileResponse) => {
        log('setting the detected profile data states');
        //RESET ALL THE ERRORS, PROPOSING NO ERROR EXISTS
        setNoOfPostsError(false)
        setNoOfFollowersError(false)
        setNoOfFollowingError(false)
        setUsernameError(false)
        setNoOfPostsErrorMessage('')
        setNoOfFollowersErrorMessage('')
        setNoOfFollowingErrorMessage('')
        setUsernameErrorMessage('')

        if (profileData.description) {
            setProfileToBeTranslated(true)
            setProfileToBeSaved(false)
        } else if (profileData.profile_photo || profileData.username || profileData.no_of_posts || profileData.no_following || profileData.no_followers) {
            setProfileToBeSaved(true)
            setProfileToBeTranslated(false)
        }
        setProfilePhotoState(profileData.profile_photo ? profileData.profile_photo : undefined)
        setDescriptionState(profileData.description ? profileData.description : '')
        setUsernameState(profileData.username ? profileData.username : '')
        if (profileData.no_followers !== undefined && profileData.no_followers != -1)
            setNoOfFollowers(profileData.no_followers)
        else
            setNoOfFollowers(null)
        if (profileData.no_following !== undefined && profileData.no_following != -1)
            setNoOfFollowing(profileData.no_following)
        else
            setNoOfFollowing(null)
        if (profileData.no_of_posts !== undefined && profileData.no_of_posts != -1)
            setNoOfPosts(profileData.no_of_posts)
        else
            setNoOfPosts(null)

    }, [setDescriptionState, setNoOfFollowers, setNoOfFollowing, setNoOfPosts, setProfilePhotoState, setProfileToBeSaved, setProfileToBeTranslated, setUsernameState]);



    const resetBackValuesOnCancel = useCallback(async () => {
        //RESET BACK ALL THE VALUES IF THE EDIT PROFILE IS CANCELED
        setDescriptionState(props.profile_description)
        setNoOfPosts(props.no_of_posts)
        setNoOfFollowers(props.no_followers)
        setNoOfFollowing(props.no_following)
        setUsernameState(props.username)
        setUploadPhoto(false)
        setProfileToBeSaved(false)
        setProfileToBeTranslated(false)
        setProfilePhotoState(props.profile_photo)
    }, [props])

    if (!props.isOpen) return null;

    return (
        <div className="edit-profile-popup-container">
            <div className="edit-profile-popup-content">

                <div className="edit-profile-popup-cancel-conatiner">
                    <button className="edit-profile-popup-cancel-button roboto-style"
                            onClick={() => {
                                props.closeFn()
                                resetBackValuesOnCancel().then(() => {
                                })
                            }
                            }>Cancel <img src="/icons/close.png" alt="close_img"
                                          className="edit-profile-popup-cancel-icon icon-size"/>
                    </button>
                </div>
                <div className="edit-profile-popup-middle-content">
                    {!uploadPhoto && <div className="edit-profile-popup-profile-image-container">
                        <div className="edit-profile-popup-profile-photo-container roboto-style">Profile Photo</div>
                        {profilePhotoState ?
                            <img
                                src={profilePhotoState}
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
                            <button className="edit-profile-popup-profile-upload-button grey-button roboto-style"
                                    onClick={() => {
                                        setUploadPhoto(true)
                                    }}>
                                <img src="/icons/upload.png" alt="upload_img"
                                     className="edit-profile-popup-upload-icon icon-size"/> Upload
                            </button>
                            <button className="edit-profile-popup-profile-delete-button grey-button roboto-style"
                                    onClick={() => {
                                        setProfilePhotoState(undefined)
                                        if (!profileToBeTranslated) {
                                            setProfileToBeSaved(true)
                                        }
                                    }}
                            >
                                <img src="/icons/delete.png" alt="delete_img"
                                     className="edit-profile-popup-delete-icon icon-size"/> Delete
                            </button>
                        </div>
                    </div>}
                    {uploadPhoto &&
                        <div className="edit-profile-popup-profile-image-container">
                            <div className="edit-profile-popup-profile-photo-container roboto-style">Upload Profile
                                Photo
                            </div>
                            <ImageUploader
                                cancelFn={() => {
                                    setUploadPhoto(false)
                                }}
                                saveFn={(newProfilePhoto) => {
                                    setProfilePhotoState(newProfilePhoto)
                                    setUploadPhoto(false)
                                    if (!profileToBeTranslated) {
                                        setProfileToBeSaved(true)
                                    }
                                }}
                            />
                        </div>}
                    <div className="edit-profile-popup-profile-details-container">
                        <div className="edit-profile-popup-description-text roboto-style">Description</div>
                        <textarea
                            className="edit-profile-popup-profile-description-input edit-profile-inputs input-reset roboto-style"
                            placeholder="profile description"
                            value={descriptionState}
                            onChange={(e) => {
                                setDescriptionState(e.target.value)
                                setProfileToBeTranslated(true)
                                setProfileToBeSaved(false)
                            }}
                        />
                        <div className="edit-profile-posts-container roboto-style">
                            <input type="number"
                                   min="0"
                                   className={`edit-profile-popup-profile-posts-input edit-profile-inputs ${noOfPostsError ? 'red-border-input' : ''} input-reset roboto-style`}
                                   value={noOfPosts === null ? '' : noOfPosts}
                                   onChange={(e) => {
                                       const val = e.target.value;
                                       setNoOfPosts(val === '' ? null : Number(val));
                                       if (!profileToBeTranslated) {
                                           setProfileToBeSaved(true)
                                       }
                                   }}
                                   onKeyDown={(e) => {
                                       if (e.key === '-' || e.key === '+' || e.key === 'e') {
                                           e.preventDefault();
                                       }
                                   }}
                                   placeholder="posts no"/>
                            posts
                            {windowWidth >= 1100 && noOfPostsError &&
                                <div className="edit-popup-profile-error-messaage">{noOfPostsErrorMessage}</div>}
                        </div>

                        <div className="edit-profile-followers-container roboto-style">
                            <input type="number"
                                   min="0"
                                   className={`edit-profile-popup-profile-followers-input edit-profile-inputs ${noOfFollowersError ? 'red-border-input' : ''} input-reset roboto-style`}
                                   value={noOfFollowers === null ? '' : noOfFollowers}
                                   onChange={(e) => {
                                       const val = e.target.value;
                                       setNoOfFollowers(val === '' ? null : Number(val));
                                       if (!profileToBeTranslated) {
                                           setProfileToBeSaved(true)
                                       }
                                   }}
                                   onKeyDown={(e) => {
                                       if (e.key === '-' || e.key === '+' || e.key === 'e') {
                                           e.preventDefault();
                                       }
                                   }}
                                   placeholder="followers no"/>
                            followers
                            {windowWidth >= 1100 && noOfFollowersError &&
                                <div className="edit-popup-profile-error-messaage">{noOfFollowersErrorMessage}</div>}

                        </div>

                        <div className="edit-profile-following-container">
                            <input type="number"
                                   min="0"
                                   className={`edit-profile-popup-profile-following-input edit-profile-inputs ${noOfFollowingError ? 'red-border-input' : ''} input-reset roboto-style`}
                                   value={noOfFollowing === null ? '' : noOfFollowing}
                                   onChange={(e) => {
                                       const val = e.target.value;
                                       setNoOfFollowing(val === '' ? null : Number(val));
                                       if (!profileToBeTranslated) {
                                           setProfileToBeSaved(true)
                                       }
                                   }}
                                   onKeyDown={(e) => {
                                       if (e.key === '-' || e.key === '+' || e.key === 'e') {
                                           e.preventDefault();
                                       }
                                   }}
                                   placeholder="following no"/>
                            following
                            {windowWidth >= 1100 && noOfFollowingError &&
                                <div className="edit-popup-profile-error-messaage">{noOfFollowingErrorMessage}</div>}
                        </div>
                        <div className="edit-profile-username-container">
                            Username <input type="text"
                                            className={`edit-profile-popup-profile-username-input edit-profile-inputs ${usernameError ? 'red-border-input' : ''} input-reset roboto-style`}
                                            value={usernameState}
                                            onChange={(e) => {
                                                setUsernameState(e.target.value)
                                                if (!profileToBeTranslated) {
                                                    setProfileToBeSaved(true)
                                                }
                                            }}
                                            placeholder="username"/>
                            {windowWidth >= 1100 && usernameError &&
                                <div className="edit-popup-profile-error-messaage">{usernameErrorMessage}</div>}
                        </div>

                    </div>
                </div>
                <div className="edit-profile-popup-bottom-bar">
                    <button className="edit-profile-popup-detect-from-image-button grey-button roboto-style"
                            onClick={() => {
                                setDetectFromImage(true)
                            }}>
                        {windowWidth <= 690 ? "Detect" : "Detect From Image"}
                    </button>
                    {profileToBeTranslated &&
                        < button className="edit-profile-popup-translate-to-english-button grey-button roboto-style"
                                 onClick={handleTranslateToEnglish}
                        >
                            {windowWidth <= 690 ? "Translate" : "Translate to english"}
                        </button>}
                    {profileToBeSaved &&
                        <button className="edit-profile-popup-save-button grey-button roboto-style"
                                onClick={handleSaveOnClick}>
                            Save
                        </button>}
                </div>
            </div>
            {detectFromImage && <DetectFromImage forPost={false} forProfile={true}
                                                 onCancel={() => {setDetectFromImage(false)}}
                                                 onProfileDetected={handleProfileDataDetected}
                                                 onPostDetected={async () => {}}/>
            }
            {isOpenToastNotification &&
                <IonToast
                    isOpen={isOpenToastNotification}
                    message={toastNotificationMessage}
                    position="top"
                    onDidDismiss={() => {
                        setIsOpenToastNotification(false)
                    }}
                    duration={3000}/>
            }
            {(isLoading || isError) && <div className='edi-profile-popups-container'>
                <CirclesLoading isOpen={isLoading} message={'loading'}/>
                <CustomInfoAlert isOpen={isError} header={"Error Editing Profile"}
                                 error={true}
                                 message={errorMessage} onDismiss={() => {
                    setIsError(false)
                }}/>
            </div>}
        </div>
    );
};

export default EditProfilePopUp;
