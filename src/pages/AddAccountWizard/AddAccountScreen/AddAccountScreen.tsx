import React, {useCallback, useEffect, useState} from 'react';
import "./AddAccountScreen.css"
import {getLogger, usePersistentState, useWindowWidth} from "../../../assets";
import ImageUploader from "../../../components/ImageUploader/ImageUploader";
import DetectFromImage from "../../../components/DetectFromImage/DetectFromImage";
import {DetectProfileResponse} from "../../../assets/Responses/DetectProfileResponse";
import {thunderstorm} from "ionicons/icons";

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
    const [usernameState, setUsernameState] = usePersistentState<string>('username', '');
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

    const handleTranslateToEnglish = useCallback(async () => {
        log('translate the description');
        //TODO: DACA NU TREBUIE TRADUS ATUNCI DOAR NORMALIZEZ TEXTUL!
        //todo: api pentru traducerea doar a descrierii in engleza (mai intai verific daca e empty si apoi daca trebuie tradus)
        setProfileToBeSaved(true)
        setProfileToBeTranslated(false)
    }, [setProfileToBeTranslated, setProfileToBeSaved]);

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
        return !hasError;

    }, [noOfPosts, noOfFollowing, noOfFollowers, usernameState]);

    const handleSaveOnClick = useCallback(async () => {
        log('save edited profile');
        validateInputs().then((result) => {
            if (result) {
                //IF INPUTS ARE VALID, THEN ADD THE EDITED PROFILE
                //todo: API pentru ADAUGAREA profilului, CAND EXTRAG INPUTURILE NUMBER DACA SUNT GOALE LE PUN BY DEFAULT 0 (chiar daca validarea nu lasa userul sa lase inputurile goale la numbers/username),
                // AFISEZ LOADING ICON CAND ON CLICK SAVE

                //todo: DACA APIUL E SUCCES, DOAR ATUNCI APELAM FUNCTIA DE SAVED_SUCCESSFULLY
                props.savedSuccessfully(profilePhotoState ? profilePhotoState : '', usernameState, -2)
            }
        })
    }, [usernameState, profilePhotoState, props, validateInputs]);

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
        } else if(profileData.profile_photo || profileData.username || profileData.no_of_posts || profileData.no_following || profileData.no_followers){
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
        if (profileData.no_of_posts  !== undefined && profileData.no_of_posts != -1)
            setNoOfPosts(profileData.no_of_posts)
        else
            setNoOfPosts(null)

    }, [setDescriptionState, setNoOfFollowers, setNoOfFollowing, setNoOfPosts, setProfilePhotoState, setProfileToBeSaved, setProfileToBeTranslated, setUsernameState]);

    //FUNCTIE CARE STERGE DIN LOCAL STORAGE DATELE PERSISTATE
    const resetProfileForm = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('description');
        localStorage.removeItem('noOfPosts');
        localStorage.removeItem('noOfFollowers');
        localStorage.removeItem('noOfFollowing');
        localStorage.removeItem('profilePhoto');
        localStorage.removeItem('addAccountScreenProfileToBeSaved')
        localStorage.removeItem('addAccountScreenProfileToBeTranslated')
    };

    //PENTRU A STERGE DIN LOCAL STORAGE ATUNCI CAND SE PARASESTE PAGINA
    useEffect(() => {
        return () => {
            resetProfileForm()
        };
    }, []);


    //TODO: DACA NU E INCARCATA NICIO IMAGINE DE PROFIL ATUNCI SE VA TRIMITE LA SERVER IMAGINEA ANONIMA, NU ARE VOIE SA FIE NULL
    //TODO: LOADING ICON/ADDED SUCCESSFULLY - ion modal /NETWORK ERRROR - ion modal
    //TODO: DETECT FROM IMAGE
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
                <DetectFromImage forPost={false} forProfile={true} onProfileDetected={handleProfileDataDetected} onPostDetected={async ()=>{}}
                                 onCancel={() => {
                                     setDetectFromImage(false)
                                 }}/>
            }
        </div>


    );
};

export default AddAccountScreen;
