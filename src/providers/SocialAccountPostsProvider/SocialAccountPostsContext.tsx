import React from "react";
import {AddSocialAccountPostReq} from "../../assets/Requests/socialAccountPostReq/AddSocialAccountPostReq";
import {
    AddSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/AddSocialAccountPostResponse";
import {
    DeleteSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/DeleteSocialAccountPostResponse";



export type AddSocialAccountPostFn = (postRequest: AddSocialAccountPostReq) => Promise<AddSocialAccountPostResponse>;
export type DeleteSocialAccountPostFn = (post_id:number) => Promise<DeleteSocialAccountPostResponse>;

export interface SocialAccountPostsContextState {
    addSocialAccountPost?: AddSocialAccountPostFn
    deleteSocialAccountPost?:DeleteSocialAccountPostFn
}

export const initialState: SocialAccountPostsContextState = {

};

export const SocialAccountPostsContext = React.createContext<SocialAccountPostsContextState>(initialState);
