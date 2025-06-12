

export interface PostCommentUpdated {
    id: number
    comment: string
}

export interface PostPhotoUpdated {
    id: number
    photo_filename: string
}


export interface UpdatedPostNotify {
    id: number
    description: string
    no_likes: number
    no_comments: number
    date_posted: string

    comments: PostCommentUpdated[]
    photos: PostPhotoUpdated[]

    profileId:number
}