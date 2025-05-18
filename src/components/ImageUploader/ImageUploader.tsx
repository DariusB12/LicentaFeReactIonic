import React, {useRef, useState} from 'react';
import './ImageUploader.css'
import {getLogger, useWindowWidth} from "../../assets";

interface ImageUploaderProps {
    cancelFn: () => void
    saveFn: (image:string|undefined) => void
}

const log = getLogger('IMAGE UPLOADER');

const ImageUploader:React.FC<ImageUploaderProps> = ({cancelFn,saveFn})=> {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef(null);
    const windowWidth = useWindowWidth();
    const [base64Image, setBase64Image] = useState<string | undefined>(undefined);

    const handlePaste = (e:React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file= item.getAsFile();
                if(file)
                    handleFile(file);
                break;
            }
        }
    };

    const isValidImageFile = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        return validTypes.includes(file.type);
    };

    const handleFile = (file:File) => {
        if (!isValidImageFile(file)) {
            alert('Only .png, .jpg, or .jpeg files are allowed.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // const base64 = result.split(',')[1]; // removes "data:image/...;base64,"
            setBase64Image(result);
        };
        reader.readAsDataURL(file);
        log('FILE UPLOADED:',file)
    };

    const handleDrop = (e:React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
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
        <div className="image-uploader-container">
            <div className="image-uploader-drag-and-drop-container roboto-style"
                                       onDragOver={(e) => e.preventDefault()}
                                       onDrop={handleDrop}>
                {base64Image ? (
                    <img
                        src={base64Image}
                        alt="profile_img"
                        className="image-uploader-drag-and-drop-preview-img"
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
            <button className="image-uploader-upload-button" type="button" onClick={openFileDialog}
                    style={{marginTop: '10px'}}>
                Upload From Device
            </button>
            {windowWidth > 690 && <div className="image-uploader-or-text roboto-style">
                or
            </div>}
            {windowWidth > 690 && <div className="image-uploader-upload-input roboto-style">
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
            <div className="image-uploader-bottom-bar">
                <button className="image-uploader-cancel-button grey-button roboto-style" onClick={cancelFn}>
                    <img src="/icons/close.png" alt="close_img"
                         className="edit-profile-popup-upload-cancel-icon icon-size"/> Cancel
                </button>
                <button
                    className="image-uploader-cancel-button grey-button roboto-style"
                    onClick={() => {
                        saveFn(base64Image)
                    }}>
                    Save
                </button>
            </div>
        </div>
    )
        ;
}
export default ImageUploader
