import React from "react";
import {AddSocialAccountPostReq} from "../../assets/Requests/socialAccountPostReq/AddSocialAccountPostReq";
import {
    AddSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/AddSocialAccountPostResponse";

export type AddSocialAccountPostFn = (postRequest: AddSocialAccountPostReq) => Promise<AddSocialAccountPostResponse>;

export interface SocialAccountPostsContextState {
    addSocialAccountPost?: AddSocialAccountPostFn
}

export const initialState: SocialAccountPostsContextState = {

};

export const SocialAccountPostsContext = React.createContext<SocialAccountPostsContextState>(initialState);
