import axios from 'axios';
import {baseUrl, configToken, withLogs} from "../../assets";
import {AddSocialAccountPostReq} from "../../assets/Requests/socialAccountPostReq/AddSocialAccountPostReq";
import {
    AddSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/AddSocialAccountPostResponse";
import {
    DeleteSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/DeleteSocialAccountPostResponse";

const socialAccountPostsApiUrl = `http://${baseUrl}/posts`;


export const addSocialAccountPostApi = (post:AddSocialAccountPostReq,  token: string | null): Promise<AddSocialAccountPostResponse> => {
    return withLogs(
        axios.post(`${socialAccountPostsApiUrl}/add`, post, configToken(token)),
        'addSocialAccountPostApi'
    );
};

export const deleteSocialAccountPostApi = (post_id:number,  token: string | null): Promise<DeleteSocialAccountPostResponse> => {
    return withLogs(
        axios.delete(`${socialAccountPostsApiUrl}/${post_id}`, configToken(token)),
        'deleteSocialAccountPostApi'
    );
};