import {PostCommentTranslation} from "../../Requests/nllbTranslationRequest/TranslatePostRequest";

export interface TranslatePostResponse {
    message: string
    status_code: number

    comments?: PostCommentTranslation[]
    description?: string
}