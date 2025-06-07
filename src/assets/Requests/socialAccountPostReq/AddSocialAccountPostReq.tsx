
export interface AddSocialAccountPostReq {
    description: string
    noLikes: number
    noComments: number
    datePosted: string
    comments: string[]
    photos: string[]  // base64 format
    social_account_id: number
}