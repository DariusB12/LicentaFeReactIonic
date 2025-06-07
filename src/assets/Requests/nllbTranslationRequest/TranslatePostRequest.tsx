

export interface PostCommentTranslation {
    id: number
    comment: string
}

export interface TranslatePostRequest {
    comments: PostCommentTranslation[]
    description: string
}