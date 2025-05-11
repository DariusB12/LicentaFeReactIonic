import {PostPhoto} from "./PostPhoto";
import {PostComment} from "./PostComment";

export interface Post {
    id: number,
    photos: PostPhoto[],
    description: string,
    no_likes: number,
    no_comments: number,
    comments: PostComment[],
    date_posted: Date
}
