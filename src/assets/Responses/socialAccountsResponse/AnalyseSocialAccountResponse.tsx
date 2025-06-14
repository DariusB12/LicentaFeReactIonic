import {AnalysisDTO} from "../../entities/AnalysisDTO";

export interface AnalyseSocialAccountResponse {
    message: string
    status_code: number
    analysis?: AnalysisDTO
}