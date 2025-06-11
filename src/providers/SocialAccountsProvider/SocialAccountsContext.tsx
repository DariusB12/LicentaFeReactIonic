import React from "react";
import {AddSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/AddSocialAccountResponse";
import {AddSocialAccountReq} from "../../assets/Requests/socialAccountsRequest/AddSocialAccountReq";
import {SocialAccountDTOUrl} from "../../assets/entities/SocialAccountDTOUrl";
import {SocialAccountDTO, SocialAccountsResponse} from "../../assets/Responses/userResponses/SocialAccountsResponse";
import {DeleteSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/DeleteSocialAccountResponse";
import {UpdateSocialAccountRequest} from "../../assets/Requests/socialAccountsRequest/UpdateSocialAccountRequest";
import {UpdateSocialAccountResponse} from "../../assets/Responses/socialAccountsResponse/UpdateSocialAccountResponse";
import {UpdateSocialAccountNotify} from "../../assets/WebsocketNotifications/UpdateSocialAccountNotify";

export type AddSocialAccountFn = (socialAccountRequest:AddSocialAccountReq) => Promise<AddSocialAccountResponse>;
export type DeleteSocialAccountFn = (socialAccountId:number) => Promise<DeleteSocialAccountResponse>;
export type UpdateSocialAccountFn = (updateSocialAccount:UpdateSocialAccountRequest) => Promise<UpdateSocialAccountResponse>;

export type NotifySocialAccountDeletedFn = (socialAccountId:number) => Promise<void>;
export type NotifySocialAccountAddedFn = (socialAccount:SocialAccountDTO) => Promise<void>;
export type NotifySocialAccountEditedFn = (socialAccountEdited:UpdateSocialAccountNotify) => Promise<void>;

export type FetchSocialAccountsFn = () => Promise<SocialAccountsResponse>;


export interface SocialAccountsState {
    addSocialAccount?:AddSocialAccountFn
    deleteSocialAccount?:DeleteSocialAccountFn
    updateSocialAccount?:UpdateSocialAccountFn

    fetchSocialAccounts?:FetchSocialAccountsFn
    socialAccounts: SocialAccountDTOUrl[]
    fetching:boolean
    fetchingError:boolean

    notifySocialAccountDeleted?: NotifySocialAccountDeletedFn
    notifySocialAccountAdded?: NotifySocialAccountAddedFn
    notifySocialAccountEdited?: NotifySocialAccountEditedFn
}

export const initialState: SocialAccountsState = {
    socialAccounts:[],
    fetching:false,
    fetchingError:false,
};

export const SocialAccountsContext = React.createContext<SocialAccountsState>(initialState);
