import React from 'react';
import "./CustomInfoAlert.css"

interface CirclesLoading {
    isOpen:boolean,
    header:string,
    message:string,
    onDismiss: () => void
    error: boolean
}

const CustomInfoAlert: React.FC<CirclesLoading> = ({ isOpen,header, message,onDismiss, error}) => {
    if (!isOpen) return null;

    return (
        <div className="custom-alert-container">
            <div className="custom-alert-content">
                <div className={`custom-alert-header roboto-style ${error ? 'red-text' : 'green-text'}`}>
                    {header}
                </div>
                <div className="custom-alert-message roboto-style">
                    {message}
                </div>
                <div className="custom-alert-close-button-container">
                    <button onClick={onDismiss} className="custom-alert-close-button grey-button roboto-style">Close</button>
                </div>
            </div>
        </div>
    );
};

export default CustomInfoAlert;
