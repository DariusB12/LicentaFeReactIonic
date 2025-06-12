import React, {useCallback, useContext, useEffect, useReducer, useRef} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from "../../assets";

import axios from "axios";

import {AuthContext} from "../AuthProvider/AuthContext";
import {SocialAccount} from "../../assets/entities/SocialAccount";
import {
    AccountDetailsContext,
    AccountDetailsState,
    FetchSocialAccountFn,
    initialState,
    NotifyAccountDetailsDeleteFn,
    NotifyAccountDetailsEditedFn,
    NotifyAccountDetailsPostAddedFn,
    NotifyAccountDetailsPostDeletedFn, NotifyAccountDetailsPostEditedFn,
    ReFetchSocialAccountFn,
} from "./AccountDetailsContext";
import {getSocialAccountApi} from "../../services/socialAccounts/socialAccountsApi";
import {SocialAccountFull} from "../../assets/Responses/socialAccountsResponse/GetSocialAccountResponse";
import {Post} from "../../assets/entities/Post";
import {Analysis} from "../../assets/entities/Analysis";
import {fetchImageApi} from "../../services/photo/photoApi";
import {PostPhoto} from "../../assets/entities/PostPhoto";
import {PostComment} from "../../assets/entities/PostComment";
import {UpdateSocialAccountNotify} from "../../assets/WebsocketNotifications/UpdateSocialAccountNotify";
import {AddedPostNotify} from "../../assets/WebsocketNotifications/AddedPostNotify";
import {UpdatedPostNotify} from "../../assets/WebsocketNotifications/UpdatedPostNotify";


const log = getLogger('AccountDetailsProvider');

interface ActionProps {
    type: string,
    socialAccount?: SocialAccount
    errorMessage?: string
    socialAccountId?: number
    post_id?: number
    post?: Post
}


const FETCH_ACCOUNT_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ACCOUNT_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ACCOUNT_FAILED = 'FETCH_ITEMS_FAILED';

const UPDATE_SOCIAL_ACCOUNT_DELETED = 'UPDATE_SOCIAL_ACCOUNT_DELETED';
const UPDATE_SOCIAL_ACCOUNT_EDITED = 'UPDATE_SOCIAL_ACCOUNT_EDITED';

const UPDATE_SOCIAL_ACCOUNT_POST_DELETED = 'UPDATE_SOCIAL_ACCOUNT_POST_DELETED';
const UPDATE_SOCIAL_ACCOUNT_POST_ADDED = 'UPDATE_SOCIAL_ACCOUNT_POST_ADDED';
const UPDATE_SOCIAL_ACCOUNT_POST_EDITED = 'UPDATE_SOCIAL_ACCOUNT_POST_EDITED'

