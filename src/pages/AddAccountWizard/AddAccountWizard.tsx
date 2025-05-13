import {getLogger, usePersistentState} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useEffect} from "react";
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

    const [profilePhotoState, setProfilePhotoState] = usePersistentState<string>('accountWizardPhoto','');
    const [usernameState, setUsernameState] = usePersistentState<string>('accountWizardUsername','');
    const [idProfile, setIdProfile] = usePersistentState<number>('accountWizardIdProfile',-1);


    //FUNCTIE CARE STERGE DIN LOCAL STORAGE DATELE PERSISTATE
    const resetProfileForm = () => {
        localStorage.removeItem('addAccountState');
        localStorage.removeItem('addPostState');
        localStorage.removeItem('accountWizardPhoto')
        localStorage.removeItem('accountWizardUsername')
        localStorage.removeItem('accountWizardIdProfile')
    };
    //PENTRU A STERGE DIN LOCAL STORAGE ATUNCI CAND SE PARASESTE PAGINA (cu return va apela functia la unmount)
    useEffect(() => {
        return () => {
            resetProfileForm()
        };
    }, []);

    return (
        <IonPage className="add-account-wizard-main-container">
            <VerticalMenu/>
            <div className="add-account-wizard-content-container">
                {addAccountState && <AddAccountScreen savedSuccessfully={async (photo:string,username:string,idProfile:number) => {
                    setAddAccountState(false)
                    setAddPostState(true)
                    setProfilePhotoState(photo)
                    setUsernameState(username)
                    setIdProfile(idProfile)
                }}
                />}
                {addPostState && <AddPostsScreen idProfile={idProfile} accountPhoto={profilePhotoState} accountUsername={usernameState} history={history}/>}
            </div>
        </IonPage>

    )
};
