import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useCallback, useContext, useState} from "react";
import {IonPage, IonSpinner, IonToast} from "@ionic/react";
import './ViewAllAccounts.css'
import VerticalMenu from "../../components/VerticalMenu/VerticalMenu";
import ViewAllAccountsList from "../../components/ViewAllAccountsList/ViewAllAccountsList";
import {SocialAccountsContext} from "../../providers/SocialAccountsProvider/SocialAccountsContext";
import {AuthContext} from "../../providers/AuthProvider/AuthContext";
import CirclesLoading from "../../components/CirclesLoading/CirclesLoading";
import CustomInfoAlert from "../../components/CustomInfoAlert/CustomInfoAlert";


const log = getLogger('ViewAllAccounts');

export const ViewAllAccounts: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    const [searchValue, setSearchValue] = useState('');
    const {fetching,fetchingError,socialAccounts} = useContext(SocialAccountsContext)

    const {deleteSocialAccount} = useContext(SocialAccountsContext)
    const {setTokenExpired} = useContext(AuthContext)

    const [isOpenToastNotification, setIsOpenToastNotification] = useState<boolean>(false)
    const [toastNotificationMessage, setToastNotificationMessage] = useState<string>('');

    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const handleOnClickDeleteProfile = useCallback(async (account_id:number) => {
        log('trying to delete social account');

        // SET TOAST NOTIFY TO FALSE
        // AND SLEEP SO THAT THE TOAST TIMEOUT IS RESET (IF OPENING MORE TOAST ONE AFTER ANOTHER FORCE TO RERENDER)
        setIsOpenToastNotification(false)
        await new Promise(resolve => setTimeout(resolve, 5))

        setIsLoading(true)

        const response = await deleteSocialAccount?.(account_id);
        setIsLoading(false)

        //200 OK data detected
        if (response?.status_code == 200) {
            setIsOpenToastNotification(true)
            setToastNotificationMessage('Deleted successfully')
        } else if (response?.status_code == 403) {
            //403 FORBIDDEN if the token is expired
            setTokenExpired?.(true)
        } else {
            //Any other err is a server error/system error
            setErrorMessage('Network error')
            setIsError(true)
        }

    }, [deleteSocialAccount, setTokenExpired]);


    const filteredAccounts = socialAccounts.filter(account =>
        account.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleOnClickAccount = useCallback(async (account_id:number) => {
        log(`redirecting to /accountDetails/${account_id} page`)
        if (history.location.pathname !== `/accountDetails/${account_id}`) {
            history.push(`/accountDetails/${account_id}`);
        }
    }, [history]);

    return (
        <IonPage className="view-all-accounts-main-container">
            <VerticalMenu/>
            <div className="view-all-accounts-content-container">
                <div className="view-all-accounts-content roboto-style">
                    <input
                        className="view-all-accounts-content-search-bar input-reset roboto-style"
                        placeholder="search profile"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    {!fetching && !fetchingError && <ViewAllAccountsList accounts={filteredAccounts} onClickDelete={handleOnClickDeleteProfile} onClick={handleOnClickAccount}/>}

                    {fetching &&
                        <div className="view-all-accounts-list-container">
                            <div className="view-all-accounts-circles-loading-content">
                                <IonSpinner name="circles" color="secondary"></IonSpinner>
                                <div className="roboto-style">Loading...</div>
                            </div>
                        </div>
                    }

                    {fetchingError &&
                        <div className="view-all-accounts-list-container">
                            <div className="view-all-accounts-list-fetching-error-message roboto-style">Couldn't load the list</div>
                        </div>
                    }
                </div>
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

            {(isLoading || isError) && <div className='view-all-accounts-popups-container'>
                <CirclesLoading isOpen={isLoading} message={'Loading'}/>
                <CustomInfoAlert isOpen={isError} header={"Error"}
                                 error={true}
                                 message={errorMessage} onDismiss={() => {
                    setIsError(false)
                }}/>
            </div>}

        </IonPage>

    )
};
