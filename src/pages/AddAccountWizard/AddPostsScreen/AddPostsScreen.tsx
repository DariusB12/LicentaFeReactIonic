import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import "./AddPostsScreen.css"
import {getLogger, usePersistentState, useWindowWidth} from "../../../assets";
import {motion} from "framer-motion";
import GenericList from "../../../components/GenericList/GenericList";
import {PostPhoto} from "../../../assets/entities/PostPhoto";
import {PostComment} from "../../../assets/entities/PostComment";
import CommentsItem from "../../../components/CommentsItem/CommentsItem";
import {IonDatetime, IonDatetimeButton, IonModal, IonToast} from "@ionic/react";
import * as H from "history";
import DetectFromImage from "../../../components/DetectFromImage/DetectFromImage";
import {DetectPostResponse} from "../../../assets/Responses/yoloResponses/DetectPostResponse";
import {Preferences} from "@capacitor/preferences";
import {NllbTranslationContext} from "../../../providers/NllbTranslationProvider/NllbTranslationContext";
import {AuthContext} from "../../../providers/AuthProvider/AuthContext";
import CirclesLoading from "../../../components/CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../../../components/CustomInfoAlert/CustomInfoAlert";
import {
    TranslatePostRequest
} from "../../../assets/Requests/nllbTranslationRequest/TranslatePostRequest";
import {SocialAccountPostsContext} from "../../../providers/SocialAccountPostsProvider/SocialAccountPostsContext";
import {AddSocialAccountPostReq} from "../../../assets/Requests/socialAccountPostReq/AddSocialAccountPostReq";

interface AddPostsScreenProps {
    idProfile: number,
    accountPhoto: string | undefined,
    accountUsername: string
    history: H.History<unknown>;
}

const log = getLogger('AddPostsScreen');

