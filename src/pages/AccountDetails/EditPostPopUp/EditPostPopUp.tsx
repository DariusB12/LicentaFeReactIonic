import React, {useCallback, useRef, useState} from 'react';
import "./EditPostPopUp.css"
import {getLogger} from "../../../assets";
import {motion} from "framer-motion";
import GenericList from "../../../components/GenericList/GenericList";
import {PostPhoto} from "../../../assets/entities/PostPhoto";
import {PostComment} from "../../../assets/entities/PostComment";
import CommentsItem from "../../../components/CommentsItem/CommentsItem";
import commentsItem from "../../../components/CommentsItem/CommentsItem";
import capacitorConfig from "../../../../capacitor.config";

interface EditPostPopUpProps {
    isOpen: boolean,

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
            setNoOfLikesErrorMessage('provide a value')
            setNoOfLikesError(true)
            //TODO: verify for private values
            hasError = true;
        }
        if (!Number.isInteger(noComments)) {
            setNoOfCommentsErrorMessage('provide a value')
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
            setPhotosErrorMessage('The post must have at least one photo.')
            setPhotosError(true)
            hasError = true
        }
        //CANNOT HAVE EMPTY COMMENTS
        comments.forEach(c => {
            if (c.comment.trim() === '') {
                setCommentsErrorMessage('Delete all the empty comments')
                setCommentsError(true)
                //TODO: highlight with red empty comments
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

    //TODO: responsive mobile cu tot cu WARNINGS!!
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
                                    src={`data:image/jpeg;base64,${photos?.at(photoIndex)?.photo}`}
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
                            {photoIndex != photos.length - 1 &&
                                <button className="edit-post-popup-item-arrow-forward-button" onClick={() => {
                                    setPhotoIndex(prevState => prevState + 1);
                                }}>
                                    <img src="/icons/arrow_forward.png" alt="forward_img"
                                         className="account-details-item-arrow-forward-icon icon-size"/>
                                </button>
                            }
                        </div>
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
                                add another photo
                            </button>
                            <div className='edit-post-popup-or-text roboto-style'>or</div>
                            <input
                                ref={inputRef}
                                value=''
                                onChange={() => {
                                }}
                                className="input-reset roboto-style"
                                placeholder="Ctrl+V inside this input"
                                onPaste={handlePaste}
                            />
                        </div>

                        <div className='edit-post-popup-likes-container'>
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
                            likes
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
                            {noOfLikesError &&
                                <div className="edit-post-popup-error-messaage">{noOfLikesErrorMessage}</div>}

                        </div>
                        <div className='edit-post-popup-comments-container'>
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
                                   placeholder={noComments == -1 ? 'private' : `comments no`}/>
                            comments
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
                            {noOfCommentsError &&
                                <div className="edit-post-popup-error-messaage">{noOfCommentsErrorMessage}</div>}

                        </div>
                        <div className='edit-post-popup-date-posted-container'>
                            Date posted
                            <div className='edit-post-popup-date-input-and-message-container'>
                                <input
                                    type="date"
                                    className={`edit-post-popup-date-input edit-post-inputs input-reset roboto-style ${dateError ? 'red-border-input' : ''}`}
                                    value={datePosted.toISOString().split('T')[0]} // format to yyyy-MM-dd
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setDatePosted(val ? new Date(val) : new Date()); // fallback if empty
                                        if (!profileToBeTranslated) {
                                            setProfileToBeSaved(true)
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === '+' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder="date"
                                />
                                {dateError && <div className="edit-post-popup-error-messaage">{dateErrorMessage}</div>}
                            </div>
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
                                add comment
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
                        Delete Post
                    </button>

                    <div className='edit-post-popup-right-content'>
                        <button className="edit-post-popup-detect-from-image-button grey-button roboto-style">
                            Detect From Image
                        </button>
                        {profileToBeTranslated &&
                            < button className="edit-post-popup-translate-to-english-button grey-button roboto-style"
                                     onClick={handleTranslateToEnglish}>
                                Translate to english
                            </button>
                        }
                        {profileToBeSaved &&
                            <button className="edit-post-popup-save-button grey-button roboto-style"
                                    onClick={handleSaveOnClick}>
                                Save
                            </button>
                        }
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditPostPopUp;
