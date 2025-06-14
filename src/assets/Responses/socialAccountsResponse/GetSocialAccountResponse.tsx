import {AnalysisDTO} from "../../entities/AnalysisDTO";


export interface CommentFull {
    id: number,
    content: string
}


export interface PostPhotoFull {
    id: number,
    post_photo_filename: string,
}

export interface PostFull {
    id: number,
    description: string,
    noLikes: number,
    noComments: number,
    datePosted: string
    photos: PostPhotoFull[]
    comments: CommentFull[]
}

export interface SocialAccountFull {
    id: number,
    username: string,
    profile_description: string,
    profile_photo_filename: string,
    no_followers: number,
    no_following: number
    no_of_posts: number,
    modified: boolean,

    posts: PostFull[]
    analysis: AnalysisDTO | null

}

export interface GetSocialAccountResponse {
    message: string
    status_code: number

    social_account: SocialAccountFull
}
