
export interface Post {
    id: number,
    photos: string[],
    description: string,
    no_likes: number,
    no_comments: number,
    comments: string[],
    date_posted: Date
}
