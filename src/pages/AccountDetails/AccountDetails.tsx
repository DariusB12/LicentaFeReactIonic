import {formatNumber, getLogger, useWindowWidth} from "../../assets";
import {RouteComponentProps, useParams} from "react-router";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {IonPage, IonSpinner, IonToast} from "@ionic/react";
import './AccountDetails.css'
import VerticalMenu from "../../components/VerticalMenu/VerticalMenu";
import GenericList from "../../components/GenericList/GenericList";
import AccountDetailsItem from "./AccountDetailsItem/AccountDetailsItem";
import EditProfilePopUp from "./EditProfilePopUp/EditProfilePopUp";
import EditPostPopUp from "./EditPostPopUp/EditPostPopUp";
import {Post} from "../../assets/entities/Post";
import {AccountDetailsContext} from "../../providers/AccountDetailsProvider/AccountDetailsContext";
import {SocialAccountsContext} from "../../providers/SocialAccountsProvider/SocialAccountsContext";
import {AuthContext} from "../../providers/AuthProvider/AuthContext";
import CirclesLoading from "../../components/CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../../components/CustomInfoAlert/CustomInfoAlert";
import {SocialAccountPostsContext} from "../../providers/SocialAccountPostsProvider/SocialAccountPostsContext";
import {PostPhoto} from "../../assets/entities/PostPhoto";


const log = getLogger('AccountDetails');


