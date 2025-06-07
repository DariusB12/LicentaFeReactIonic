
export interface DetectPostResponse {
    message: string
    status_code: number

    post_photo?: string // base64
    description?: string
    no_likes?: number
    no_comments?: number
    date?: string
    comments:[]
}