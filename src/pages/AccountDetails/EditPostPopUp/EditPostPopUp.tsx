import React, {useCallback, useContext, useRef, useState} from 'react';
import "./EditPostPopUp.css"
import {getLogger, useWindowWidth} from "../../../assets";
import {motion} from "framer-motion";
import GenericList from "../../../components/GenericList/GenericList";
import {PostPhoto} from "../../../assets/entities/PostPhoto";
import {PostComment} from "../../../assets/entities/PostComment";
import CommentsItem from "../../../components/CommentsItem/CommentsItem";
import {IonDatetime, IonDatetimeButton, IonModal, IonToast} from "@ionic/react";
import DetectFromImage from "../../../components/DetectFromImage/DetectFromImage";
import {DetectPostResponse} from "../../../assets/Responses/yoloResponses/DetectPostResponse";
import {TranslatePostRequest} from "../../../assets/Requests/nllbTranslationRequest/TranslatePostRequest";
import CirclesLoading from "../../../components/CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../../../components/CustomInfoAlert/CustomInfoAlert";
import {NllbTranslationContext} from "../../../providers/NllbTranslationProvider/NllbTranslationContext";
import {AuthContext} from "../../../providers/AuthProvider/AuthContext";
import {AddSocialAccountPostReq} from "../../../assets/Requests/socialAccountPostReq/AddSocialAccountPostReq";
import {SocialAccountPostsContext} from "../../../providers/SocialAccountPostsProvider/SocialAccountPostsContext";
import {UpdateSocialAccountPostReq} from "../../../assets/Requests/socialAccountPostReq/UpdateSocialAccountPostReq";

interface EditPostPopUpProps {
    isOpen: boolean,

    forAdd: boolean,
    forEdit: boolean,

    idPost?: number,
    idProfile: number,

    photos?: PostPhoto[],
    description?: string,
    no_likes?: number,
    no_comments?: number,
    comments?: PostComment[],
    date_posted?: Date

    addedSuccessfully: () => void
    editedSuccessfully: () => void

    closeFn: () => void
}

const log = getLogger('EditPostPopUp');

