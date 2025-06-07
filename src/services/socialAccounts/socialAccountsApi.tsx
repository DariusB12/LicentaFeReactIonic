import axios from 'axios';
import {baseUrl, configToken, withLogs} from "../../assets";
import {AddSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/AddSocialAccountResponse";
import {AddSocialAccountReq} from "../../assets/Requests/socialAccountsRequest/AddSocialAccountReq";

const socialAccountsApiUrl = `http://${baseUrl}/accounts`;


export const addSocialAccountApi = (socialAccount:AddSocialAccountReq,  token: string | null): Promise<AddSocialAccountResponse> => {
    return withLogs(
        axios.post(`${socialAccountsApiUrl}/add`, socialAccount, configToken(token)),
        'addSocialAccountApi'
    );
};