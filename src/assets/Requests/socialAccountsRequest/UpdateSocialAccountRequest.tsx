

export interface UpdateSocialAccountRequest {
    id: number
    username: string
    profile_description: string
    no_followers: number
    no_following: number
    no_of_posts: number
    profile_photo: string //base64
}