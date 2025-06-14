import {InterestDomainType} from "./enums/InterestDomainType";
import {BigFiveModelType} from "./enums/BigFiveModelType";
import {PersonalityType} from "./enums/PersonalityType";
import {GeneralEmotionType} from "./enums/GeneralEmotionType";
import {HobbyType} from "./enums/HobbyType";


export interface AnalysisDTO {
    id: number
    interest_domains:  InterestDomainType[]
    hobbies: HobbyType[]

    general_emotions: Record<GeneralEmotionType, number>
    personality_types: Record<PersonalityType, number>
    big_five_model: Record<BigFiveModelType, number>

    creationDate: string  // isoFormat()

    social_account_id: number
}