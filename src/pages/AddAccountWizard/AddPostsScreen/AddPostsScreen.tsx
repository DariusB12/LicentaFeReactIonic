import React, {useCallback, useRef, useState} from 'react';
import "./AddPostsScreen.css"
import {getLogger, useWindowWidth} from "../../../assets";
import {motion} from "framer-motion";
import GenericList from "../../../components/GenericList/GenericList";
import {PostPhoto} from "../../../assets/entities/PostPhoto";
import {PostComment} from "../../../assets/entities/PostComment";
import CommentsItem from "../../../components/CommentsItem/CommentsItem";
import {IonDatetime, IonDatetimeButton, IonModal} from "@ionic/react";

interface EditPostPopUpProps {
    isOpen: boolean,

    forAdd:boolean,
    forEdit:boolean,

    idPost?: number,
    idProfile: number,

    photos?: PostPhoto[],
    description?: string,
    no_likes?: number,
    no_comments?: number,
    comments?: PostComment[],
    date_posted?: Date

    closeFn: () => void
}

const log = getLogger('AddPostsScreen');

const AddPostsScreen: React.FC<EditPostPopUpProps> = (props) => {
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

    const windowWidth = useWindowWidth()

    const handleTranslateToEnglish = useCallback(async () => {
        log('translate the description');
        //todo: api pentru traducerea in engleza doar a descrierii (mai intai verific daca e empty si apoi daca trebuie tradus) si comentariilor
        setProfileToBeSaved(true)
        setProfileToBeTranslated(false)
    }, []);

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

        return !hasError;

    }, [noLikes, noComments, datePosted, photos, comments]);

    const handleSaveOnClick = useCallback(async () => {
        log('save edited post');
        validateInputs().then((result) => {
            if (result) {
                //IF INPUTS ARE VALID, THEN SAVE THE EDITED POST

                //todo: API pentru salvarea profilului, CAND EXTRAG INPUTURILE NUMBER DACA SUNT GOALE LE PUN BY DEFAULT 0 (chiar daca validarea nu lasa userul sa lase inputurile goale la likes/comments),
                //TODO: CAND SE SALVEAZA - lista cu comentarii/fotografii se trimite asa cum a fost modificata si pe server in DB se inlocuieste cea veche cu asta noua
                // AFISEZ LOADING ICON CAND ON CLICK SAVE
                // forAdd?:boolean,
                //     forEdit?:boolean, folosesc atributele astea ca sa stiu daca fac update sau add de postare
                props.closeFn()
            }
        })
    }, [props, validateInputs]);
    log('render')


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
            const base64 = result.split(',')[1]; // removes "data:image/...;base64,"
            const postPhoto: PostPhoto = {id: photosGeneratedId, photo: base64}
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
        {windowWidth>=700 && noOfLikesError &&
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
               placeholder={noComments == -1 ? 'private' : (windowWidth >= 1100 ? 'comments no' : 'comm no') }/>
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
        {windowWidth>=700 && noOfCommentsError &&
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
            {windowWidth>=700 && dateError && <div className="add-posts-screen-error-messaage">{dateErrorMessage}</div>}
        </div>
    </div>)

    //TODO: sterg cancel button, adaug titlu Add Post
    //TODO: RESPONSIVE MOBILE CU TOT CU ERRORS
    //TODO: LA REFRESH RAMANE STATE-UL CURENT, LA PRESS ORICE BUTTON DIN VERTICAL MENU, SE FACE REMOVE LA STATE
    //TODO: design butoane sa fie black
    //TODO: BUTTONS LOGIC
    //TODO: LOADING ICON/ADDED SUCCESSFULLY/NETWORK ERRROR
    //TODO: DETECT FROM IMAGE
    return (
            <div className="add-posts-screen-content">


                <div className="add-posts-screen-middle-content">
                    <div className='add-posts-screen-content-left'>

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
                                    src={`data:image/jpeg;base64,${photos?.at(photoIndex)?.photo}`}
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
                            {photoIndex < photos.length - 1  &&
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
                    <div className='add-posts-screen-mobile-responsive-div' style={windowWidth > 1100 ? {display: 'none'} : {}}>
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
                        <div className='roboto-style'>Description</div>
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
                    <button className="add-posts-screen-delete-button roboto-style">
                        <img src="/icons/delete.png" alt="delete_img"
                             className="add-posts-screen-delete-icon icon-size"/>
                        {windowWidth >= 1100 && 'Delete Post'}
                    </button>

                    <div className='add-posts-screen-right-content'>
                        <button className="add-posts-screen-detect-from-image-button black-button roboto-style">
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
                                {props.forAdd ? 'Add' : 'Save'}
                            </button>
                        }
                    </div>

                </div>
            </div>
    );
};

export default AddPostsScreen;
