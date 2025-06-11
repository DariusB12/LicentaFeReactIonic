import React, {useCallback, useContext, useEffect, useReducer, useRef} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from "../../assets";

import axios from "axios";

import {AuthContext} from "../AuthProvider/AuthContext";
import {
    AddSocialAccountFn, DeleteSocialAccountFn,
    FetchSocialAccountsFn,
    initialState, NotifySocialAccountAddedFn, NotifySocialAccountDeletedFn, NotifySocialAccountEditedFn,
    SocialAccountsContext,
    SocialAccountsState, UpdateSocialAccountFn
} from "./SocialAccountsContext";
import {
    addSocialAccountApi,
    deleteSocialAccountApi,
    updateSocialAccountApi
} from "../../services/socialAccounts/socialAccountsApi";
import {AddSocialAccountReq} from "../../assets/Requests/socialAccountsRequest/AddSocialAccountReq";
import {AddSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/AddSocialAccountResponse";
import {SocialAccountDTOUrl} from "../../assets/entities/SocialAccountDTOUrl";
import {SocialAccountDTO, SocialAccountsResponse} from "../../assets/Responses/userResponses/SocialAccountsResponse";
import {getUserSocialAccountsApi} from "../../services/user/userApi";
import {fetchImageApi} from "../../services/photo/photoApi";
import {DeleteSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/DeleteSocialAccountResponse";
import {UpdateSocialAccountRequest} from "../../assets/Requests/socialAccountsRequest/UpdateSocialAccountRequest";
import {UpdateSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/UpdateSocialAccountResponse";
import {UpdateSocialAccountNotify} from "../../assets/WebsocketNotifications/UpdateSocialAccountNotify";

const log = getLogger('SocialAccountsProvider');

interface ActionProps {
    type: string,
    socialAccounts?: SocialAccountDTOUrl[]
    socialAccountId?: number
    socialAccount?: SocialAccountDTOUrl
}

const FETCH_ACCOUNTS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ACCOUNTS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ACCOUNTS_FAILED = 'FETCH_ITEMS_FAILED';

const UPDATE_SOCIAL_ACCOUNT_DELETED = 'UPDATE_SOCIAL_ACCOUNT_DELETED';
const UPDATE_SOCIAL_ACCOUNT_ADDED = 'UPDATE_SOCIAL_ACCOUNT_ADDED';
const UPDATE_SOCIAL_ACCOUNT_EDITED = 'UPDATE_SOCIAL_ACCOUNT_EDITED';


const reducer: (state: SocialAccountsState, action: ActionProps) => SocialAccountsState =
    (state, action) => {
        switch (action.type) {
            case FETCH_ACCOUNTS_STARTED:
                return {...state, fetching: true, fetchingError: false};
            case FETCH_ACCOUNTS_SUCCEEDED:
                return {
                    ...state,
                    socialAccounts: action.socialAccounts ? action.socialAccounts : [],
                    fetching: false,
                    fetchingError: false
                };
            case FETCH_ACCOUNTS_FAILED:
                return {...state, fetchingError: true, fetching: false};
            case UPDATE_SOCIAL_ACCOUNT_DELETED:
                return {
                    ...state,
                    socialAccounts: state.socialAccounts.filter(account => account.id !== action.socialAccountId)
                };
            case UPDATE_SOCIAL_ACCOUNT_ADDED: {
                // [...LIST] IT CREATES A SHALLOW COPY (NEW LIST SAME ELEMENTS)
                const socialAccountsUpdated: SocialAccountDTOUrl[] = action.socialAccount ? [...state.socialAccounts, action.socialAccount] : [...state.socialAccounts];
                return {
                    ...state,
                    socialAccounts: socialAccountsUpdated
                }
            }
            case UPDATE_SOCIAL_ACCOUNT_EDITED: {
                const updatedAccount = action.socialAccount;

                const socialAccountsUpdated: SocialAccountDTOUrl[] = state.socialAccounts.map(account => {
                        if (account.id === updatedAccount?.id) {
                            return {
                                id: updatedAccount.id,
                                username: updatedAccount.username,
                                profile_photo_url: updatedAccount.profile_photo_url,
                                no_followers: updatedAccount.no_followers,
                                no_following: updatedAccount.no_following,
                                no_of_posts:updatedAccount.no_of_posts,
                                analysed: account.analysed
                            }
                        }
                        return account;
                    }
                );

                return {
                    ...state,
                    socialAccounts: socialAccountsUpdated
                };
            }
            default:
                return state;
        }
    };


interface SocialAccountsProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const SocialAccountsProvider: React.FC<SocialAccountsProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext)
    const [state, dispatch] = useReducer(reducer, initialState);
    const {socialAccounts, fetching, fetchingError} = state;

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

        //UPDATE THE REF WHEN THE LIST IS CHANGED
        socialAccounts.forEach(account => {
            if (account.profile_photo_url) {
                newUrls.add(account.profile_photo_url);
            }
        });

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

    }, [socialAccounts]); // This effect runs whenever socialAccounts changes


    //FUNCTIONS
    const addSocialAccount = useCallback<AddSocialAccountFn>(addSocialAccountCallback, [token])
    const updateSocialAccount = useCallback<UpdateSocialAccountFn>(updateSocialAccountCallback, [token])
    const deleteSocialAccount = useCallback<DeleteSocialAccountFn>(deleteSocialAccountCallback, [token])

    //FUNCTIONS FOR WS UPDATES
    const notifySocialAccountDeleted = useCallback<NotifySocialAccountDeletedFn>(notifySocialAccountDeletedCallback, [])
    const notifySocialAccountAdded = useCallback<NotifySocialAccountAddedFn>(notifySocialAccountAddedCallback, [token])
    const notifySocialAccountEdited = useCallback<NotifySocialAccountEditedFn>(notifySocialAccountEditedCallback, [token])

    const fetchSocialAccounts = useCallback<FetchSocialAccountsFn>(fetchSocialAccountsCallback, [token])

    const value = {
        addSocialAccount,
        updateSocialAccount,
        deleteSocialAccount,
        notifySocialAccountDeleted,
        notifySocialAccountAdded,
        notifySocialAccountEdited,
        fetchSocialAccounts,
        fetching,
        fetchingError,
        socialAccounts,
    };
    log('render');

    return <SocialAccountsContext.Provider value={value}>{children}</SocialAccountsContext.Provider>


    async function fetchSocialAccountsCallback(): Promise<SocialAccountsResponse> {
        dispatch({type: FETCH_ACCOUNTS_STARTED});
        log('trying to get social accounts');
        try {
            const response = await getUserSocialAccountsApi(token); // Await the response directly
            log('social accounts retrieved successfully:', response);

            // BEFORE SETTING THE RETRIEVED SOCIAL ACCOUNT, WE FETCH THE IMAGE FOR EACH PROFILE PHOTO
            let mappedAccounts: SocialAccountDTOUrl[] = []
            if (response.social_accounts) {
                mappedAccounts = await Promise.all(
                    response.social_accounts?.map(async (account) => {
                        if (account.profile_photo_filename) {
                            const imageBlob = await fetchImageApi(account.profile_photo_filename, token);
                            return {
                                id: account.id,
                                username: account.username,
                                profile_photo_url: imageBlob,
                                no_followers: account.no_followers,
                                no_following: account.no_following,
                                no_of_posts: account.no_of_posts,
                                analysed: account.analysed
                            } as SocialAccountDTOUrl
                        }
                        return {
                            id: account.id,
                            username: account.username,
                            profile_photo_url: null,
                            no_followers: account.no_followers,
                            no_following: account.no_following,
                            no_of_posts: account.no_of_posts,
                            analysed: account.analysed
                        } as SocialAccountDTOUrl
                    })
                )

            }

            dispatch({type: FETCH_ACCOUNTS_SUCCEEDED, socialAccounts: mappedAccounts});
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('get social accounts error:', error.response?.data.message);
                dispatch({type: FETCH_ACCOUNTS_FAILED});
                return {message: error.response?.data.message, status_code: error.response?.data.status_code}
            } else {
                log('get social accounts error:', 'SERVER ERROR');
                dispatch({type: FETCH_ACCOUNTS_FAILED});
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message: 'Server Error', status_code: 500}
            }
        }
    }

    async function addSocialAccountCallback(socialAccountReq: AddSocialAccountReq): Promise<AddSocialAccountResponse> {
        log('trying to add social account');
        try {
            const response = await addSocialAccountApi(socialAccountReq, token); // Await the response directly
            log('social account added with success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('add social account error:', error.response?.data.message);
                return {message: error.response?.data.message, status_code: error.response?.data.status_code}
            } else {
                log('add social account error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message: 'Server Error', status_code: 500}
            }
        }
    }

    async function updateSocialAccountCallback(socialAccountReq: UpdateSocialAccountRequest): Promise<UpdateSocialAccountResponse> {
        log('trying to update social account');
        try {
            const response = await updateSocialAccountApi(socialAccountReq, token); // Await the response directly
            log('social account updated with success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('update social account error:', error.response?.data.message);
                return {message: error.response?.data.message, status_code: error.response?.data.status_code}
            } else {
                log('update social account error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message: 'Server Error', status_code: 500}
            }
        }
    }

    async function deleteSocialAccountCallback(socialAccountId: number): Promise<DeleteSocialAccountResponse> {
        log('trying to delete social account');
        try {
            const response = await deleteSocialAccountApi(socialAccountId, token); // Await the response directly
            log('social account deleted with success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('delete social account error:', error.response?.data.message);
                return {message: error.response?.data.message, status_code: error.response?.data.status_code}
            } else {
                log('delete social account error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message: 'Server Error', status_code: 500}
            }
        }
    }


    async function notifySocialAccountDeletedCallback(socialAccountId: number): Promise<void> {
        log('ws update social account deleted');
        dispatch({type: UPDATE_SOCIAL_ACCOUNT_DELETED, socialAccountId: socialAccountId});
    }

    async function notifySocialAccountAddedCallback(socialAccount: SocialAccountDTO): Promise<void> {
        log('ws update social account added');

        const imageBlob = await fetchImageApi(socialAccount.profile_photo_filename, token);
        const socialAccountAdded = {
            id: socialAccount.id,
            username: socialAccount.username,
            profile_photo_url: imageBlob,
            no_followers: socialAccount.no_followers,
            no_following: socialAccount.no_following,
            no_of_posts: socialAccount.no_of_posts,
            analysed: socialAccount.analysed
        } as SocialAccountDTOUrl

        dispatch({type: UPDATE_SOCIAL_ACCOUNT_ADDED, socialAccount: socialAccountAdded});
    }

    async function notifySocialAccountEditedCallback(socialAccount: UpdateSocialAccountNotify): Promise<void> {
        log('ws update social account edited');

        const imageBlob = await fetchImageApi(socialAccount.profile_photo, token);
        const socialAccountUpdated = {
            id: socialAccount.id,
            username: socialAccount.username,
            profile_photo_url: imageBlob,
            no_followers: socialAccount.no_followers,
            no_following: socialAccount.no_following,
            no_of_posts: socialAccount.no_of_posts,
            //the analysis remains the same (will be modified through ANALYSIS_MADE notifications)
            // analysed: NONE
        } as SocialAccountDTOUrl

        dispatch({type: UPDATE_SOCIAL_ACCOUNT_EDITED, socialAccount: socialAccountUpdated});
    }
};