const reducer: (state: AccountDetailsState, action: ActionProps) => AccountDetailsState =
    (state, action) => {
        switch (action.type) {
            case FETCH_ACCOUNT_STARTED:
                return {...state, fetching: true, fetchingError: false, errorMessage: '', accountDeleted: false};
            case FETCH_ACCOUNT_SUCCEEDED:
                return {
                    ...state,
                    socialAccount: action.socialAccount,
                    fetching: false,
                    fetchingError: false,
                    errorMessage: '',
                    accountDeleted: false
                };
            case FETCH_ACCOUNT_FAILED:
                return {
                    ...state,
                    fetchingError: true,
                    fetching: false,
                    errorMessage: action.errorMessage ? action.errorMessage : 'Loading error',
                    accountDeleted: false
                };
            case UPDATE_SOCIAL_ACCOUNT_DELETED: {
                if (action.socialAccountId == state.socialAccount?.id) {
                    return {...state, socialAccount: undefined, accountDeleted: true};
                }
                return {...state}
            }
            case UPDATE_SOCIAL_ACCOUNT_EDITED: {
                const socialAccUpdates = action.socialAccount

                const socialAccountUpdated = {
                    id: socialAccUpdates?.id,
                    username: socialAccUpdates?.username,
                    profile_description: socialAccUpdates?.profile_description,
                    profile_photo_url: socialAccUpdates?.profile_photo_url,
                    no_followers: socialAccUpdates?.no_followers,
                    no_following: socialAccUpdates?.no_following,
                    no_of_posts: socialAccUpdates?.no_of_posts,
                    modified: socialAccUpdates?.modified,

                    posts: state.socialAccount?.posts,
                    analysis: state.socialAccount?.analysis
                } as SocialAccount;
                return {...state, socialAccount: socialAccountUpdated}
            }
            case UPDATE_SOCIAL_ACCOUNT_POST_DELETED: {
                if (state.socialAccount)
                    return {
                        ...state,
                        socialAccount: {
                            ...state.socialAccount,
                            posts: state.socialAccount.posts.filter(post => post.id != action.post_id),
                            modified: true
                        }
                    };
                return {...state}
            }
            case UPDATE_SOCIAL_ACCOUNT_POST_ADDED: {
                if (state.socialAccount) {
                    return {
                        ...state, socialAccount: {
                            ...state.socialAccount,
                            posts: action.post ? [...state.socialAccount.posts, action.post] : [...state.socialAccount.posts],
                            modified: true
                        }
                    }
                }
                return {...state}
            }
            case UPDATE_SOCIAL_ACCOUNT_POST_EDITED: {
                const postExists = state.socialAccount?.posts.some(post => post.id === action.post?.id);

                if (!postExists || !action.post ) {
                    return {...state};
                }

                let updatedPosts = state.socialAccount?.posts
                    .filter(post => post.id !== action.post?.id)

                if(!updatedPosts)
                    updatedPosts = []

                if(state.socialAccount) {
                    return {
                        ...state,
                        socialAccount: {
                            ...state.socialAccount,
                            posts: [...updatedPosts, action.post],
                            modified: true
                        }
                    };
                }
                return {...state}
            }
            default:
                return state;
        }
    };


interface SocialAccountsProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const AccountDetailsProvider: React.FC<SocialAccountsProviderProps> = ({children}) => {
    const {token, setTokenExpired} = useContext(AuthContext)
    const [state, dispatch] = useReducer(reducer, initialState);
    const {socialAccount, accountDeleted, fetching, fetchingError, errorMessage} = state;
    // Use useRef instead of useState for socialAccountId to avoid triggering reFetchSocialAccount which triggered the
    // websocket to render twice (each time an accountDetails page loaded, the websocket would reconnect twice because
    // the reFetch... useCallback would rerender causing the websocket to rerender)
    const socialAccountId = useRef<number>(socialAccount?.id)

    // REF USED TO STORE ALL THE URL OBJECTS
    const createdPhotoUrls = useRef(new Set<string>());

    //ON UNMOUNT OF THIS COMPONENT, WE DESTROY EACH UrlObject CREATED FOR EACH SOCIAL ACCOUNT IMAGE
    //IN ORDER TO AVOID MEMORY LEAKS
    useEffect(() => {
        return () => {
            log('Revoking all URL objects on component unmount');
            createdPhotoUrls.current.forEach(url => {
                URL.revokeObjectURL(url);
            });
            createdPhotoUrls.current.clear(); // Clear the set
        };
    }, []);

    useEffect(() => {
        const newUrls = new Set<string>();

        //UPDATE THE REF WITH ALL URL OBJECTS WHEN THE socialAccount IS CHANGED (WHEN NEW POSTS/IMAGES ARE ADDED/UPDATED)
        //PROFILE PHOTO URL OBJ
        if (socialAccount?.profile_photo_url) {
            newUrls.add(socialAccount.profile_photo_url);
        }
        //POST PHOTOS URL OBJ
        socialAccount?.posts.forEach(post => {
            post.photos.forEach(photo => {
                if (photo.photo_url) {
                    newUrls.add(photo.photo_url);
                }
            })
        })


        // createdPhotoUrls CONTAINS THE LIST BEFORE IT CHANGED,
        // WE CHECK IF THERE ARE URLS THAT ARE NO LONGER IN THE LIST
        createdPhotoUrls.current.forEach(oldUrl => {
            if (!newUrls.has(oldUrl)) {
                URL.revokeObjectURL(oldUrl);
                log(`Revoked URL for removed account: ${oldUrl}`);
            }
        });

        // Update the ref with the new set of URLs
        createdPhotoUrls.current = newUrls;

    }, [socialAccount]); // This effect runs whenever socialAccounts changes


