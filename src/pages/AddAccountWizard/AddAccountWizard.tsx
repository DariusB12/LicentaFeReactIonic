import {getLogger, usePersistentState} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useEffect, useState} from "react";
import {IonPage} from "@ionic/react";
import './AddAccountWizard.css'
import VerticalMenu from "../../components/VerticalMenu/VerticalMenu";
import AddAccountScreen from "./AddAccountScreen/AddAccountScreen";
import AddPostsScreen from "./AddPostsScreen/AddPostsScreen";



const log = getLogger('AddAccountWizard');

export const AddAccountWizard: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    const [addAccountState, setAddAccountState] = usePersistentState<boolean>('addAccountState',true)
    const [addPostState, setAddPostState] = usePersistentState<boolean>('addPostState',false)

    //FUNCTIE CARE STERGE DIN LOCAL STORAGE DATELE PERSISTATE
    const resetProfileForm = () => {
        localStorage.removeItem('addAccountState');
        localStorage.removeItem('addPostState');
    };
    //PENTRU A STERGE DIN LOCAL STORAGE ATUNCI CAND SE PARASESTE PAGINA
    useEffect(() => {
        return () => {
            resetProfileForm()
        };
    }, []);

    return (
        <IonPage className="add-account-wizard-main-container">
            <VerticalMenu/>
            <div className="add-account-wizard-content-container">
                {addAccountState && <AddAccountScreen savedSuccessfully={() => {
                    setAddAccountState(false)
                    setAddPostState(true)
                }}
                />}
                {addPostState && <AddPostsScreen isOpen={true} forAdd={true} forEdit={false} idProfile={2} closeFn={() => {
                }}
                />}
            </div>
        </IonPage>

    )
};
