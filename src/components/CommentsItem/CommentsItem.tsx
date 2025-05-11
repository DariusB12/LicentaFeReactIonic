import React, { useEffect, useRef } from 'react';
import { IonItem } from "@ionic/react";
import './CommentsItem.css';
import { PostComment } from "../../assets/entities/PostComment";

interface CommentsItemProps {
    comment: PostComment;
    onDelete: (id: number) => void;
    onCommentChanged: (id: number, newText: string) => void;
    showErrorBorder:boolean
}

const CommentsItem: React.FC<CommentsItemProps> = ({ comment, onDelete, onCommentChanged ,showErrorBorder}) => {
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (divRef.current && divRef.current.innerText !== comment.comment) {
            divRef.current.innerText = comment.comment || '';
        }
    }, [comment.comment]);

    return (
        <IonItem className="unstyled-ion-item roboto-style">
            <div className={`comments-item-container-box`} style={showErrorBorder ? {borderColor: "red"} : {}}>
                <div className={`comments-item-container`}>
                    <div
                        ref={divRef}
                        className={`comments-item-comment `}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => {
                            const newText = (e.target as HTMLDivElement).innerText;
                            onCommentChanged(comment.id, newText);
                        }}
                    />
                    <button className='comments-item-delete-button' onClick={() => onDelete(comment.id)}>
                        <img src="/icons/delete.png" alt="delete_img" className="icon-size" />
                    </button>
                </div>
            </div>
        </IonItem>
    );
};

export default CommentsItem;
