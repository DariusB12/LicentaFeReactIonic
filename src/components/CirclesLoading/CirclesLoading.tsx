import React from 'react';
import {IonSpinner} from '@ionic/react';
import './CirclesLoading.css'

interface CirclesLoading {
    isOpen: boolean;
    message: string;
}

const CirclesLoading: React.FC<CirclesLoading> = ({isOpen, message}) => {
    if (!isOpen) return null;

    return (
        <div className="circles-loading-main-container">
            <div className="circles-loading-content">
                <IonSpinner name="circles" color="secondary"></IonSpinner>
                <div className="roboto-style">{message}</div>
            </div>
        </div>
    );
};

export default CirclesLoading;