const EditPostPopUp: React.FC<EditPostPopUpProps> = (props) => {
    const [photoIndex, setPhotoIndex] = useState<number>(0);

    const [photos, setPhotos] = useState<PostPhoto[]>(props.photos != undefined ? props.photos : []);
    const [description, setDescription] = useState<string>(props.description != undefined ? props.description : '');
    const [noLikes, setNoLikes] = useState<number | null>(props.no_likes != undefined ? props.no_likes : null);
    const [noComments, setNoComments] = useState<number | null>(props.no_comments != undefined ? props.no_comments : null);
    const [comments, setComments] = useState<PostComment[]>(props.comments != undefined ? props.comments : []);
    const [datePosted, setDatePosted] = useState<Date>(props.date_posted != undefined ? props.date_posted : new Date());

    const [commentsGeneratedId, setCommentsGeneratedId] = useState<number>(-1);
    const [photosGeneratedId, setPhotosGeneratedId] = useState<number>(-1);

    const [lockedLikes, setLockedLikes] = useState<boolean>(noLikes == -1);
    const [lockedComments, setLockedComments] = useState<boolean>(noComments == -1);

    const [profileToBeSaved, setProfileToBeSaved] = useState<boolean>(false);
    const [profileToBeTranslated, setProfileToBeTranslated] = useState<boolean>(false);

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

    const {addSocialAccountPost, updateSocialAccountPost} = useContext(SocialAccountPostsContext)

    const handleSaveOnClick = useCallback(async () => {
        log('save post');
        const hasError = await validateInputs()
        if (!hasError) {
            // SET TOAST NOTIFY TO FALSE
            // AND SLEEP SO THAT THE TOAST TIMEOUT IS RESET (IF OPENING MORE TOAST ONE AFTER ANOTHER FORCE TO RERENDER)
            setIsOpenToastNotification(false)
            await new Promise(resolve => setTimeout(resolve, 5))


            const toAddPostRequest: AddSocialAccountPostReq = {
                description: description,
                noLikes: noLikes ? noLikes : -1,
                noComments: noComments ? noComments : -1,
                datePosted: datePosted ? datePosted.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                comments: comments.map((comment) => comment.comment),
                photos: photos.map((photo) => photo.photo_url).filter(photo => photo !== undefined),
                social_account_id: props.idProfile
            }

            const toUpdatePostRequest: UpdateSocialAccountPostReq = {
                id: props.idPost ? props.idPost : -1,
                description: description,
                no_likes: noLikes ? noLikes : -1,
                no_comments: noComments ? noComments : -1,
                date_posted: datePosted ? datePosted.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],

                comments: comments.map((comment) => {
                    return {
                        id: comment.id,
                        comment: comment.comment
                    }
                }),
                photos: photos.filter(photo => photo.photo_url != undefined).map((photo) => {
                    return {
                        id: photo.id,
                        photo_url: photo.photo_url
                    } as {id:number,photo_url:string}
                })
            }

            log('add/update post for account with id:', props.idProfile)

            //IF INPUTS ARE VALID, THEN ADD/UPDATE THE POST
            setIsLoading(true)
            const response = props.forAdd ? await addSocialAccountPost?.(toAddPostRequest) : await updateSocialAccountPost?.(toUpdatePostRequest)
            setIsLoading(false)

            //200 OK data detected
            if (response?.status_code == 200) {
                if (props.forAdd) {
                    log('post added successfully')
                    props.addedSuccessfully()
                } else {
                    log('post updated successfully')
                    props.editedSuccessfully()
                }
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
    }, [validateInputs, description, noLikes, noComments, datePosted, comments, photos, props, addSocialAccountPost, setTokenExpired]);

    log('render')

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
            const postPhoto: PostPhoto = {id: -1, photo_url: postData.post_photo}
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


    if (!props.isOpen) return null;

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
            const postPhoto: PostPhoto = {id: photosGeneratedId, photo_url: result}
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
        <div className='edit-post-popup-div-upload-image-options'>
            <input
                type="file"
                accept=".png,.jpg,.jpeg"
                ref={fileInputRef}
                style={{display: 'none'}}
                onChange={handleFileChange}
            />
            <button className='edit-post-popup-add-photo-button grey-button roboto-style'
                    onClick={openFileDialog}>
                <img src="/icons/add.png" alt="add_img"
                     className="edit-post-popup-add-icon icon-size"/>
                {windowWidth >= 1100 ? 'add another photo' : 'add photo'}
            </button>
            <div className='edit-post-popup-or-text roboto-style'>or</div>
            <input
                ref={inputRef}
                value=''
                onChange={() => {
                }}
                className="edit-post-popup-input-ctrl-v input-reset roboto-style"
                placeholder="Ctrl+V in this input"
                onPaste={handlePaste}
            />
        </div>)
    const likesSection = (<div className='edit-post-popup-likes-container'>
        <img src="/icons/heart.png" alt="heart_img"
             className="edit-post-popup-heart-icon icon-size"/>
        <input type="number"
               className={`edit-post-popup-likes-input edit-post-inputs input-reset roboto-style ${noOfLikesError ? 'red-border-input' : ''}`}
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
            className={`edit-post-popup-like-button ${lockedLikes ? 'edit-post-popup-lock-clicked' : ''}`}
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
                 className="edit-post-popup-lock-icon icon-size"/>
        </button>
        {windowWidth >= 700 && noOfLikesError &&
            <div className="edit-post-popup-error-messaage">{noOfLikesErrorMessage}</div>}

    </div>)
    const commentsSection = (<div className='edit-post-popup-comments-container'>
        <img src="/icons/chat.png" alt="chat_img"
             className="edit-post-popup-chat-icon icon-size"/>
        <input type="number"
               className={`edit-post-popup-comments-input edit-post-inputs input-reset roboto-style ${noOfCommentsError ? 'red-border-input' : ''}`}
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
            className={`edit-post-popup-comment-button ${lockedComments ? 'edit-post-popup-lock-clicked' : ''}`}
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
                 className="edit-post-popup-lock-icon icon-size"/>
        </button>
        {windowWidth >= 700 && noOfCommentsError &&
            <div className="edit-post-popup-error-messaage">{noOfCommentsErrorMessage}</div>}

    </div>)
    const dateSection = (<div className='edit-post-popup-date-posted-container'>
        {windowWidth >= 1100 && 'Date posted'}

        <div className="edit-post-popup-date-input-and-message-container">
            <IonDatetimeButton datetime="datetime"></IonDatetimeButton>

            <IonModal keepContentsMounted={true}>
                <IonDatetime
                    id="datetime"
                    presentation="date"
                    value={datePosted.toISOString()}
                    className={`edit-post-popup-date-input edit-post-inputs input-reset roboto-style ${dateError ? 'red-border-input' : ''}`}
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
                <div className="edit-post-popup-error-messaage">{dateErrorMessage}</div>}
        </div>
    </div>)
    return (
        <div className="edit-post-popup-container">
            <div className="edit-post-popup-content">
                <div className="edit-post-popup-cancel-conatiner">
                    <button className="edit-post-popup-cancel-button roboto-style"
                            onClick={() => {
                                props.closeFn()
                            }
                            }>Cancel <img src="/icons/close.png" alt="close_img"
                                          className="icon-size"/>
                    </button>
                </div>

                <div className="edit-post-popup-middle-content">
                    <div className='edit-post-popup-content-left'>

                        <div className="edit-post-popup-item-photo">
                            {photos.length == 0 &&
                                <div>No photos uploaded</div>
                            }
                            {photosError && photos.length == 0 &&
                                <div className='edit-popup-profile-error-messaage'>{photosErrorMessage}</div>
                            }
                            {photos.length != 0 &&
                                <motion.img
                                    key={photoIndex} // This triggers re-animation when photoIndex changes
                                    src={photos?.at(photoIndex)?.photo_url}
                                    alt="post_img"
                                    className="edit-post-popup-item-photo-image"
                                    initial={{x: 0, opacity: 0}}
                                    animate={{x: 0, opacity: 1}}
                                    exit={{x: 0, opacity: 0}}
                                    transition={{duration: 0.2}}
                                />}
                            {photos.length != 0 && <button className="edit-post-popup-edit-post-button roboto-style"
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
                                <button className="edit-post-popup-item-arrow-back-button" onClick={() => {
                                    setPhotoIndex(prevState => prevState - 1);
                                }}>
                                    <img src="/icons/arrow_back.png" alt="back_img"
                                         className="account-details-item-arrow-back-icon icon-size"/>
                                </button>
                            }
                            {photoIndex < photos.length - 1 &&
                                <button className="edit-post-popup-item-arrow-forward-button" onClick={() => {
                                    setPhotoIndex(prevState => prevState + 1);
                                }}>
                                    <img src="/icons/arrow_forward.png" alt="forward_img"
                                         className="account-details-item-arrow-forward-icon icon-size"/>
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
                            <div className="edit-post-popup-error-messaage">{dateErrorMessage}</div>}
                    </div>
                    <div className='edit-post-mobile-responsive-div'
                         style={windowWidth > 1100 ? {display: 'none'} : {}}>
                        <div className='edit-post-popup-mobile-responsive-add-and-date-container'>
                            {windowWidth < 1100 && uploadButtonSection}
                            {windowWidth < 1100 && dateSection}
                        </div>
                        <div className='edit-post-popup-mobile-responsive-likes-and-comments-container'>
                            {windowWidth < 1100 && likesSection}
                            {windowWidth < 1100 && commentsSection}
                        </div>
                    </div>
                    <div className='edit-post-popup-content-right'>
                        <div className='roboto-style'>Description</div>
                        <textarea
                            className="edit-post-popup-post-description-input edit-post-inputs input-reset roboto-style"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value)
                                setProfileToBeTranslated(true)
                                setProfileToBeSaved(false)
                            }}
                            placeholder="post description"
                        />
                        <div className='edit-post-popup-post-comments-button-content roboto-style'>
                            Comments
                            <button className='edit-post-popup-add-button grey-button roboto-style' onClick={
                                () => {
                                    const newComment = {id: commentsGeneratedId, comment: ''};
                                    setComments(prev => [newComment, ...prev]);
                                    setCommentsGeneratedId(prevId => prevId - 1);
                                }
                            }>
                                <img src="/icons/add.png" alt="add_img"
                                     className="edit-post-popup-add-icon icon-size"/>
                                {windowWidth >= 1100 ? 'add comment' : 'add'}
                            </button>
                            {commentsError &&
                                <div className='edit-post-popup-error-messaage'>{commentsErrorMessage}</div>}
                        </div>

                        <GenericList className='edit-post-popup-comments-list' items={comments.map((comment) =>
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

                <div className="edit-post-popup-bottom-bar">
                    <button className="edit-post-popup-delete-button roboto-style">
                        <img src="/icons/delete.png" alt="delete_img"
                             className="edit-post-popup-delete-icon icon-size"/>
                        {windowWidth >= 1100 && 'Delete Post'}
                    </button>

                    <div className='edit-post-popup-right-content'>
                        <button className="edit-post-popup-detect-from-image-button grey-button roboto-style"
                                onClick={() => {
                                    setDetectFromImage(true)
                                }}
                        >
                            {windowWidth >= 1100 ? 'Detect From Image' : 'Detect'}
                        </button>
                        {profileToBeTranslated &&
                            < button className="edit-post-popup-translate-to-english-button grey-button roboto-style"
                                     onClick={handleTranslateToEnglish}>
                                {windowWidth >= 1100 ? 'Translate to english' : 'Translate'}
                            </button>
                        }
                        {profileToBeSaved &&
                            <button className="edit-post-popup-save-button grey-button roboto-style"
                                    onClick={handleSaveOnClick}>
                                {props.forAdd ? 'Add' : 'Save'}
                            </button>
                        }
                    </div>

                </div>
            </div>
            {detectFromImage && <DetectFromImage onPostDetected={handlePostDataDetected}
                                                 onProfileDetected={async () => {
                                                 }}
                                                 forPost={true} forProfile={false} onCancel={() => {
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
            {(isLoading || isError) && <div className='edit-post-popups-container'>
                <CirclesLoading isOpen={isLoading} message={'Loading'}/>
                <CustomInfoAlert isOpen={isError} header={"Error Detecting Data"}
                                 error={true}
                                 message={errorMessage} onDismiss={() => {
                    setIsError(false)
                }}/>
            </div>}
        </div>
    );
};

export default EditPostPopUp;
