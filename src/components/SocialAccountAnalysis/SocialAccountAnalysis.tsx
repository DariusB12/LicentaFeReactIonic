import React from 'react';
import {IonContent, IonText} from "@ionic/react";
import {getLogger} from "../../assets";
import './SocialAccountAnalysis.css'
import {Analysis} from "../../assets/entities/Analysis";

export interface SocialAccountAnalysisProps {
    analysis: Analysis
    modified: boolean
}

const log = getLogger('SocialAccountAnalysis');

const listItemPercentage = (name: string, percentage: number) => {
    // Scale the 0-1 value to 0-100 for display and CSS height
    const scaledPercentage = percentage * 100;

    // Ensure scaledPercentage is clamped between 0 and 100 (though if input is 0-1, this is mostly for safety)
    const fillHeight = Math.max(0, Math.min(100, scaledPercentage));

    return (
        <div className="big-five-model-item-container">
            <div className="progress-bar-vertical">
                <div className="progress-bar-fill" style={{height: `${fillHeight}%`}}></div>
            </div>
            <IonText>
                <p className="percentage-text">{scaledPercentage.toFixed(0)}%</p>
            </IonText>
            <IonText>
                <p className="name-text">{name.toUpperCase()}</p>
            </IonText>
        </div>
    );
}

const SocialAccountAnalysis: React.FC<SocialAccountAnalysisProps> = ({analysis, modified}) => {
    log('render')
    return (
        <IonContent className="unstyled-ion-content ">
            <div className="social-account-analysis-content custom-scroll-area">
                {
                    modified &&
                    <div className="social-account-analysis-modified-text">The account was updated after this
                        analysis!</div>
                }
                <div className="social-account-analysis-title">
                    Big Five Model
                </div>
                <div className="social-account-analysis-horizontal-list-container">
                    <div className="social-account-analysis-horizontal-list custom-scroll-area">
                        <div>{listItemPercentage('CONSCIENTIOUSNESS', analysis.big_five_model.CONSCIENTIOUSNESS)}</div>
                        <div>{listItemPercentage('OPENNESS', analysis.big_five_model.OPENNESS)}</div>
                        <div>{listItemPercentage('EXTRAVERSION', analysis.big_five_model.EXTRAVERSION)}</div>
                        <div>{listItemPercentage('AGREEABLENESS', analysis.big_five_model.AGREEABLENESS)}</div>
                        <div>{listItemPercentage('NEUROTICISM', analysis.big_five_model.NEUROTICISM)}</div>

                    </div>
                </div>

                <div className="social-account-analysis-title">
                    Personality
                </div>
                <div className="social-account-analysis-horizontal-list-container">
                    {Object.entries(analysis.personality_types).length ?
                        <div className="social-account-analysis-horizontal-list custom-scroll-area">
                            {Object.entries(analysis.personality_types).map(([type, score]) => (
                                <div >
                                    {listItemPercentage(type, score)}
                                </div>
                            ))}
                        </div>
                        :
                        <div className="social-account-analysis-not-detected">
                            Not detected
                        </div>
                    }
                </div>


                <div className="social-account-analysis-title">
                    General Emotions
                </div>
                <div className="social-account-analysis-horizontal-list-container">
                    {Object.entries(analysis.general_emotions).length ?
                        <div className="social-account-analysis-horizontal-list custom-scroll-area">
                            {Object.entries(analysis.general_emotions).map(([type, score]) => (
                                <div >
                                    {listItemPercentage(type, score)}
                                </div>
                            ))}
                        </div>
                        :
                        <div className="social-account-analysis-not-detected">
                            Not detected
                        </div>
                    }
                </div>

                <div className="social-account-analysis-title">
                    Interest domains
                </div>
                <div className="social-account-analysis-horizontal-list-container">

                    {analysis.interest_domains.length ?
                        <div className="social-account-analysis-horizontal-list custom-scroll-area">
                            {analysis.interest_domains.map((type) => (
                                <div className="social-account-analysis-horizontal-list-item">
                                    {type}
                                </div>
                            ))}
                        </div>
                        :
                        <div className="social-account-analysis-not-detected">
                            Not detected
                        </div>
                    }
                </div>

                <div className="social-account-analysis-title">
                    Hobbies
                </div>
                <div className="social-account-analysis-horizontal-list-container">

                    {analysis.hobbies.length ?
                        <div className="social-account-analysis-horizontal-list custom-scroll-area">
                            {analysis.hobbies.map((type) => (
                                <div className="social-account-analysis-horizontal-list-item">
                                    {type}
                                </div>
                            ))}
                        </div>
                        :
                        <div className="social-account-analysis-not-detected">
                            Not detected
                        </div>
                    }
                </div>
            </div>
        </IonContent>
    );
};

export default SocialAccountAnalysis;