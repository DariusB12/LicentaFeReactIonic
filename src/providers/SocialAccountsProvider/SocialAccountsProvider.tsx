import React, {useCallback, useContext} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from "../../assets";

import axios from "axios";

import {AuthContext} from "../AuthProvider/AuthContext";
import {AddSocialAccountFn, SocialAccountsContext} from "./SocialAccountsContext";
import {addSocialAccountApi} from "../../services/socialAccounts/socialAccountsApi";
import {AddSocialAccountReq} from "../../assets/Requests/socialAccountsRequest/AddSocialAccountReq";
import {AddSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/AddSocialAccountResponse";

const log = getLogger('SocialAccountsProvider');

interface SocialAccountsProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const SocialAccountsProvider: React.FC<SocialAccountsProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext)

    //FUNCTIONS
    const addSocialAccount = useCallback<AddSocialAccountFn>(addSocialAccountCallback, [token])

    const value = {
        addSocialAccount,
    };
    log('render');
    return <SocialAccountsContext.Provider value={value}>{children}</SocialAccountsContext.Provider>


    async function addSocialAccountCallback(socialAccountReq:AddSocialAccountReq): Promise<AddSocialAccountResponse> {
        log('trying to add social account');
        try {
            const response = await addSocialAccountApi(socialAccountReq, token); // Await the response directly
            log('social account added with success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('add social account error:', error.response?.data.message);
                return {message:error.response?.data.message, status_code:error.response?.data.status_code}
            } else {
                log('add social account error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message:'Server Error', status_code:500}
            }
        }
    }

};
