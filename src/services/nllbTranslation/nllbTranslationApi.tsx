import axios from 'axios';
import {baseUrl, configToken, withLogs} from "../../assets";
import {TranslateProfileResponse} from "../../assets/Responses/nllbTranslationResponse/TranslateProfileResponse";
import {TranslatePostRequest} from "../../assets/Requests/nllbTranslationRequest/TranslatePostRequest";
import {TranslatePostResponse} from "../../assets/Responses/nllbTranslationResponse/TranslatePostResponse";

const nllbTranslationUrl = `http://${baseUrl}/translate`;


export const translateProfileApi: (description: string, token: string | null) => Promise<TranslateProfileResponse> = (description, token) => {
    return withLogs(axios.post(`${nllbTranslationUrl}/profile`, {description}, configToken(token)), 'translateProfileApi');
}

export const translatePostApi = (postRequest: TranslatePostRequest, token: string | null): Promise<TranslatePostResponse> => {
    return withLogs(
        axios.post(`${nllbTranslationUrl}/post`, postRequest, configToken(token)),
        'translatePostApi'
    );
};
