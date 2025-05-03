import {Post} from "./Post";

export interface SocialAccount {
    id: number,
    username: string,
    profile_description:string,
    profile_photo?: string,
    no_followers: number,
    no_following: number
    no_of_posts: number,
    posts: Post[]
}
