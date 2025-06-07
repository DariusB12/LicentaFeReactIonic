import React, {useCallback, useContext} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from "../../assets";
import {
    DetectPostDataFn,
    DetectProfileDataFn
} from "./YoloDetectionContext";
import axios from "axios";
import {YoloDetectionContext} from "./YoloDetectionContext";
import {AuthContext} from "../AuthProvider/AuthContext";
import {DetectProfileResponse} from "../../assets/Responses/yoloResponses/DetectProfileResponse";
import {detectPostDataApi, detectProfileDataApi} from "../../services/yoloDetection/yoloDetectionApi";
import {DetectPostResponse} from "../../assets/Responses/yoloResponses/DetectPostResponse";

const log = getLogger('YoloDetectionProvider');

interface YoloDetectionProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const YoloDetectionProvider: React.FC<YoloDetectionProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext)

    //FUNCTIONS
    const detectProfileData = useCallback<DetectProfileDataFn>(detectProfileDataCallback, [token])
    const detectPostData = useCallback<DetectPostDataFn>(detectPostDataCallback, [token])

    const value = {
        detectProfileData,
        detectPostData
    };
    log('render');
    return <YoloDetectionContext.Provider value={value}>{children}</YoloDetectionContext.Provider>;


    async function detectProfileDataCallback(image: string): Promise<DetectProfileResponse> {
        log('trying to detect profile data');
        try {
            const response = await detectProfileDataApi(image, token); // Await the response directly
            log('detect profile success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('detect profile error:', error.response?.data.message);
                return {message:error.response?.data.message, status_code:error.response?.data.status_code}
            } else {
                log('detect profile error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message:'Server Error', status_code:500}
            }
        }
    }
    async function detectPostDataCallback(image: string): Promise<DetectPostResponse> {
        log('trying to detect post data');
        try {
            const response = await detectPostDataApi(image, token); // Await the response directly
            log('detect post success:', response);
            return response;
        } catch (error) {
            //AXIOS ERROR IF SERVER RESPONDED WITH A REQUEST DIFFERENT THAN 200OK
            if (axios.isAxiosError(error)) {
                log('detect post error:', error.response?.data.message);
                return {message:error.response?.data.message, status_code:error.response?.data.status_code,comments:[]}
            } else {
                log('detect post error:', 'SERVER ERROR');
                //OTHERWISE IT IS A SERVER CRASH OR CONNECTION ERROR
                return {message:'Server Error', status_code:500,comments:[]}
            }
        }
    }

};
