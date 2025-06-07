import React, {useCallback, useContext, useEffect, useState} from 'react';
import "./AddAccountScreen.css"
import {getLogger, usePersistentState, useWindowWidth} from "../../../assets";
import ImageUploader from "../../../components/ImageUploader/ImageUploader";
import DetectFromImage from "../../../components/DetectFromImage/DetectFromImage";
import {DetectProfileResponse} from "../../../assets/Responses/yoloResponses/DetectProfileResponse";
import {Preferences} from "@capacitor/preferences";
import {NllbTranslationContext} from "../../../providers/NllbTranslationProvider/NllbTranslationContext";
import CirclesLoading from "../../../components/CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../../../components/CustomInfoAlert/CustomInfoAlert";
import {IonToast} from "@ionic/react";
import {AuthContext} from "../../../providers/AuthProvider/AuthContext";
import {SocialAccountsContext} from "../../../providers/SocialAccountsProvider/SocialAccountsContext";
import {AddSocialAccountReq} from "../../../assets/Requests/socialAccountsRequest/AddSocialAccountReq";


interface EditProfilePopUpProps {
    savedSuccessfully: (photo: string, username: string, idProfile: number) => void
}

const log = getLogger('AddAccountScreen');

const AddAccountScreen: React.FC<EditProfilePopUpProps> = (props) => {

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
    const [usernameState, setUsernameState] = usePersistentState<string>('addAccountUsername', '');
    const [descriptionState, setDescriptionState] = usePersistentState<string>('description', '');
    const [noOfPosts, setNoOfPosts] = usePersistentState<number | null>('noOfPosts', null);
    const [noOfFollowers, setNoOfFollowers] = usePersistentState<number | null>('noOfFollowers', null);
    const [noOfFollowing, setNoOfFollowing] = usePersistentState<number | null>('noOfFollowing', null);
    const [profilePhotoState, setProfilePhotoState] = usePersistentState<string | undefined>('profilePhoto', undefined);

    const [profileToBeSaved, setProfileToBeSaved] = usePersistentState<boolean>('addAccountScreenProfileToBeSaved', false);
    const [profileToBeTranslated, setProfileToBeTranslated] = usePersistentState<boolean>('addAccountScreenProfileToBeTranslated', false);

    const [uploadPhoto, setUploadPhoto] = useState<boolean>(false);
    const [detectFromImage, setDetectFromImage] = useState<boolean>(false);
    const windowWidth = useWindowWidth()

    const {translateProfile} = useContext(NllbTranslationContext)
    const {setTokenExpired} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isOpenToastNotification, setIsOpenToastNotification] = useState<boolean>(false)
    const [toastNotificationMessage, setToastNotificationMessage] = useState<string>('');

    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleTranslateToEnglish = useCallback(async () => {
        log('translate the description');
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
        log('validating the inputs')
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
            hasError = true;
        }
        if (!Number.isInteger(noOfFollowers)) {
            setNoOfFollowersErrorMessage('Must be >=0')
            setNoOfFollowersError(true)
            hasError = true
        }
        if (!Number.isInteger(noOfFollowing)) {
            setNoOfFollowingErrorMessage('Must be >=0')
            setNoOfFollowingError(true)
            hasError = true
        }

        // USERNAME CANNOT START WITH WHITE SPACES, AND CANNOT BE NULL
        const trimmed = usernameState.trim();
        if (trimmed.length === 0) {
            setUsernameErrorMessage('Username cannot be empty.')
            setUsernameError(true)
            hasError = true
        }
        if (usernameState.startsWith(' ') || usernameState.endsWith(' ')) {
            setUsernameErrorMessage('Username cannot start/end with a whitespace.');
            setUsernameError(true);
            hasError = true;
        }
        return hasError;

    }, [noOfPosts, noOfFollowing, noOfFollowers, usernameState]);

    const {addSocialAccount} = useContext(SocialAccountsContext)

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
            const toAddAccountRequest: AddSocialAccountReq = {
                username: usernameState,
                profile_description: descriptionState ? descriptionState : '',
                no_followers: noOfFollowers ? noOfFollowers : 0,
                no_following: noOfFollowing ? noOfFollowing : 0,
                no_of_posts: noOfPosts ? noOfPosts : 0,
                // IF THE PHOTO IS EMPTY, THEN WE STORE ON THE BACKEND THE ANONYMOUS IMAGE
                profile_photo: profilePhotoState ? profilePhotoState : anonymous_image
            }

            setIsLoading(true)
            const response = await addSocialAccount?.(toAddAccountRequest)
            setIsLoading(false)

            //200 OK data detected
            if (response?.status_code == 200 && response.id) {
                props.savedSuccessfully(profilePhotoState ? profilePhotoState : '', usernameState, response.id)
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

    }, [validateInputs, usernameState, descriptionState, noOfFollowers, noOfFollowing, noOfPosts, profilePhotoState, addSocialAccount, props, setTokenExpired]);

    const handleProfileDataDetected = useCallback(async (profileData: DetectProfileResponse) => {
        log('setting the detected profile data');
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

    //FUNCTIE CARE STERGE DIN LOCAL STORAGE DATELE PERSISTATE
    const resetProfileForm = useCallback(async () => {
        await Preferences.remove({key: 'addAccountUsername'});
        await Preferences.remove({key: 'description'});
        await Preferences.remove({key: 'noOfPosts'});
        await Preferences.remove({key: 'noOfFollowers'});
        await Preferences.remove({key: 'noOfFollowing'});
        await Preferences.remove({key: 'profilePhoto'});
        await Preferences.remove({key: 'addAccountScreenProfileToBeSaved'});
        await Preferences.remove({key: 'addAccountScreenProfileToBeTranslated'});
    }, []);

    //PENTRU A STERGE DIN LOCAL STORAGE ATUNCI CAND SE PARASESTE PAGINA
    useEffect(() => {
        return () => {
            resetProfileForm().then()
        };
    }, [resetProfileForm]);


    //TODO: LA ADAUGARE DACA NU E INCARCATA NICIO IMAGINE DE PROFIL ATUNCI SE VA TRIMITE LA SERVER IMAGINEA ANONIMA, NU ARE VOIE SA FIE NULL
    return (
        <div className="add-account-screen-content">
            <div className='add-account-screen-title roboto-style'>Add profile data</div>

            <div className="add-account-screen-middle-content">
                {!uploadPhoto && <div className="add-account-screen-profile-image-container">
                    <div className="add-account-screen-profile-photo-container roboto-style">Profile Photo</div>
                    {profilePhotoState ?
                        <img
                            src={profilePhotoState}
                            alt="profile_img"
                            className="add-account-screen-profile-image"
                        /> :
                        <img
                            src="/icons/anonim_image.png"
                            alt="anonim_image"
                            className="add-account-screen-profile-image"
                        />
                    }
                    <div className="add-account-screen-profile-buttons-bar">
                        <button className="add-account-screen-profile-upload-button grey-button roboto-style"
                                onClick={() => {
                                    setUploadPhoto(true)
                                }}>
                            <img src="/icons/upload.png" alt="upload_img"
                                 className="add-account-screen-upload-icon icon-size"/> Upload
                        </button>
                        <button className="add-account-screen-profile-delete-button grey-button roboto-style"
                                onClick={() => {
                                    setProfilePhotoState(undefined)
                                    if (!profileToBeTranslated) {
                                        setProfileToBeSaved(true)
                                    }
                                }}
                        >
                            <img src="/icons/delete.png" alt="delete_img"
                                 className="add-account-screen-delete-icon icon-size"/> Delete
                        </button>
                    </div>
                </div>}
                {uploadPhoto &&
                    <div className="add-account-screen-profile-image-container">
                        <div className="add-account-screen-profile-photo-container roboto-style">Upload Profile
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
                <div className="add-account-screen-profile-details-container">
                    <div className="roboto-style">Description</div>
                    <textarea
                        className="add-account-screen-profile-description-input add-account-screen-inputs input-reset roboto-style"
                        placeholder="profile description"
                        value={descriptionState}
                        onChange={(e) => {
                            setDescriptionState(e.target.value)
                            setProfileToBeTranslated(true)
                            setProfileToBeSaved(false)
                        }}
                    />
                    <div className="add-account-screen-posts-container roboto-style">
                        <input type="number"
                               min="0"
                               className={`add-account-screen-profile-posts-input edit-profile-inputs ${noOfPostsError ? 'red-border-input' : ''} input-reset roboto-style`}
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
                            <div className="add-account-screen-error-messaage">{noOfPostsErrorMessage}</div>}
                    </div>

                    <div className="add-account-screen-followers-container roboto-style">
                        <input type="number"
                               min="0"
                               className={`add-account-screen-profile-followers-input add-account-screen-inputs ${noOfFollowersError ? 'red-border-input' : ''} input-reset roboto-style`}
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
                            <div className="add-account-screen-error-messaage">{noOfFollowersErrorMessage}</div>}

                    </div>

                    <div className="add-account-screen-following-container">
                        <input type="number"
                               min="0"
                               className={`add-account-screen-profile-following-input add-account-screen-inputs ${noOfFollowingError ? 'red-border-input' : ''} input-reset roboto-style`}
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
                            <div className="add-account-screen-error-messaage">{noOfFollowingErrorMessage}</div>}
                    </div>
                    <div className="add-account-screen-username-container">
                        Username <input type="text"
                                        className={`add-account-screen-profile-username-input add-account-screen-inputs ${usernameError ? 'red-border-input' : ''} input-reset roboto-style`}
                                        value={usernameState}
                                        onChange={(e) => {
                                            setUsernameState(e.target.value)
                                            if (!profileToBeTranslated) {
                                                setProfileToBeSaved(true)
                                            }
                                        }}
                                        placeholder="username"/>
                        {windowWidth >= 1100 && usernameError &&
                            <div className="add-account-screen-error-messaage">{usernameErrorMessage}</div>}
                    </div>

                </div>
            </div>
            <div className="add-account-screen-bottom-bar">
                <button className="add-account-screen-detect-from-image-button black-button roboto-style"
                        onClick={() => {
                            setDetectFromImage(true)
                        }}>
                    {windowWidth <= 690 ? "Detect" : "Detect From Image"}
                </button>
                {profileToBeTranslated &&
                    < button className="add-account-screen-translate-to-english-button black-button roboto-style"
                             onClick={handleTranslateToEnglish}
                    >
                        {windowWidth <= 690 ? "Translate" : "Translate to english"}
                    </button>}
                {profileToBeSaved &&
                    <button className="add-account-screen-save-button black-button roboto-style"
                            onClick={handleSaveOnClick}>
                        Add
                    </button>}
            </div>
            {detectFromImage &&
                <DetectFromImage forPost={false} forProfile={true} onProfileDetected={handleProfileDataDetected}
                                 onPostDetected={async () => {
                                 }}
                                 onCancel={() => {
                                     setDetectFromImage(false)
                                 }}/>
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
            {(isLoading || isError) && <div className='add-account-popups-container'>
                <CirclesLoading isOpen={isLoading} message={'loading'}/>
                <CustomInfoAlert isOpen={isError} header={"Error Adding Profile"}
                                 message={errorMessage} onDismiss={() => {
                    setIsError(false)
                }}/>
            </div>}
        </div>


    );
};

export default AddAccountScreen;
