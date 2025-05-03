import React from 'react';
import "./EditProfilePopUp.css"

interface EditProfilePopUpProps {
    isOpen:boolean,
    header:string,
    message:string,
    closeFn: () => void
}

const EditProfilePopUp: React.FC<EditProfilePopUpProps> = ({ isOpen,header, message,closeFn }) => {
    if (!isOpen) return null;

    return (
        <div className="custom-alert-container">
            <div className="custom-alert-content">
                <div className="custom-alert-header roboto-style">
                    {header}
                </div>
                <div className="custom-alert-message roboto-style">
                    {message}
                </div>
                <div className="custom-alert-close-button-container">
                    <button onClick={closeFn} className="custom-alert-close-button grey-button roboto-style">Close</button>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePopUp;
