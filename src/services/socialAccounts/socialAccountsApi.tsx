import axios from 'axios';
import {baseUrl, configToken, withLogs} from "../../assets";
import {AddSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/AddSocialAccountResponse";
import {AddSocialAccountReq} from "../../assets/Requests/socialAccountsRequest/AddSocialAccountReq";
import {DeleteSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/DeleteSocialAccountResponse";
import {GetSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/GetSocialAccountResponse";
import {UpdateSocialAccountRequest} from "../../assets/Requests/socialAccountsRequest/UpdateSocialAccountRequest";
import {UpdateSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/UpdateSocialAccountResponse";

const socialAccountsApiUrl = `http://${baseUrl}/accounts`;


export const addSocialAccountApi = (socialAccount:AddSocialAccountReq,  token: string | null): Promise<AddSocialAccountResponse> => {
    return withLogs(
        axios.post(`${socialAccountsApiUrl}/add`, socialAccount, configToken(token)),
        'addSocialAccountApi'
    );
};

export const deleteSocialAccountApi = (socialAccountId:number,  token: string | null): Promise<DeleteSocialAccountResponse> => {
    return withLogs(
        axios.delete(`${socialAccountsApiUrl}/delete/${socialAccountId}`, configToken(token)),
        'deleteSocialAccountApi'
    );
};

export const getSocialAccountApi = (socialAccountId:number,token: string | null): Promise<GetSocialAccountResponse> => {
    return withLogs(
        axios.get(`${socialAccountsApiUrl}/${socialAccountId}`, configToken(token)),
        'getSocialAccountApi'
    );
};

export const updateSocialAccountApi = (socialAccount:UpdateSocialAccountRequest,  token: string | null): Promise<UpdateSocialAccountResponse> => {
    return withLogs(
        axios.put(`${socialAccountsApiUrl}/update`, socialAccount, configToken(token)),
        'updateSocialAccountApi'
    );
};