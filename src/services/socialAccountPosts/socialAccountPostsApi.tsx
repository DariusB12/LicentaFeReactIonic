import axios from 'axios';
import {baseUrl, configToken, withLogs} from "../../assets";
import {AddSocialAccountPostReq} from "../../assets/Requests/socialAccountPostReq/AddSocialAccountPostReq";
import {
    AddSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/AddSocialAccountPostResponse";

const socialAccountPostsApiUrl = `http://${baseUrl}/posts`;


export const addSocialAccountPostApi = (post:AddSocialAccountPostReq,  token: string | null): Promise<AddSocialAccountPostResponse> => {
    return withLogs(
        axios.post(`${socialAccountPostsApiUrl}/add`, post, configToken(token)),
        'addSocialAccountPostApi'
    );
};