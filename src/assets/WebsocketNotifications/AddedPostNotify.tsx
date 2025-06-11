

export interface PostComment {
    id: number
    comment: string
}

export interface PostPhoto {
    id: number
    photo_filename: string
}


export interface AddedPostNotify {
    id: number
    description: string
    no_likes: number
    no_comments: number
    date_posted: string

    comments: PostComment[]
    photos: PostPhoto[]
    profileId:number
}