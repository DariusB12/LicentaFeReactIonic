import React, {useCallback, useContext} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from "../../assets";

import axios from "axios";

import {AuthContext} from "../AuthProvider/AuthContext";
import {
    AddSocialAccountPostFn,
    DeleteSocialAccountPostFn,
    SocialAccountPostsContext
} from "./SocialAccountPostsContext";
import {AddSocialAccountPostReq} from "../../assets/Requests/socialAccountPostReq/AddSocialAccountPostReq";
import {
    AddSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/AddSocialAccountPostResponse";
import {
    addSocialAccountPostApi,
    deleteSocialAccountPostApi
} from "../../services/socialAccountPosts/socialAccountPostsApi";
import {
    DeleteSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/DeleteSocialAccountPostResponse";

const log = getLogger('SocialAccountPostsProvider');

interface SocialAccountPostsProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const SocialAccountPostsProvider: React.FC<SocialAccountPostsProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext)

    //FUNCTIONS
    const addSocialAccountPost = useCallback<AddSocialAccountPostFn>(addPostCallback, [token])
    const deleteSocialAccountPost = useCallback<DeleteSocialAccountPostFn>(deletePostCallback, [token])

    const value = {
        addSocialAccountPost,
        deleteSocialAccountPost
    };
    log('render');
    return <SocialAccountPostsContext.Provider value={value}>{children}</SocialAccountPostsContext.Provider>


    async function addPostCallback(post:AddSocialAccountPostReq): Promise<AddSocialAccountPostResponse> {
        log('trying to add post');
        try {
            const response = await addSocialAccountPostApi(post, token); // Await the response directly
            log('post added with success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('add post error:', error.response?.data.message);
                return {message:error.response?.data.message, status_code:error.response?.data.status_code}
            } else {
                log('add post error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message:'Server Error', status_code:500}
            }
        }
    }

    async function deletePostCallback(post_id:number): Promise<DeleteSocialAccountPostResponse> {
        log('trying to delete post');
        try {
            const response = await deleteSocialAccountPostApi(post_id, token); // Await the response directly
            log('post deleted with success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('delete post error:', error.response?.data.message);
                return {message:error.response?.data.message, status_code:error.response?.data.status_code}
            } else {
                log('delete post error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message:'Server Error', status_code:500}
            }
        }
    }
};
