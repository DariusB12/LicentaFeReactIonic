import axios from 'axios';
import {baseUrl, configToken, withLogs} from "../../assets";
import {DetectProfileResponse} from "../../assets/Responses/DetectProfileResponse";
import {DetectPostResponse} from "../../assets/Responses/DetectPostResponse";

const yoloDetectionUrl = `http://${baseUrl}/yolo`;


export const detectProfileDataApi: (image: string,token: string|null) => Promise<DetectProfileResponse> = (image,token) => {
    return withLogs(axios.post(`${yoloDetectionUrl}/profile`, { image }, configToken(token)), 'detectProfileDataApi');
}

export const detectPostDataApi: (image: string,token: string|null) => Promise<DetectPostResponse> = (image,token) => {
    return withLogs(axios.post(`${yoloDetectionUrl}/post`, { image }, configToken(token)), 'detectPostDataApi');
}