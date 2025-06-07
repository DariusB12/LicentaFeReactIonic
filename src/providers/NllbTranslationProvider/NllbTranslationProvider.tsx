import React, {useCallback, useContext} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from "../../assets";

import axios from "axios";

import {AuthContext} from "../AuthProvider/AuthContext";
import {NllbTranslationContext, TranslatePostFn, TranslateProfileFn} from "./NllbTranslationContext";
import {TranslateProfileResponse} from "../../assets/Responses/nllbTranslationResponse/TranslateProfileResponse";
import {translatePostApi, translateProfileApi} from "../../services/nllbTranslation/nllbTranslationApi";
import {TranslatePostResponse} from "../../assets/Responses/nllbTranslationResponse/TranslatePostResponse";
import {TranslatePostRequest} from "../../assets/Requests/nllbTranslationRequest/TranslatePostRequest";

const log = getLogger('NllbTranslationProvider');

interface NllbTranslationProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const NllbTranslationProvider: React.FC<NllbTranslationProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext)

    //FUNCTIONS
    const translateProfile = useCallback<TranslateProfileFn>(translateProfileCallback, [token])
    const translatePost = useCallback<TranslatePostFn>(translatePostCallback, [token])

    const value = {
        translateProfile,
        translatePost
    };
    log('render');
    return <NllbTranslationContext.Provider value={value}>{children}</NllbTranslationContext.Provider>


    async function translateProfileCallback(description: string): Promise<TranslateProfileResponse> {
        log('trying to translate profile data');
        try {
            const response = await translateProfileApi(description, token); // Await the response directly
            log('translate profile success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('translate profile error:', error.response?.data.message);
                return {message:error.response?.data.message, status_code:error.response?.data.status_code}
            } else {
                log('translate profile error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message:'Server Error', status_code:500}
            }
        }
    }
    async function translatePostCallback(postReq: TranslatePostRequest): Promise<TranslatePostResponse> {
        log('trying to translate post data');
        try {
            const response = await translatePostApi(postReq, token);
            log('translate post success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('translate post error:', error.response?.data.message);
                return {message:error.response?.data.message, status_code:error.response?.data.status_code}
            } else {
                log('translate post error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message:'Server Error', status_code:500}
            }
        }
    }


};
