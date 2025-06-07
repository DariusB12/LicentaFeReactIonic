import React, {useCallback, useContext, useRef, useState} from 'react';
import "./DetectFromImage.css"
import {getLogger, useWindowWidth} from "../../assets";
import {DetectProfileResponse} from "../../assets/Responses/yoloResponses/DetectProfileResponse";
import {YoloDetectionContext} from "../../providers/YoloDetectionProvider/YoloDetectionContext";
import {AuthContext} from "../../providers/AuthProvider/AuthContext";
import CirclesLoading from "../CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../CustomInfoAlert/CustomInfoAlert";
import {DetectPostResponse} from "../../assets/Responses/yoloResponses/DetectPostResponse";

export type OnProfileDetectedFn = (profileData: DetectProfileResponse) => Promise<void>;
export type OnPostDetectedFn = (postData: DetectPostResponse) => Promise<void>;

interface DetectFromImageProps {
    forPost: boolean,
    forProfile: boolean,
    onProfileDetected: OnProfileDetectedFn,
    onPostDetected: OnPostDetectedFn,
    onCancel: () => void
}

const log = getLogger('DetectFromImage');

const DetectFromImage: React.FC<DetectFromImageProps> = ({forPost, forProfile, onCancel, onProfileDetected,onPostDetected}) => {
    const {detectProfileData,detectPostData} = useContext(YoloDetectionContext)
    const {
        setTokenExpired
    } = useContext(AuthContext);
    const [imageToDetect, setImageToDetect] = useState<string | undefined>('')
    const [noImageError, setNoImageError] = useState<boolean>(false);
    const [isDetecting, setIsDetecting] = useState<boolean>(false);
    const [detectionErr, setDetectionErr] = useState<boolean>(false);
    const [detectionErrMessage, setDetectionErrMessage] = useState<string>('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef(null);
    const windowWidth = useWindowWidth();

    const handleOnClickDetect = useCallback(async () => {
        log('handle detect image');
        setNoImageError(false)
        if (imageToDetect) {
            if (forPost) {
                setIsDetecting(true)
                const response = await detectPostData?.(imageToDetect)
                setIsDetecting(false)

                //200 OK data detected
                if (response?.status_code == 200) {
                    onPostDetected(response).then(onCancel)
                } else if (response?.status_code == 400) {
                    //400 bad request if the base64 is encoded wrong
                    setDetectionErrMessage('The image is not valid')
                    setDetectionErr(true)
                } else if (response?.status_code == 403) {
                    //403 FORBIDDEN if the token is expired
                    setTokenExpired?.(true)
                    onCancel()
                } else {
                    //Any other err is a server error
                    setDetectionErrMessage('Network error')
                    setDetectionErr(true)
                }
            }
            if (forProfile) {
                setIsDetecting(true)
                const response = await detectProfileData?.(imageToDetect)
                setIsDetecting(false)

                //200 OK data detected
                if (response?.status_code == 200) {
                    onProfileDetected(response).then(onCancel)
                } else if (response?.status_code == 400) {
                    //400 bad request if the base64 is encoded wrong
                    setDetectionErrMessage('The image is not valid')
                    setDetectionErr(true)
                } else if (response?.status_code == 403) {
                    //403 FORBIDDEN if the token is expired
                    setTokenExpired?.(true)
                    onCancel()
                } else {
                    //Any other err is a server error
                    setDetectionErrMessage('Network error')
                    setDetectionErr(true)
                }
            }
        } else {
            setNoImageError(true)
        }
    }, [detectPostData, detectProfileData, forPost, forProfile, imageToDetect, onCancel, onPostDetected, onProfileDetected, setTokenExpired]);

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file)
                    handleFile(file);
                break;
            }
        }
    };
    const isValidImageFile = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png','image/jpg'];
        return validTypes.includes(file.type);
    };

    const handleFile = (file: File) => {
        if (!isValidImageFile(file)) {
            alert('Only .png, .jpg, or .jpeg files are allowed.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // const base64 = result.split(',')[1]; // removes "data:image/...;base64,"
            setImageToDetect(result);
            setNoImageError(false)
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    return (
        <>
            <div className="detect-from-image-container">
                <div className="detect-from-image-content">

                    <div className="detect-from-image-uploader-drag-and-drop-container roboto-style"
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={handleDrop}>
                        {imageToDetect ? (
                            <img
                                src={imageToDetect}
                                alt="profile_img"
                                className="detect-from-image-uploader-drag-and-drop-preview-img"
                            />
                        ) : (
                            <>
                                {windowWidth > 690 && <p className="roboto-style">Drag and drop an image here</p>}
                            </>
                        )}
                    </div>

                    <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        ref={fileInputRef}
                        style={{display: 'none'}}
                        onChange={handleFileChange}
                    />
                    <button className="detect-from-image-uploader-upload-button" type="button" onClick={openFileDialog}
                            style={{marginTop: '10px'}}>
                        Upload From Device
                    </button>
                    {windowWidth > 690 && <div className="detect-from-image-uploader-or-text roboto-style">
                        or
                    </div>}
                    {windowWidth > 690 && <div className="detect-from-image-uploader-upload-input roboto-style">
                        <input
                            ref={inputRef}
                            value=''
                            onChange={() => {
                            }}
                            className="input-reset roboto-style"
                            placeholder="Ctrl+V inside this input"
                            onPaste={handlePaste}
                        />
                    </div>}

                    {noImageError && <div className='detect-from-image-no-image-error'>
                        No image uploaded
                    </div>}

                    <div className="detect-from-image-buttons-container">
                        <button onClick={() => {
                            setNoImageError(false)
                            onCancel()
                        }}
                                className="detect-from-image-close-button grey-button roboto-style">Close
                        </button>
                        <button onClick={handleOnClickDetect}
                                className="detect-from-image-close-button grey-button roboto-style">Detect
                        </button>
                    </div>
                </div>
            </div>
            {(isDetecting || detectionErr) && <div className='detect-from-image-popups-container'>
                <CirclesLoading isOpen={isDetecting} message={'Detecting'}/>
                <CustomInfoAlert isOpen={detectionErr} header={"Error Detecting Data"}
                                 message={detectionErrMessage} onDismiss={() => {
                    setDetectionErr(false)
                    onCancel()
                }}/>
            </div>}
        </>
    );
};

export default DetectFromImage;
