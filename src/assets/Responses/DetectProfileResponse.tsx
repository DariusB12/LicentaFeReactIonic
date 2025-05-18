
export interface DetectProfileResponse {
    message: string
    status_code: number

    profile_photo?: string // base64
    username?: string
    description?: string
    no_followers?: number
    no_following?: number
    no_of_posts?: number
}