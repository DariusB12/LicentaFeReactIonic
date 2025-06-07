import React from "react";
import {TranslateProfileResponse} from "../../assets/Responses/nllbTranslationResponse/TranslateProfileResponse";
import {TranslatePostResponse} from "../../assets/Responses/nllbTranslationResponse/TranslatePostResponse";
import {TranslatePostRequest} from "../../assets/Requests/nllbTranslationRequest/TranslatePostRequest";

export type TranslateProfileFn = (description:string) => Promise<TranslateProfileResponse>;
export type TranslatePostFn = (postRequest:TranslatePostRequest) => Promise<TranslatePostResponse>;

export interface NllbTranslationState {
    translateProfile?: TranslateProfileFn;
    translatePost?: TranslatePostFn;
}

export const initialState: NllbTranslationState = {
};

export const NllbTranslationContext = React.createContext<NllbTranslationState>(initialState);
