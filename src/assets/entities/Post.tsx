import {PostPhoto} from "./PostPhoto";
import {PostComment} from "./PostComment";

export interface Post {
    id: number,
    description: string,
    no_likes: number,
    no_comments: number,
    date_posted: Date,

    comments: PostComment[],
    photos: PostPhoto[],
}