const AddPostsScreen: React.FC<AddPostsScreenProps> = ({idProfile, accountUsername, accountPhoto, history}) => {
    log('render idPofile:',idProfile)
    const [photoIndex, setPhotoIndex] = usePersistentState<number>('postScreenPhotoIndex', 0);

    const [photos, setPhotos] = usePersistentState<PostPhoto[]>('postScreenPhotos', []);
    const [description, setDescription] = usePersistentState<string>('postScreenDescription', '');
    const [noLikes, setNoLikes] = usePersistentState<number | null>('postScreenNoLikes', null);
    const [noComments, setNoComments] = usePersistentState<number | null>('postScreenNoComments', null);
    const [comments, setComments] = usePersistentState<PostComment[]>('postScreenComments', []);
    const [datePosted, setDatePosted] = usePersistentState<Date>('postScreenDatePosted', new Date());

    const [commentsGeneratedId, setCommentsGeneratedId] = usePersistentState<number>('postScreenCommentsGeneratedId', -1);
    const [photosGeneratedId, setPhotosGeneratedId] = usePersistentState<number>('postScreenPhotosGeneratedId', -1);

    const [lockedLikes, setLockedLikes] = useState<boolean>(noLikes == -1);
    const [lockedComments, setLockedComments] = useState<boolean>(noComments == -1);

    const [profileToBeSaved, setProfileToBeSaved] = usePersistentState<boolean>('postScreenProfileToBeSaved', false);
    const [profileToBeTranslated, setProfileToBeTranslated] = usePersistentState<boolean>('postScreenProfileToBeTranslated', false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef(null);

    const [noOfLikesErrorMessage, setNoOfLikesErrorMessage] = useState('');
    const [noOfLikesError, setNoOfLikesError] = useState(false);
    const [noOfCommentsErrorMessage, setNoOfCommentsErrorMessage] = useState('');
    const [noOfCommentsError, setNoOfCommentsError] = useState(false);
    const [dateErrorMessage, setDateErrorMessage] = useState('');
    const [dateError, setDateError] = useState(false);
    const [photosErrorMessage, setPhotosErrorMessage] = useState('');
    const [photosError, setPhotosError] = useState(false);
    const [commentsErrorMessage, setCommentsErrorMessage] = useState('');
    const [commentsError, setCommentsError] = useState(false);

    const [detectFromImage, setDetectFromImage] = useState<boolean>(false);
    const windowWidth = useWindowWidth()
    //FUNCTIE CARE STERGE DIN LOCAL STORAGE DATELE PERSISTATE
    const resetPostsForm = useCallback(async () => {
        await Preferences.remove({key: 'postScreenPhotoIndex'});
        await Preferences.remove({key: 'postScreenPhotos'});
        await Preferences.remove({key: 'postScreenDescription'});
        await Preferences.remove({key: 'postScreenNoLikes'});
        await Preferences.remove({key: 'postScreenNoComments'});
        await Preferences.remove({key: 'postScreenComments'});
        await Preferences.remove({key: 'postScreenDatePosted'});
        await Preferences.remove({key: 'postScreenCommentsGeneratedId'});
        await Preferences.remove({key: 'postScreenPhotosGeneratedId'});
        await Preferences.remove({key: 'postScreenProfileToBeSaved'});
        await Preferences.remove({key: 'postScreenProfileToBeTranslated'});
    }, [])
    //RESETS ALL THE STATES TO DEFAULT VALUES IF THE USER WANTS TO ADD ANOTHER POST
    const resetAllStates = useCallback(async () => {
        setPhotoIndex(0);
        setPhotos([]);
        setDescription('');
        setNoLikes(null);
        setNoComments(null);
        setComments([]);
        setDatePosted(new Date());
        setCommentsGeneratedId(-1);
        setPhotosGeneratedId(-1);
        setLockedLikes(false);
        setLockedComments(false);
        setProfileToBeSaved(false);
        setProfileToBeTranslated(false);

    }, [setComments, setCommentsGeneratedId, setDatePosted, setDescription, setNoComments, setNoLikes, setPhotoIndex, setPhotos, setPhotosGeneratedId, setProfileToBeSaved, setProfileToBeTranslated])


    //PENTRU A STERGE DIN LOCAL STORAGE ATUNCI CAND SE PARASESTE PAGINA (LA UNMOUNT)
    useEffect(() => {
        return () => {
            resetPostsForm().then()
        };
    }, [resetPostsForm]);

    const handlePostDataDetected = useCallback(async (postData: DetectPostResponse) => {
        log('setting the detected post data');
        //RESET ALL THE ERRORS, PROPOSING NO ERROR EXISTS
        setNoOfLikesErrorMessage('')
        setNoOfLikesError(false)
        setNoOfCommentsErrorMessage('')
        setNoOfCommentsError(false)
        setDateErrorMessage('')
        setDateError(false)
        setPhotosErrorMessage('')
        setPhotosError(false)
        setCommentsErrorMessage('')
        setCommentsError(false)

        if (postData.description || postData.comments.length > 0) {
            setProfileToBeTranslated(true)
            setProfileToBeSaved(false)
        } else if (postData.post_photo || postData.no_comments || postData.no_likes || postData.date) {
            setProfileToBeSaved(true)
            setProfileToBeTranslated(false)
        }

        if (postData.post_photo) {
            //if a photo exists, reset the photos list
            const postPhoto: PostPhoto = {id: -1, photo: postData.post_photo}
            setPhotosGeneratedId(-2)
            setPhotos([postPhoto])
            setPhotoIndex(0)
        } else {
            //set empty photos list
            setPhotoIndex(0)
            setPhotosGeneratedId(-1)
            setPhotos([])
        }

        setDescription(postData.description ? postData.description : '')

        if (postData.no_comments !== undefined && postData.no_comments !== -1) {
            setNoComments(postData.no_comments)
            setLockedComments(false);
        } else {
            setNoComments(-1)
            setLockedComments(true);
        }

        if (postData.no_likes !== undefined && postData.no_likes != -1) {
            setNoLikes(postData.no_likes)
            setLockedLikes(false);
        } else {
            setNoLikes(-1)
            setLockedLikes(true);
        }

        if (postData.date) {
            // EXTRACT ONLY THE DATE WITHOUT TIME
            const dateStr = postData.date.split('T')[0];
            const localDate = new Date(dateStr);
            setDatePosted(localDate);
        } else
            setDatePosted(new Date())

        if (postData.comments.length > 0) {
            setCommentsGeneratedId(-1);
            setComments([]);

            let tempId = -1;
            const newComments = postData.comments.map(comm => {
                const newComment = {id: tempId, comment: comm};
                tempId--;
                return newComment;
            });

            setComments(newComments);
            setCommentsGeneratedId(tempId);
        } else {
            setCommentsGeneratedId(-1);
            setComments([]);
        }

    }, [setComments, setCommentsGeneratedId, setDatePosted, setDescription, setNoComments, setNoLikes, setPhotoIndex, setPhotos, setPhotosGeneratedId, setProfileToBeSaved, setProfileToBeTranslated]);

    const {translatePost} = useContext(NllbTranslationContext)
    const {setTokenExpired} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isOpenToastNotification, setIsOpenToastNotification] = useState<boolean>(false)
    const [toastNotificationMessage, setToastNotificationMessage] = useState<string>('');

    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');


    const handleTranslateToEnglish = useCallback(async () => {
        log('translate the post data');
        //RESET ALL THE ERRORS, PROPOSING NO ERROR EXISTS
        setNoOfLikesErrorMessage('')
        setNoOfLikesError(false)
        setNoOfCommentsErrorMessage('')
        setNoOfCommentsError(false)
        setDateErrorMessage('')
        setDateError(false)
        setPhotosErrorMessage('')
        setPhotosError(false)
        setCommentsErrorMessage('')
        setCommentsError(false)

        // SET TOAST NOTIFY TO FALSE
        // AND SLEEP SO THAT THE TOAST TIMEOUT IS RESET (IF OPENING MORE TOAST ONE AFTER ANOTHER FORCE TO RERENDER)
        setIsOpenToastNotification(false)
        await new Promise(resolve => setTimeout(resolve, 5))


        const postReq: TranslatePostRequest = {
            comments: comments.map((comm) => ({
                id: comm.id,
                comment: comm.comment
            })),
            description: description
        }

        setIsLoading(true)
        log('POST DATA SENT:', postReq)
        const response = await translatePost?.(postReq)
        setIsLoading(false)

        //200 OK data detected
        if (response?.status_code == 200) {
            setDescription(response.description ? response.description : '')
            setComments(response.comments ? response.comments : [])

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
    }, [comments, description, setComments, setDescription, setProfileToBeSaved, setProfileToBeTranslated, setTokenExpired, translatePost]);

    const validateInputs = useCallback(async (): Promise<boolean> => {
        log('validating the inputs')
        //RESET ALL THE ERRORS, PROPOSING NO ERROR EXISTS
        setNoOfLikesErrorMessage('')
        setNoOfLikesError(false)
        setNoOfCommentsErrorMessage('')
        setNoOfCommentsError(false)
        setDateErrorMessage('')
        setDateError(false)
        setPhotosErrorMessage('')
        setPhotosError(false)
        setCommentsErrorMessage('')
        setCommentsError(false)

        let hasError = false;
        // NUMBER INPUTS SHOULD NOT BE FLOAT (like '2.0')
        if (!Number.isInteger(noLikes)) {
            setNoOfLikesErrorMessage('required')
            setNoOfLikesError(true)
            hasError = true;
        }
        if (!Number.isInteger(noComments)) {
            setNoOfCommentsErrorMessage('required')
            setNoOfCommentsError(true)
            hasError = true
        }
        //DATE CANNOT BE IN FUTURE
        if (datePosted > new Date()) {
            setDateErrorMessage('Date cannot be in future')
            setDateError(true)
            hasError = true
        }
        //CANT HAVE NO PHOTOS
        if (photos.length <= 0) {
            setPhotosErrorMessage('Upload at least one photo.')
            setPhotosError(true)
            hasError = true
        }
        //CANNOT HAVE EMPTY COMMENTS
        comments.forEach(c => {
            if (c.comment.trim() === '') {
                setCommentsErrorMessage('Delete empty comments')
                setCommentsError(true)
                hasError = true
            }
        })

        return hasError;

    }, [noLikes, noComments, datePosted, photos, comments]);

    const {addSocialAccountPost} = useContext(SocialAccountPostsContext)
    
    const handleSaveOnClick = useCallback(async () => {
        log('save post');
        const hasError = await validateInputs()
        if (!hasError) {
            // SET TOAST NOTIFY TO FALSE
            // AND SLEEP SO THAT THE TOAST TIMEOUT IS RESET (IF OPENING MORE TOAST ONE AFTER ANOTHER FORCE TO RERENDER)
            setIsOpenToastNotification(false)
            await new Promise(resolve => setTimeout(resolve, 5))
            
            //IF INPUTS ARE VALID, THEN SAVE THE EDITED POST
            log('add post for account with id:', idProfile)
            // log("Calling addSocialAccountPost", addSocialAccountPost);

            const toAddPostRequest: AddSocialAccountPostReq = {
                description: description,
                noLikes: noLikes ? noLikes : -1,
                noComments: noComments ? noComments : -1,
                datePosted: datePosted ? datePosted.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                comments: comments.map((comment) => comment.comment),
                photos: photos.map((photo) => photo.photo),
                social_account_id: idProfile
            }

            setIsLoading(true)
            const response = await addSocialAccountPost?.(toAddPostRequest)
            setIsLoading(false)
            //200 OK data detected
            if (response?.status_code == 200) {
                //SHOW SUCCESS ADDED TOAST NOTIFICATION
                setIsOpenToastNotification(true)
                setToastNotificationMessage('Post added successfully')
                // RESET BACK ALL THE FORM SO THAT ANOTHER POST CAN BE ADDED
                await resetPostsForm()
                await resetAllStates()
            } else if (response?.status_code == 422) {
                //422 Unprocessable Content => frontend error
                setErrorMessage('Could not save the post')
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
    }, [validateInputs, idProfile, description, noLikes, noComments, datePosted, comments, photos, addSocialAccountPost, resetPostsForm, resetAllStates, setTokenExpired]);


    const handleOnClickCancel = useCallback(async () => {
        log('cancel add post');
        resetPostsForm().then()
        if (history.location.pathname !== `/accountDetails/${idProfile}`) {
            history.push(`/accountDetails/${idProfile}`)
        }

    }, [history, idProfile, resetPostsForm]);

    const isValidImageFile = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png'];
        return validTypes.includes(file.type);
    };

    const handleFile = (file: File) => {
        if (!isValidImageFile(file)) {
            alert('Only .png, .jpg, or .jpeg files are allowed.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;

            const postPhoto: PostPhoto = {id: photosGeneratedId, photo: result}
            setPhotosGeneratedId(prevState => prevState - 1)
            setPhotos(prev => [postPhoto, ...prev])
            setPhotoIndex(0)

            if (!profileToBeTranslated) {
                setProfileToBeSaved(true)
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file)
                    handleFile(file);
                break;
            }
        }
    };

    const uploadButtonSection = (
        <div className='add-posts-screen-div-upload-image-options'>
            <input
                type="file"
                accept=".png,.jpg,.jpeg"
                ref={fileInputRef}
                style={{display: 'none'}}
                onChange={handleFileChange}
            />
            <button className='add-posts-screen-add-photo-button grey-button roboto-style'
                    onClick={openFileDialog}>
                <img src="/icons/add.png" alt="add_img"
                     className="add-posts-screen-add-icon icon-size"/>
                {windowWidth >= 1100 ? 'add another photo' : 'add photo'}
            </button>
            <div className='add-posts-screen-or-text roboto-style'>or</div>
            <input
                ref={inputRef}
                value=''
                onChange={() => {
                }}
                className="add-posts-screen-input-ctrl-v input-reset roboto-style"
                placeholder="Ctrl+V in this input"
                onPaste={handlePaste}
            />
        </div>)
    const likesSection = (<div className='add-posts-screen-likes-container'>
        <img src="/icons/heart.png" alt="heart_img"
             className="add-posts-screen-heart-icon icon-size"/>
        <input type="number"
               className={`add-posts-screen-likes-input add-posts-screen-inputs input-reset roboto-style ${noOfLikesError ? 'red-border-input' : ''}`}
               value={noLikes == -1 ? '' : noLikes == null ? '' : noLikes}
               disabled={noLikes == -1}
               onChange={(e) => {
                   const val = e.target.value;
                   setNoLikes(val === '' ? null : Number(val));
                   if (!profileToBeTranslated) {
                       setProfileToBeSaved(true)
                   }
               }}
               onKeyDown={(e) => {
                   if (e.key === '-' || e.key === '+' || e.key === 'e') {
                       e.preventDefault();
                   }
               }}
               placeholder={noLikes == -1 ? 'private' : `likes no`}/>
        {windowWidth >= 1100 && 'likes'}
        <button
            className={`add-posts-screen-like-button ${lockedLikes ? 'add-posts-screen-lock-clicked' : ''}`}
            onClick={() => {
                if (lockedLikes) {
                    setNoLikes(null)
                }
                if (!lockedLikes) {
                    setNoLikes(-1)
                }
                setLockedLikes(prevState => !prevState)
                if (!profileToBeTranslated) {
                    setProfileToBeSaved(true)
                }
            }}>
            <img src="/icons/lock.png" alt="lock_img"
                 className="add-posts-screen-lock-icon icon-size"/>
        </button>
        {windowWidth >= 700 && noOfLikesError &&
            <div className="add-posts-screen-error-messaage">{noOfLikesErrorMessage}</div>}

    </div>)
    const commentsSection = (<div className='add-posts-screen-comments-container'>
        <img src="/icons/chat.png" alt="chat_img"
             className="add-posts-screen-chat-icon icon-size"/>
        <input type="number"
               className={`add-posts-screen-comments-input add-posts-screen-inputs input-reset roboto-style ${noOfCommentsError ? 'red-border-input' : ''}`}
               value={noComments == -1 ? '' : noComments == null ? '' : noComments}
               disabled={noComments == -1}
               onChange={(e) => {
                   const val = e.target.value;
                   setNoComments(val === '' ? null : Number(val));
                   if (!profileToBeTranslated) {
                       setProfileToBeSaved(true)
                   }
               }}
               onKeyDown={(e) => {
                   if (e.key === '-' || e.key === '+' || e.key === 'e') {
                       e.preventDefault();
                   }
               }}
               placeholder={noComments == -1 ? 'private' : (windowWidth >= 1100 ? 'comments no' : 'comm no')}/>
        {windowWidth >= 1100 && 'comments'}
        <button
            className={`add-posts-screen-comment-button ${lockedComments ? 'add-posts-screen-lock-clicked' : ''}`}
            onClick={() => {
                if (lockedComments) {
                    setNoComments(null)
                }
                if (!lockedComments) {
                    setNoComments(-1)
                }
                setLockedComments(prevState => !prevState)
                if (!profileToBeTranslated) {
                    setProfileToBeSaved(true)
                }
            }}>
            <img src="/icons/lock.png" alt="lock_img"
                 className="add-posts-screen-lock-icon icon-size"/>
        </button>
        {windowWidth >= 700 && noOfCommentsError &&
            <div className="add-posts-screen-error-messaage">{noOfCommentsErrorMessage}</div>}

    </div>)
    const dateSection = (<div className='add-posts-screen-date-posted-container'>
        {windowWidth >= 1100 && 'Date posted'}

        <div className="add-posts-screen-date-input-and-message-container">
            <IonDatetimeButton datetime="datetime"></IonDatetimeButton>

            <IonModal keepContentsMounted={true}>
                <IonDatetime
                    id="datetime"
                    presentation="date"
                    value={datePosted.toISOString()}
                    className={`add-posts-screen-date-input add-posts-screen-inputs input-reset roboto-style ${dateError ? 'red-border-input' : ''}`}
                    onIonChange={(e) => {
                        const val = e.detail.value;
                        if (val) {
                            setDatePosted(new Date(String(val)));
                            if (!profileToBeTranslated) {
                                setProfileToBeSaved(true);
                            }
                        }
                    }}
                />
            </IonModal>
            {windowWidth >= 700 && dateError &&
                <div className="add-posts-screen-error-messaage">{dateErrorMessage}</div>}
        </div>
    </div>)

    //TODO: LOADING ICON/ADDED SUCCESSFULLY - ION MODAL BTTM/NETWORK ERRROR - ION MODAL BTTM
    return (
        <div className="add-posts-screen-content">
            <div className='add-posts-screen-title'>
                Add post
            </div>

            <div className="add-posts-screen-middle-content">

                <div className='add-posts-screen-content-left'>
                    <div className='add-posts-screen-photo-username-container roboto-style'>
                        <div className='add-posts-screen-photo-container'>
                            {accountPhoto ?
                                <img
                                    src={accountPhoto}
                                    alt="profile_img"
                                    className="add-post-screen-profile-image"
                                /> :
                                <img
                                    src="/icons/anonim_image.png"
                                    alt="anonim_image"
                                    className="add-post-screen-profile-image"
                                />
                            }
                        </div>

                        <div className='add-posts-screen-username-container'>
                            {accountUsername}
                        </div>
                    </div>

                    <div className="add-posts-screen-item-photo">
                        {photos.length == 0 &&
                            <div>No photos uploaded</div>
                        }
                        {photosError && photos.length == 0 &&
                            <div className='add-posts-screen-error-messaage'>{photosErrorMessage}</div>
                        }
                        {photos.length != 0 &&
                            <motion.img
                                key={photoIndex} // This triggers re-animation when photoIndex changes
                                src={photos?.at(photoIndex)?.photo}
                                alt="post_img"
                                className="add-posts-screen-item-photo-image"
                                initial={{x: 0, opacity: 0}}
                                animate={{x: 0, opacity: 1}}
                                exit={{x: 0, opacity: 0}}
                                transition={{duration: 0.2}}
                            />}
                        {photos.length != 0 && <button className="add-posts-screen-edit-post-button roboto-style"
                                                       onClick={() => {
                                                           const toDeletePhoto = photos.at(photoIndex);
                                                           setPhotoIndex(prevState => {
                                                               if (prevState == 0 && photos.length > 1)
                                                                   return prevState
                                                               if (prevState == photos.length - 1 && photos.length > 1)
                                                                   return prevState - 1
                                                               if (photos.length > 1)
                                                                   return prevState
                                                               else return -1
                                                           });
                                                           setPhotos(prevState =>
                                                               prevState.filter(p => p.id !== toDeletePhoto?.id)
                                                           );
                                                           if (!profileToBeTranslated) {
                                                               setProfileToBeSaved(true)
                                                           }
                                                       }}>
                            <img src="/icons/delete.png" alt="delete_img"
                                 className="icon-size"/>
                        </button>}
                        {photoIndex > 0 &&
                            <button className="add-posts-screen-item-arrow-back-button" onClick={() => {
                                setPhotoIndex(prevState => prevState - 1);
                            }}>
                                <img src="/icons/arrow_back.png" alt="back_img"
                                     className="add-posts-screen-item-arrow-back-icon icon-size"/>
                            </button>
                        }
                        {photoIndex < photos.length - 1 &&
                            <button className="add-posts-screen-item-arrow-forward-button" onClick={() => {
                                setPhotoIndex(prevState => prevState + 1);
                            }}>
                                <img src="/icons/arrow_forward.png" alt="forward_img"
                                     className="add-posts-screen-item-arrow-forward-icon icon-size"/>
                            </button>
                        }

                    </div>
                    {windowWidth >= 1100 && uploadButtonSection}
                    {windowWidth >= 1100 && likesSection}
                    {windowWidth >= 1100 && commentsSection}
                    {windowWidth >= 1100 && dateSection}

                </div>
                <div style={windowWidth > 700 ? {display: 'none'} : {}}>
                    {windowWidth < 700 && dateError &&
                        <div className="add-posts-screen-error-messaage">{dateErrorMessage}</div>}
                </div>
                <div className='add-posts-screen-mobile-responsive-div'
                     style={windowWidth > 1100 ? {display: 'none'} : {}}>
                    <div className='add-posts-screen-mobile-responsive-add-and-date-container'>
                        {windowWidth < 1100 && uploadButtonSection}
                        {windowWidth < 1100 && dateSection}
                    </div>
                    <div className='add-posts-screen-mobile-responsive-likes-and-comments-container'>
                        {windowWidth < 1100 && likesSection}
                        {windowWidth < 1100 && commentsSection}
                    </div>
                </div>
                <div className='add-posts-screen-content-right'>
                    <div className='add-posts-screen-description-text roboto-style'>Description</div>
                    <textarea
                        className="add-posts-screen-post-description-input add-posts-screen-inputs input-reset roboto-style"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value)
                            setProfileToBeTranslated(true)
                            setProfileToBeSaved(false)
                        }}
                        placeholder="post description"
                    />
                    <div className='add-posts-screen-post-comments-button-content roboto-style'>
                        Comments
                        <button className='add-posts-screen-add-button grey-button roboto-style' onClick={
                            () => {
                                const newComment = {id: commentsGeneratedId, comment: ''};
                                setComments(prev => [newComment, ...prev]);
                                setCommentsGeneratedId(prevId => prevId - 1);
                            }
                        }>
                            <img src="/icons/add.png" alt="add_img"
                                 className="add-posts-screen-add-icon icon-size"/>
                            {windowWidth >= 1100 ? 'add comment' : 'add'}
                        </button>
                        {commentsError &&
                            <div className='add-posts-screen-error-messaage'>{commentsErrorMessage}</div>}
                    </div>

                    <GenericList className='add-posts-screen-comments-list' items={comments.map((comment) =>
                        <CommentsItem
                            key={comment.id}
                            comment={comment}
                            onDelete={(id) => {
                                setComments(prevState =>
                                    prevState.filter(c => c.id !== id)
                                );
                                if (!profileToBeTranslated) {
                                    setProfileToBeSaved(true)
                                }
                            }}
                            onCommentChanged={(id, newText) => {
                                setComments(prevState =>
                                    prevState.map(c =>
                                        c.id === id ? {...c, comment: newText} : c
                                    )
                                );
                                setProfileToBeTranslated(true)
                                setProfileToBeSaved(false)
                            }}
                            showErrorBorder={commentsError && comment.comment.trim() === ''}
                        />
                    )}/>
                </div>
            </div>

            <div className="add-posts-screen-bottom-bar">

                <div className='add-posts-screen-right-content'>
                    <button className="add-posts-screen-cancel-button roboto-style"
                            onClick={handleOnClickCancel}>
                        <img src="/icons/close.png" alt="close_img"
                             className="icon-size"/>
                        {windowWidth >= 1100 && 'Cancel'}
                    </button>
                    <button className="add-posts-screen-detect-from-image-button black-button roboto-style"
                            onClick={() => {
                                setDetectFromImage(true)
                            }}>
                        {windowWidth >= 1100 ? 'Detect From Image' : 'Detect'}
                    </button>
                    {profileToBeTranslated &&
                        < button className="add-posts-screen-translate-to-english-button black-button roboto-style"
                                 onClick={handleTranslateToEnglish}>
                            {windowWidth >= 1100 ? 'Translate to english' : 'Translate'}
                        </button>
                    }
                    {profileToBeSaved &&
                        <button className="add-posts-screen-save-button black-button roboto-style"
                                onClick={handleSaveOnClick}>
                            Add
                        </button>
                    }
                </div>

            </div>
            {detectFromImage &&
                <DetectFromImage forPost={true} forProfile={false} onPostDetected={handlePostDataDetected}
                                 onProfileDetected={async () => {
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
            {(isLoading || isError) && <div className='add-post-popups-container'>
                <CirclesLoading isOpen={isLoading} message={'Loading'}/>
                <CustomInfoAlert isOpen={isError} header={"Error Detecting Data"}
                                 message={errorMessage} onDismiss={() => {
                    setIsError(false)
                }}/>
            </div>}
        </div>
    );
};

export default AddPostsScreen;
