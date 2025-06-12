import React from "react";
import {AddSocialAccountPostReq} from "../../assets/Requests/socialAccountPostReq/AddSocialAccountPostReq";
import {
    AddSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/AddSocialAccountPostResponse";
import {
    DeleteSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/DeleteSocialAccountPostResponse";
import {UpdateSocialAccountPostReq} from "../../assets/Requests/socialAccountPostReq/UpdateSocialAccountPostReq";
import {
    UpdateSocialAccountPostResponse
} from "../../assets/Responses/socialAccountPostResponse/UpdateSocialAccountPostResponse";



export type AddSocialAccountPostFn = (postRequest: AddSocialAccountPostReq) => Promise<AddSocialAccountPostResponse>;
export type DeleteSocialAccountPostFn = (post_id:number) => Promise<DeleteSocialAccountPostResponse>;
export type UpdateSocialAccountPostFn = (postToUpdate: UpdateSocialAccountPostReq) => Promise<UpdateSocialAccountPostResponse>;

export interface SocialAccountPostsContextState {
    addSocialAccountPost?: AddSocialAccountPostFn
    deleteSocialAccountPost?:DeleteSocialAccountPostFn
    updateSocialAccountPost?:UpdateSocialAccountPostFn
}

export const initialState: SocialAccountPostsContextState = {
};

export const SocialAccountPostsContext = React.createContext<SocialAccountPostsContextState>(initialState);
