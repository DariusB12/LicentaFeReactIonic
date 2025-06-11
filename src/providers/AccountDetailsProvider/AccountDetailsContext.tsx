import React from "react";
import {SocialAccount} from "../../assets/entities/SocialAccount";
import {UpdateSocialAccountNotify} from "../../assets/WebsocketNotifications/UpdateSocialAccountNotify";
import {AddedPostNotify} from "../../assets/WebsocketNotifications/AddedPostNotify";

export type FetchSocialAccountFn = (socialAccountId:number) => void;
export type ReFetchSocialAccountFn = () => void;

export type NotifyAccountDetailsDeleteFn = (socialAccountId:number) => Promise<void>;
export type NotifyAccountDetailsEditedFn = (socialAccountEdited:UpdateSocialAccountNotify) => Promise<void>;
export type NotifyAccountDetailsPostDeletedFn = (postId:number) => Promise<void>;
export type NotifyAccountDetailsPostAddedFn = (postAdded:AddedPostNotify) => Promise<void>;


export interface AccountDetailsState {
    fetchSocialAccount?:FetchSocialAccountFn
    reFetchSocialAccount?:ReFetchSocialAccountFn

    notifyAccountDetailsDelete?:NotifyAccountDetailsDeleteFn
    notifyAccountDetailsEdited?:NotifyAccountDetailsEditedFn
    notifyAccountDetailsPostDeleted?: NotifyAccountDetailsPostDeletedFn
    notifyAccountDetailsPostAdded?: NotifyAccountDetailsPostAddedFn

    socialAccount?: SocialAccount
    fetching:boolean
    fetchingError:boolean
    errorMessage:string
    accountDeleted:boolean
}

export const initialState: AccountDetailsState = {
    fetching:false,
    fetchingError:false,
    errorMessage:'',
    accountDeleted:false,
};

export const AccountDetailsContext = React.createContext<AccountDetailsState>(initialState);
