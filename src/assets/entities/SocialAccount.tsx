import {Post} from "./Post";
import {Analysis} from "./Analysis";

export interface SocialAccount {
    id: number,
    username: string,
    profile_description: string,
    profile_photo_url?: string,
    no_followers: number,
    no_following: number
    no_of_posts: number,
    modified: boolean,

    posts: Post[]
    analysis?: Analysis
}
