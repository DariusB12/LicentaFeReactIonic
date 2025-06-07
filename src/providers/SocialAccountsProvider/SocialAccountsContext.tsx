import React from "react";
import {AddSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/AddSocialAccountResponse";
import {AddSocialAccountReq} from "../../assets/Requests/socialAccountsRequest/AddSocialAccountReq";

export type AddSocialAccountFn = (socialAccountRequest:AddSocialAccountReq) => Promise<AddSocialAccountResponse>;

export interface SocialAccountsState {
    addSocialAccount?:AddSocialAccountFn
}

export const initialState: SocialAccountsState = {
};

export const SocialAccountsContext = React.createContext<SocialAccountsState>(initialState);