    const convertSocialAccountFullToSocialAccount = useCallback(
        async (socialAccountFull: SocialAccountFull): Promise<SocialAccount> => {
            //TODO: DACA FAC ANALIZA, SA CONVERTESC TOATE ATRIBUTELE DIN ANALIZA
            const analysis: Analysis | undefined = socialAccountFull.analysis ? {id: socialAccountFull.analysis?.id} : undefined

            const posts: Post[] = []
            for (const post of socialAccountFull.posts) {
                //FOR EACH POST CREATE THE PHOTOS AND COMMENTS LISTS
                const photos: PostPhoto[] = []
                const comments: PostComment[] = []
                for (const comm of post.comments) {
                    comments.push({
                        id: comm.id,
                        comment: comm.content
                    })
                }
                for (const photo of post.photos) {
                    const postPhotoImageBlob = await fetchImageApi(photo.post_photo_filename, token);
                    photos.push({
                        id: photo.id,
                        photo_url: postPhotoImageBlob ? postPhotoImageBlob : undefined
                    })
                }
                posts.push({
                    id: post.id,
                    description: post.description,
                    no_likes: post.noLikes,
                    no_comments: post.noComments,
                    date_posted: new Date(post.datePosted),

                    comments: comments,
                    photos: photos,
                })
            }

            const profileImageBlob = await fetchImageApi(socialAccountFull.profile_photo_filename, token);

            return {
                id: socialAccountFull.id,
                username: socialAccountFull.username,
                profile_description: socialAccountFull.profile_description,
                no_followers: socialAccountFull.no_followers,
                no_following: socialAccountFull.no_following,
                no_of_posts: socialAccountFull.no_of_posts,
                modified: socialAccountFull.modified,

                profile_photo_url: profileImageBlob ? profileImageBlob : undefined,
                posts: posts,
                analysis: analysis,
            }
        }, [token]);

    //FUNCTIONS
    const fetchSocialAccount = useCallback<FetchSocialAccountFn>(fetchSocialAccountCallback, [convertSocialAccountFullToSocialAccount, setTokenExpired, token])
    // FUNCTION USED FOR WEBSOCKET WHEN RECONNECTING IN ORDER TO RETRY TO FETCH THE ACCOUNT DETAILS BASED ON THE ACCOUNT ID STATE
    const reFetchSocialAccount = useCallback<ReFetchSocialAccountFn>(reFetchSocialAccountCallback, [convertSocialAccountFullToSocialAccount, setTokenExpired, token])

    //functions for websocket update notifications
    const notifyAccountDetailsDelete = useCallback<NotifyAccountDetailsDeleteFn>(notifyAccountDetailsDeleteCallback, [])
    const notifyAccountDetailsEdited = useCallback<NotifyAccountDetailsEditedFn>(notifyAccountDetailsEditedCallback, [token])

    const notifyAccountDetailsPostDeleted = useCallback<NotifyAccountDetailsPostDeletedFn>(notifyAccountDetailsPostDeletedCallback, [])
    const notifyAccountDetailsPostAdded = useCallback<NotifyAccountDetailsPostAddedFn>(notifyAccountDetailsPostAddedCallback, [token])
    const notifyAccountDetailsPostEdited = useCallback<NotifyAccountDetailsPostEditedFn>(notifyAccountDetailsPostEditedCallback, [token])

    useEffect(() => {
        //RESET THE ACCOUNT ID WHEN UNMOUNTING THE COMPONENT
        //SO THAT WHEN RECONNECTED WEBSOCKET TRIES TO FETCH THE ACCOUNT, IT WON'T BE FETCHED IF THE ID IS UNDEFINED
        //MEANING THE COMPONENT IS NOT SHOWN
        return () => {
            socialAccountId.current = undefined
        }
    }, []);


