import React from "react";
import {DetectProfileResponse} from "../../assets/Responses/DetectProfileResponse";
import {DetectPostResponse} from "../../assets/Responses/DetectPostResponse";

export type DetectProfileDataFn = (image:string) => Promise<DetectProfileResponse>;
export type DetectPostDataFn = (image:string) => Promise<DetectPostResponse>;


export interface YoloDetectionState {
    detectProfileData?: DetectProfileDataFn;
    detectPostData?: DetectPostDataFn;
}

export const initialState: YoloDetectionState = {
};

export const YoloDetectionContext = React.createContext<YoloDetectionState>(initialState);