export const AccountDetails: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    const {id} = useParams<{ id: string }>(); // used to select from provider the social media account
    const {socialAccount,accountDeleted, fetchingError, fetchSocialAccount, fetching, errorMessage} = useContext(AccountDetailsContext)
    const [profilePhotoBase64, setProfilePhotoBase64] = useState<string | undefined>();

    const {deleteSocialAccount} = useContext(SocialAccountsContext)
    const {deleteSocialAccountPost} = useContext(SocialAccountPostsContext)

    const width = useWindowWidth();
    const [showPosts, setShowPosts] = useState<boolean>(false)
    const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
    const [editClickedPost, setEditClickedPost] = useState<Post | undefined>(undefined)
    const [showEditPost, setShowEditPost] = useState<boolean>(false);
    const [showAddPost, setShowAddPost] = useState<boolean>(false);

    const {setTokenExpired} = useContext(AuthContext)

    const [isOpenToastNotification, setIsOpenToastNotification] = useState<boolean>(false)
    const [toastNotificationMessage, setToastNotificationMessage] = useState<string>('');

    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessageApi, setErrorMessageApi] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);



    useEffect(() => {
        fetchSocialAccount?.(Number.parseFloat(id))
    }, [fetchSocialAccount, id]);

    const handleOnClickDeleteProfile = useCallback(async (account_id:number) => {
        log('trying to delete social media account');

        // SET TOAST NOTIFY TO FALSE
        // AND SLEEP SO THAT THE TOAST TIMEOUT IS RESET (IF OPENING MORE TOAST ONE AFTER ANOTHER FORCE TO RERENDER)
        setIsOpenToastNotification(false)
        await new Promise(resolve => setTimeout(resolve, 5))

        setIsLoading(true)

        const response = await deleteSocialAccount?.(account_id);
        setIsLoading(false)

        //200 OK data detected
        if (response?.status_code == 200) {
            setIsOpenToastNotification(true)
            setToastNotificationMessage('Deleted successfully')
        } else if (response?.status_code == 403) {
            //403 FORBIDDEN if the token is expired
            setTokenExpired?.(true)
        } else {
            //Any other err is a server error/system error
            setErrorMessageApi('Network error')
            setIsError(true)
        }

    }, [deleteSocialAccount, setTokenExpired]);

    async function blobUrlToBase64(blobUrl: string): Promise<string> {
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result && typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject('Failed to convert blob to base64');
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const handleOnClickEditProfile = useCallback(async()=>{
        if (socialAccount?.profile_photo_url) {
            try {
                const base64 = await blobUrlToBase64(socialAccount.profile_photo_url);
                setProfilePhotoBase64(base64);
            } catch (e) {
                console.error('Error converting image to base64', e);
                setProfilePhotoBase64(undefined);
            }
        }

        setShowEditProfile(true)

    },[socialAccount])

    const handleEditPostClicked = useCallback(async (post: Post) => {
        log('edit post clicked');
        const postPhotosBase64: PostPhoto[] = [];
        for (const photo of post.photos) {
            if (photo.photo_url) {
                try {
                    const base64 = await blobUrlToBase64(photo.photo_url);
                    postPhotosBase64.push({
                        id: photo.id,
                        photo_url: base64
                    });
                } catch (e) {
                    console.error('Error converting image to base64', e);
                }
            }
        }

        const editPostWithBase64Photos = {
            id: post.id,
            description: post.description,
            no_likes: post.no_likes,
            no_comments: post.no_comments,
            date_posted: post.date_posted,

            comments: post.comments,
            photos: postPhotosBase64,
        } as Post

        setEditClickedPost(editPostWithBase64Photos)
    }, []);


    const handleOnClickDeletePost = useCallback(async(post_id:number)=>{
        log('trying to delete post account');

        // SET TOAST NOTIFY TO FALSE
        // AND SLEEP SO THAT THE TOAST TIMEOUT IS RESET (IF OPENING MORE TOAST ONE AFTER ANOTHER FORCE TO RERENDER)
        setIsOpenToastNotification(false)
        await new Promise(resolve => setTimeout(resolve, 5))

        setIsLoading(true)

        const response = await deleteSocialAccountPost?.(post_id);
        setIsLoading(false)

        //200 OK data detected
        if (response?.status_code == 200) {
            setIsOpenToastNotification(true)
            setToastNotificationMessage('Deleted successfully')
        } else if (response?.status_code == 403) {
            //403 FORBIDDEN if the token is expired
            setTokenExpired?.(true)
        } else {
            //Any other err is a server error/system error
            setErrorMessageApi('Network error')
            setIsError(true)
        }
    },[deleteSocialAccountPost, setTokenExpired])


    return (
        <IonPage className="account-details-main-container">
            <VerticalMenu/>
            {!fetching && !fetchingError && socialAccount && <>

                <div className="account-details-content-container">
                    <button className="account-details-content-container-view-posts-button roboto-style"
                            style={width <= 1350 ? {display: `${!showPosts ? 'flex' : 'none'}`} : {}}
                            onClick={() => {
                                setShowPosts(prevState => !prevState)
                            }}>View Posts
                    </button>
                    <button className="account-details-content-container-view-profile-button roboto-style"
                            style={width <= 1350 ? {display: `${showPosts ? 'flex' : 'none'}`} : {}}
                            onClick={() => {
                                setShowPosts(prevState => !prevState)
                            }}>View Profile
                    </button>

                    <div className="account-details-content-posts-container"
                         style={width <= 1350 ? {display: `${showPosts ? 'flex' : 'none'}`} : {}}>
                        {socialAccount.posts.length <= 0 &&
                            <div className="account-details-content-posts-container-no-posts-container">
                                    No posts
                            </div>}
                        <GenericList items={socialAccount.posts.map((post) =>
                            <div key={post.id} className='account-details-list-div-for-center'>
                                <AccountDetailsItem post={post}
                                            onClickDelete={()=>handleOnClickDeletePost(post.id)}
                                            onClickEdit={() => {
                                                handleEditPostClicked(post).then(() => {setShowEditPost(true)})
                                }}
                                />
                            </div>
                        )}/>
                    </div>
                    <div className="account-details-content-profile-container"
                         style={width <= 1350 ? {display: `${!showPosts ? 'flex' : 'none'}`} : {}}>
                        <div className="account-details-content-profile-top-content">
                            {socialAccount.profile_photo_url ?
                                <img
                                    src={socialAccount.profile_photo_url}
                                    alt="profile_img"
                                    className="account-details-profile-image"
                                /> :
                                <img
                                    src="/icons/anonim_image.png"
                                    alt="anonim_image"
                                    className="account-details-profile-image"
                                />
                            }
                            <div className="account-details-content-profile-details">
                                <div className="account-details-content-profile-details-numbers roboto-style">
                                    <div
                                        className="account-details-content-profile-details-username">{socialAccount.username}</div>
                                    <div
                                        className="account-details-content-profile-details-no">{formatNumber(socialAccount.no_of_posts)}
                                        <span style={{color: "#8c8c8c"}}>posts</span></div>
                                    <div
                                        className="account-details-content-profile-details-no">{formatNumber(socialAccount.no_followers)}
                                        <span style={{color: "#8c8c8c"}}>followers</span></div>
                                    <div
                                        className="account-details-content-profile-details-no">{formatNumber(socialAccount.no_following)}
                                        <span style={{color: "#8c8c8c"}}>following</span></div>
                                </div>
                                {width >= 695 &&
                                    <div className="account-details-content-profile-details-description roboto-style">
                                        {socialAccount.profile_description}
                                    </div>}
                            </div>
                        </div>
                        {width <= 695 &&
                            <div className="account-details-content-profile-details-description roboto-style">
                                {socialAccount.profile_description}
                            </div>
                        }
                        <div className="account-details-content-profile-buttons-bar">
                            <button className="account-details-edit-profile-button roboto-style" onClick={handleOnClickEditProfile}>
                                <img src="/icons/edit.png" alt="edit_icon"
                                     className="account-details-content-profile-edit-icon icon-size"/>
                                {width >= 695 && <div>Edit profile</div>}
                            </button>
                            <button className="account-details-add-new-post-button grey-button roboto-style"
                                    onClick={() => {
                                        setShowAddPost(true)
                                    }}
                            >
                                <img src="/icons/add.png" alt="add_icon"
                                     className="account-details-content-profile-add-icon icon-size"/>
                                {width >= 695 && <div>Add new post</div>}
                            </button>
                            <button className="account-details-delete-profile-button roboto-style"
                                    onClick={()=>handleOnClickDeleteProfile(socialAccount?.id)}>
                                <img src="/icons/delete.png" alt="delete_icon"
                                     className="account-details-content-profile-delete-icon icon-size"/>
                                {width >= 695 && <div>Delete profile</div>}
                            </button>
                        </div>
                        <hr className="account-details-divider"/>
                        <div className="account-details-content-analysis-container">
                            <button className="account-details-content-analysis-button black-button roboto-style">
                                <img src="/icons/analysis.png" alt="anaysis_icon"
                                     className="account-details-content-analysis-analysis-icon icon-size"/>
                                Do Analysis
                            </button>
                        </div>
                    </div>
                </div>
                {showEditProfile &&
                    <EditProfilePopUp isOpen={showEditProfile}
                                      idProfile={socialAccount.id}
                                      username={socialAccount.username}
                                      profile_description={socialAccount.profile_description}
                                      no_followers={socialAccount.no_followers}
                                      no_following={socialAccount.no_following}
                                      no_of_posts={socialAccount.no_of_posts}
                                      profile_photo={profilePhotoBase64}
                                      closeFn={() => {
                                          setShowEditProfile(false)
                                          setIsOpenToastNotification(true)
                                          setToastNotificationMessage('Edit profile canceled.')
                                      }}
                                      savedSuccessfully={()=> {
                                          setShowEditProfile(false)
                                          setIsOpenToastNotification(true)
                                          setToastNotificationMessage('Profile edited successfully.')
                                      }
                                      }></EditProfilePopUp>
                }

                {showEditPost && <EditPostPopUp
                    isOpen={showEditPost}
                    forAdd={false}
                    forEdit={true}
                    idProfile={socialAccount.id}
                    idPost={editClickedPost?.id}
                    photos={editClickedPost?.photos}
                    description={editClickedPost?.description}
                    no_likes={editClickedPost?.no_likes}
                    no_comments={editClickedPost?.no_comments}
                    comments={editClickedPost?.comments}
                    date_posted={editClickedPost?.date_posted}
                    addedSuccessfully={()=> {
                        setShowEditPost(false)
                        setIsOpenToastNotification(true)
                        setToastNotificationMessage('Post added successfully.')
                    }}
                    editedSuccessfully={()=> {
                        setShowEditPost(false)
                        setIsOpenToastNotification(true)
                        setToastNotificationMessage('Post edited successfully.')
                    }}
                    closeFn={() => {
                        setShowEditPost(false)
                        setIsOpenToastNotification(true)
                        setToastNotificationMessage('Operation canceled.')
                    }}/>
                }
                {showAddPost && <EditPostPopUp
                    isOpen={showAddPost}
                    forAdd={true}
                    forEdit={false}

                    idProfile={socialAccount.id}
                    addedSuccessfully={()=> {
                        setShowAddPost(false)
                        setIsOpenToastNotification(true)
                        setToastNotificationMessage('Post added successfully.')
                    }}
                    editedSuccessfully={()=> {
                        setShowAddPost(false)
                        setIsOpenToastNotification(true)
                        setToastNotificationMessage('Post edited successfully.')
                    }}
                    closeFn={() => {
                        setShowAddPost(false)
                        setIsOpenToastNotification(true)
                        setToastNotificationMessage('Operation canceled.')
                    }}/>
                }
            </>}
            {accountDeleted && !socialAccount &&
                <div className="account-details-account-deleted-another-device">
                    Account deleted
                </div>
                }
            {fetching &&
                <div className="account-details-circles-loading-content">
                    <IonSpinner name="circles" color="secondary"></IonSpinner>
                    <div className="roboto-style">{'Loading...'}</div>
                </div>
            }
            {fetchingError &&
                <div className="account-details-fetching-error-message">
                    {errorMessage}
                </div>
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

            {(isLoading || isError) && <div className='account-details-popups-container'>
                <CirclesLoading isOpen={isLoading} message={'Loading'}/>
                <CustomInfoAlert isOpen={isError} header={"Error"}
                                 error={true}
                                 message={errorMessageApi} onDismiss={() => {
                    setIsError(false)
                }}/>
            </div>}
        </IonPage>

    )
};
