import React, {useCallback, useState} from 'react';
import "./EditProfilePopUp.css"
import {getLogger, useWindowWidth} from "../../../assets";
import ImageUploader from "../../../components/ImageUploader/ImageUploader";
import DetectFromImage from "../../../components/DetectFromImage/DetectFromImage";

interface EditProfilePopUpProps {
    isOpen: boolean,

    idProfile: number,
    username: string,
    profile_description: string,
    profile_photo?: string,
    no_followers: number,
    no_following: number
    no_of_posts: number,

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

    const handleTranslateToEnglish = useCallback(async () => {
        log('translate the description');
        //todo: api pentru traducerea doar a descrierii in engleza (mai intai verific daca e empty si apoi daca trebuie tradus)
        setProfileToBeSaved(true)
        setProfileToBeTranslated(false)
    }, []);

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
            hasError=true;
        }
        if (!Number.isInteger(noOfFollowers)) {
            setNoOfFollowersErrorMessage('Must be >=0')
            setNoOfFollowersError(true)
            hasError=true
        }
        if (!Number.isInteger(noOfFollowing)) {
            setNoOfFollowingErrorMessage('Must be >=0')
            setNoOfFollowingError(true)
            hasError=true
        }

        // USERNAME CANNOT START WITH WHITE SPACES, AND CANNOT BE NULL
        const trimmed = usernameState.trim();
        if (trimmed.length === 0) {
            setUsernameErrorMessage('Username cannot be empty.')
            setUsernameError(true)
            hasError=true
        }
        if (usernameState.startsWith(' ') || usernameState.endsWith(' ')) {
            setUsernameErrorMessage('Username cannot start/end with a whitespace.');
            setUsernameError(true);
            hasError = true;
        }
        return !hasError;

    }, [noOfPosts,noOfFollowing,noOfFollowers,usernameState]);

    const handleSaveOnClick = useCallback(async () => {
        log('save edited profile');
        validateInputs().then((result)=>{
            if(result){
                //IF INPUTS ARE VALID, THEN SAVE THE EDITED PROFILE
                //todo: API pentru salvarea profilului, CAND EXTRAG INPUTURILE NUMBER DACA SUNT GOALE LE PUN BY DEFAULT 0 (chiar daca validarea nu lasa userul sa lase inputurile goale la numbers/username),
                // AFISEZ LOADING ICON CAND ON CLICK SAVE
                props.closeFn()
            }
        })
    }, [props, validateInputs]);

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
    },[props])

    if (!props.isOpen) return null;

    //TODO: DETECT FROM IMAGE--------------------------------------------------------------------
    return (
        <div className="edit-profile-popup-container">
            <div className="edit-profile-popup-content">

                <div className="edit-profile-popup-cancel-conatiner">
                    <button className="edit-profile-popup-cancel-button roboto-style"
                            onClick={ ()=> {
                                props.closeFn()
                                resetBackValuesOnCancel().then(()=>{})
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
                                src={`data:image/jpeg;base64,${profilePhotoState}`}
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
                        <div className="roboto-style">Description</div>
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
                            {windowWidth>=1100 && noOfPostsError && <div className="edit-popup-profile-error-messaage">{noOfPostsErrorMessage}</div>}
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
                            {windowWidth>=1100 && noOfFollowersError && <div className="edit-popup-profile-error-messaage">{noOfFollowersErrorMessage}</div>}

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
                            {windowWidth>=1100 && noOfFollowingError && <div className="edit-popup-profile-error-messaage">{noOfFollowingErrorMessage}</div>}
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
                            {windowWidth>=1100 && usernameError && <div className="edit-popup-profile-error-messaage">{usernameErrorMessage}</div>}
                        </div>

                    </div>
                </div>
                <div className="edit-profile-popup-bottom-bar">
                    <button className="edit-profile-popup-detect-from-image-button grey-button roboto-style"
                    onClick={()=>{
                        setDetectFromImage(true)
                    }}>
                        { windowWidth <= 690 ? "Detect" :"Detect From Image" }
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
            {detectFromImage && <DetectFromImage forPost={false} forProfile={true} onCancel={() => {
                setDetectFromImage(false)
            }}/>
            }
        </div>
    );
};

export default EditProfilePopUp;
