
export interface AddSocialAccountReq {
    username : string
    profile_description:string
    no_followers:number
    no_following:number
    no_of_posts:number
    profile_photo:string  //SEND THE IMAGE IN BASE64 FORMAT
}