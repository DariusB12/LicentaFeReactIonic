
export interface SocialAccountDTO {
    id: number,
    username: string,
    profile_photo_filename: string,
    no_followers: number,
    no_following: number
    no_of_posts: number,
    analysed: boolean
}

export interface SocialAccountsResponse {
    message: string
    status_code: number

    social_accounts?: SocialAccountDTO[]
}