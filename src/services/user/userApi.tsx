import axios from 'axios';
import {baseUrl, configToken, withLogs} from "../../assets";
import {SocialAccountsResponse} from "../../assets/Responses/userResponses/SocialAccountsResponse";

const userApiUrl = `http://${baseUrl}/user`;


export const getUserSocialAccountsApi = (token: string | null): Promise<SocialAccountsResponse> => {
    return withLogs(
        axios.get(`${userApiUrl}/accounts`, configToken(token)),
        'getUserSocialAccountsApi'
    );
};

