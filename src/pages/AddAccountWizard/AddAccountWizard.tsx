import {getLogger, usePersistentState} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useCallback, useEffect, useState} from "react";
import {IonPage, IonToast} from "@ionic/react";
import './AddAccountWizard.css'
import VerticalMenu from "../../components/VerticalMenu/VerticalMenu";
import AddAccountScreen from "./AddAccountScreen/AddAccountScreen";
import AddPostsScreen from "./AddPostsScreen/AddPostsScreen";
import {Preferences} from "@capacitor/preferences";


const log = getLogger('AddAccountWizard');

export const AddAccountWizard: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    const [addAccountState, setAddAccountState] = usePersistentState<boolean>('addAccountState', true)
    const [addPostState, setAddPostState] = usePersistentState<boolean>('addPostState', false)

    const [profilePhotoState, setProfilePhotoState] = usePersistentState<string>('accountWizardPhoto', '');
    const [usernameState, setUsernameState] = usePersistentState<string>('accountWizardUsername', '');
    const [idProfile, setIdProfile] = usePersistentState<number>('accountWizardIdProfile', -1);

    const [isOpenToastNotification, setIsOpenToastNotification] = useState<boolean>(false)
    const [toastNotificationMessage, setToastNotificationMessage] = useState<string>('');


    //FUNCTIE CARE STERGE DIN LOCAL STORAGE DATELE PERSISTATE
    const resetProfileForm = useCallback(async () => {
        await Preferences.remove({key: 'addAccountState'});
        await Preferences.remove({key: 'addPostState'});
        await Preferences.remove({key: 'accountWizardPhoto'});
        await Preferences.remove({key: 'accountWizardUsername'});
        await Preferences.remove({key: 'accountWizardIdProfile'});
    }, [])
    //PENTRU A STERGE DIN LOCAL STORAGE ATUNCI CAND SE PARASESTE PAGINA (cu return va apela functia la unmount)
    useEffect(() => {
        return () => {
            resetProfileForm().then()
        };
    }, [resetProfileForm]);

    return (
        <IonPage className="add-account-wizard-main-container">
            <VerticalMenu/>
            <div className="add-account-wizard-content-container">
                {addAccountState &&
                    <AddAccountScreen savedSuccessfully={async (photo: string, username: string, idProfile: number) => {
                        setAddAccountState(false)
                        setAddPostState(true)
                        setProfilePhotoState(photo)
                        setUsernameState(username)
                        setIdProfile(idProfile)

                        setIsOpenToastNotification(true)
                        setToastNotificationMessage('Profile added successfully')
                    }}
                    />}
                {addPostState && <AddPostsScreen idProfile={idProfile} accountPhoto={profilePhotoState}
                                                 accountUsername={usernameState} history={history}/>}
            </div>
            {isOpenToastNotification &&
                <IonToast
                          isOpen={isOpenToastNotification}
                          message={toastNotificationMessage}
                          position="top"
                          onDidDismiss={() => {
                              setIsOpenToastNotification(false)
                          }}
                          duration={3000}/>
            }
        </IonPage>

    )
};
