
export interface SocialAccountDTOUrl {
    // social account without posts, for displaying lists
    id: number,
    username: string,
    profile_photo_url: string | null,
    no_followers: number,
    no_following: number
    no_of_posts: number,
    analysed: boolean
}