    const value = {
        socialAccount,
        fetching,
        fetchingError,
        errorMessage,
        accountDeleted,
        fetchSocialAccount,
        reFetchSocialAccount,
        notifyAccountDetailsDelete,
        notifyAccountDetailsEdited,
        notifyAccountDetailsPostDeleted,
        notifyAccountDetailsPostAdded,
        notifyAccountDetailsPostEdited,
    };
    log('render');

    return <AccountDetailsContext.Provider value={value}>{children}</AccountDetailsContext.Provider>


    async function fetchSocialAccountCallback(account_id: number): Promise<void> {
        dispatch({type: FETCH_ACCOUNT_STARTED});
        log('trying to get social account');
        try {
            const response = await getSocialAccountApi(account_id, token); // Await the response directly
            log('social account retrieved successfully:', response);

            // BEFORE SETTING THE RETRIEVED SOCIAL ACCOUNT, WE FETCH THE IMAGE FOR EACH PROFILE PHOTO
            const mappedAccount: SocialAccount = await convertSocialAccountFullToSocialAccount(response.social_account)

            //SET THE CURRENT SOCIAL ACCOUNT ID
            socialAccountId.current = mappedAccount.id
            dispatch({type: FETCH_ACCOUNT_SUCCEEDED, socialAccount: mappedAccount});
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                // -HTTP 403 FORBIDDEN invalid token
                // -HTTP 400 BAD_REQUEST if the user doesn't exist
                //                         the social account doesn't exist
                //                         or the social account doesn't belong to the user
                log('get social account error:', error.response?.data.message);

                dispatch({type: FETCH_ACCOUNT_FAILED, errorMessage: 'Loading error'});
                if (error.response?.data.status_code == 403) {
                    //SESSION EXPIRED
                    setTokenExpired?.(true)
                    //SET THE ACCOUNT ID TO UNDEFINED
                    socialAccountId.current = undefined
                }
            } else {
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                log('get social accounts error:', 'SERVER ERROR');
                dispatch({type: FETCH_ACCOUNT_FAILED, errorMessage: 'Network Error'});
            }
        }
    }


    async function reFetchSocialAccountCallback(): Promise<void> {
        //FETCH AGAIN THE ACCOUNT DETAILS BASED ON THE STORED ID
        //IF THE STORED ID IS UNDEFINED, THEN THIS FUNCTION DOESN'T DO ANYTHING
        if (socialAccountId.current) {
            dispatch({type: FETCH_ACCOUNT_STARTED});
            log('trying to fetch again social account');
            try {
                const response = await getSocialAccountApi(socialAccountId.current, token); // Await the response directly
                log('social account fetched again successfully:', response);

                // BEFORE SETTING THE RETRIEVED SOCIAL ACCOUNT, WE FETCH THE IMAGE FOR EACH PROFILE PHOTO
                const mappedAccount: SocialAccount = await convertSocialAccountFullToSocialAccount(response.social_account)

                //SET THE CURRENT SOCIAL ACCOUNT ID
                socialAccountId.current = mappedAccount.id
                dispatch({type: FETCH_ACCOUNT_SUCCEEDED, socialAccount: mappedAccount});
            } catch (error) {
                //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
                if (axios.isAxiosError(error)) {
                    // -HTTP 403 FORBIDDEN invalid token
                    // -HTTP 400 BAD_REQUEST if the user doesn't exist
                    //                         the social account doesn't exist
                    //                         or the social account doesn't belong to the user
                    log('fetched again social account error:', error.response?.data.message);

                    dispatch({type: FETCH_ACCOUNT_FAILED, errorMessage: 'Loading error'});
                    if (error.response?.data.status_code == 403) {
                        //SESSION EXPIRED
                        setTokenExpired?.(true)
                        //SET THE ACCOUNT ID TO UNDEFINED
                        socialAccountId.current = undefined
                    }
                } else {
                    //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                    log('fetched again social accounts error:', 'SERVER ERROR');
                    dispatch({type: FETCH_ACCOUNT_FAILED, errorMessage: 'Network Error'});
                }
            }
        }
    }

    async function notifyAccountDetailsDeleteCallback(socialAccountId: number): Promise<void> {
        log('ws update social account deleted');
        dispatch({type: UPDATE_SOCIAL_ACCOUNT_DELETED, socialAccountId: socialAccountId});
    }

    async function notifyAccountDetailsEditedCallback(socialAccountEdited: UpdateSocialAccountNotify): Promise<void> {
        log('ws update social account edited');
        if (socialAccountId.current == socialAccountEdited.id) {
            const profilePhotoImageBlob = await fetchImageApi(socialAccountEdited.profile_photo, token);

            const socialAccEdited = {
                id: socialAccountEdited.id,
                username: socialAccountEdited.username,
                profile_description: socialAccountEdited.profile_description,
                no_followers: socialAccountEdited.no_followers,
                no_following: socialAccountEdited.no_following,
                no_of_posts: socialAccountEdited.no_of_posts,
                profile_photo_url: profilePhotoImageBlob,
                modified: socialAccountEdited.modified,

                posts: []
            } as SocialAccount
            dispatch({type: UPDATE_SOCIAL_ACCOUNT_EDITED, socialAccount: socialAccEdited});
        }
    }

    async function notifyAccountDetailsPostDeletedCallback(post_id: number): Promise<void> {
        log('ws notify post deleted');
        dispatch({type: UPDATE_SOCIAL_ACCOUNT_POST_DELETED, post_id: post_id});
    }

    async function notifyAccountDetailsPostAddedCallback(postAdded: AddedPostNotify): Promise<void> {
        log('ws notify post added');
        //ADD THE POST ONLY IF IT BELONGS TO THE CURRENT SOCIAL ACCOUNT

        if (socialAccountId.current == postAdded.profileId) {
            const postComments: PostComment[] = []
            const postPhotos: PostPhoto[] = []

            postAdded.comments.forEach(( (comment)=>{
                postComments.push({
                    id: comment.id,
                    comment:comment.comment
                })
            }))
            for(const photo of postAdded.photos){
                const postPhotoImageBlob = await fetchImageApi(photo.photo_filename, token);
                postPhotos.push({
                    id: photo.id,
                    photo_url: postPhotoImageBlob ? postPhotoImageBlob : undefined
                })
            }

            const post = {
                id: postAdded.id,
                description: postAdded.description,
                no_likes: postAdded.no_likes,
                no_comments: postAdded.no_comments,
                date_posted: new Date(postAdded.date_posted),

                comments: postComments,
                photos: postPhotos,
            } as Post
            dispatch({type: UPDATE_SOCIAL_ACCOUNT_POST_ADDED, post: post});
        }

    }

    async function notifyAccountDetailsPostEditedCallback(postEdited: UpdatedPostNotify): Promise<void> {
        log('ws notify post edited');

        //UPDATE THE POST ONLY IF IT BELONGS TO THE CURRENT SOCIAL ACCOUNT
        if (socialAccountId.current == postEdited.profileId) {
            const postComments: PostComment[] = []
            const postPhotos: PostPhoto[] = []

            postEdited.comments.forEach(( (comment)=>{
                postComments.push({
                    id: comment.id,
                    comment:comment.comment
                })
            }))
            for(const photo of postEdited.photos){
                const postPhotoImageBlob = await fetchImageApi(photo.photo_filename, token);
                postPhotos.push({
                    id: photo.id,
                    photo_url: postPhotoImageBlob ? postPhotoImageBlob : undefined
                })
            }

            const post = {
                id: postEdited.id,
                description: postEdited.description,
                no_likes: postEdited.no_likes,
                no_comments: postEdited.no_comments,
                date_posted: new Date(postEdited.date_posted),

                comments: postComments,
                photos: postPhotos,
            } as Post
            dispatch({type: UPDATE_SOCIAL_ACCOUNT_POST_EDITED, post: post});
        }
    }

};
