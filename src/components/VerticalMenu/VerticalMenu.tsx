import React, {useCallback, useContext, useState} from 'react';
import './VerticalMenu.css';
import {AuthContext} from "../../providers/AuthProvider/AuthContext";
import {getLogger} from "../../assets";
import MenuAccountsList from "./MenuAccountsList/MenuAccountsList";
import DeleteAccountAlert from "./DeleteAccountAlert/DeleteAccountAlert";
import {useHistory} from "react-router";
import ExpiredSessionPopUp from "../ExpiredSessionPopUp/ExpiredSessionPopUp";
import CirclesLoading from "../CirclesLoading/CirclesLoading";
import {WebSocketContext} from "../../providers/WebsocketProvider/WebsocketContext";
import CustomInfoAlert from "../CustomInfoAlert/CustomInfoAlert";
import {SocialAccountsContext} from "../../providers/SocialAccountsProvider/SocialAccountsContext";
import {IonSpinner} from "@ionic/react";

const log = getLogger('VerticalMenu');


const VerticalMenu: React.FC = () => {
    log('render')

    const history = useHistory();

    const {logout, tokenExpired} = useContext(AuthContext);
    const {username} = useContext(AuthContext);
    const [searchValue, setSearchValue] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false)

    const {retries, maxRetries, websocketConnected,accountDeleted} = useContext(WebSocketContext);
    const {fetching,fetchingError,socialAccounts} = useContext(SocialAccountsContext)

    const filteredAccounts = socialAccounts.filter(account =>
        account.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleOnClickInfo = useCallback(async () => {
        log('redirecting to /about page')
        if (history.location.pathname !== '/about') {
            history.push("/about");
        }
    }, [history]);

    const handleOnClickAccount = useCallback(async (account_id:number) => {
        log(`redirecting to /accountDetails/${account_id} page`)
        if (history.location.pathname !== `/accountDetails/${account_id}`) {
            history.push(`/accountDetails/${account_id}`);
        }
    }, [history]);


    const handleOnClickViewAllAccounts = useCallback(async () => {
        log('redirecting to /viewAllAccounts page')
        if (history.location.pathname !== "/viewAllAccounts") {
            history.push("/viewAllAccounts");
        }
    }, [history]);

    const handleOnClickLogout = useCallback(async () => {
        log('logout clicked')
        await logout?.();
        log('logout successfully - redirecting to home page')
        if (history.location.pathname !== "/home") {
            history.push("/home");
        }

    }, [logout, history]);

    const handleAddAccountClicked = useCallback(async () => {
        log('redirecting to /addAccount page')
        if (history.location.pathname !== "/addAccount") {
            history.push("/addAccount");
        }

    }, [history]);


    return (
        <>
            <div className={`vertical-menu-container roboto-style ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="vertical-menu-top-container">
                    <div className="vertical-menu-top-container-top kaushan-script-style">
                        SocialMind <button className="vertical-menu-info-button" onClick={handleOnClickInfo}><img
                        src="/icons/info.png"
                        alt="info_img"
                        className="vertical-menu-info-img icon-size"/>
                    </button>
                    </div>
                    <div className="vertical-menu-top-container-bottom roboto-style">
                        <div style={{color: "#cccccc", fontSize: "var(--font-sm)"}}>
                            You:
                        </div>
                        <div style={{color: "white", fontSize: "var(--font-sm)"}}>
                            {username}
                        </div>
                    </div>
                </div>
                <input
                    className="vertical-menu-container-search-bar input-reset roboto-style"
                    placeholder="search profile"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                {!fetching && !fetchingError && <MenuAccountsList accounts={filteredAccounts} onClick={handleOnClickAccount}/>}

                {fetching &&
                <div className="vertical-menu-list-container">
                    <div className="vertical-menu-circles-loading-content">
                        <IonSpinner name="circles" color="secondary"></IonSpinner>
                        <div className="roboto-style">Loading...</div>
                    </div>
                </div>
                }

                {fetchingError &&
                    <div className="vertical-menu-list-container">
                            <div className="vertical-menu-list-fetching-error-message roboto-style">Couldn't load the list</div>
                    </div>
                }

                <div className="vertical-menu-container-bottom-conatiner">
                    <div className="vertical-menu-container-bottom-buttons">
                        <button className="vertical-menu-container-add-button blue-button"
                                onClick={handleAddAccountClicked}>Add<img src="/icons/add.png"
                                                                          alt="add_img"
                                                                          className="icon-size"/>
                        </button>
                        <button className="vertical-menu-container-view-button black-button"
                                onClick={handleOnClickViewAllAccounts}>View All Accounts
                        </button>
                    </div>
                    <div className="vertical-menu-container-bottom">
                        <button className="vertical-menu-container-logout-button" onClick={handleOnClickLogout}>- Logout
                            -
                        </button>
                        <button className="vertical-menu-container-delete-account-button" onClick={() => {
                            setShowDeleteAccount(true)
                        }}>- Delete Account -
                        </button>
                    </div>
                </div>

            </div>
            <div
                className={`vertical-menu-container-grey-background-for-hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}/>

            {/*VERTICAL HAMBURGER MENU */}
            <div className="vertical-menu-hamburger-container">
                <button className="vertical-menu-hamburger-button"
                        onClick={() => setIsMobileMenuOpen(prev => !prev)}
                >
                    <img src="/icons/hamburger_menu.png"
                         alt="hamburger_menu_img"
                         className="vertical-menu-hamburger_image"/>
                </button>

                <button className="vertical-menu-hamburger-add-button blue-button" onClick={handleAddAccountClicked}>
                    <img src="/icons/add.png"
                         alt="add_img"
                         className="vertical-menu-hamburger-add-img"/>
                </button>
                <button className="vertical-menu-hamburger-view-button black-button"
                        onClick={handleOnClickViewAllAccounts}><img src="/icons/view_icon.png"
                                                                    alt="view_img"
                                                                    className="vertical-menu-hamburger-view-img"/>
                </button>
                <div className="vertical-menu-hamburger-empty-div">

                </div>
                <button className="vertical-menu-hamburger-info-button" onClick={handleOnClickInfo}><img
                    src="/icons/info.png"
                    alt="info_img"
                    className="vertical-menu-hamburger-info-img"/>
                </button>
            </div>
            <DeleteAccountAlert isOpen={showDeleteAccount} header={"Delete your account"}
                                message={"Please type your password"} closeAlert={() => {
                setShowDeleteAccount(false)
            }}/>
            {tokenExpired && <ExpiredSessionPopUp/>}
            <CirclesLoading isOpen={!websocketConnected && retries != maxRetries}
                            message={`Connecting to server... #${retries+1}`}/>
            <CustomInfoAlert isOpen={!websocketConnected && retries >= maxRetries} header={'Server connection lost'}
                             message={'Please come back later'} onDismiss={handleOnClickLogout} error={true}/>
            {/*ALERT IF THE ACCOUNT HAS BEEN DELETED FROM ANOTHER DISPOSITIVE*/}
            <CustomInfoAlert isOpen={accountDeleted && !showDeleteAccount} header={'Account Deleted'}
                             message={'Your account was deleted from another device'} onDismiss={handleOnClickLogout} error={true}/>

        </>
    );
};

export default VerticalMenu;