import React, {useCallback, useContext, useState} from 'react';
import './VerticalMenu.css';
import {AuthContext} from "../../providers/AuthProvider/AuthContext";
import {getLogger} from "../../assets";
import MenuAccountsList from "./MenuAccountsList/MenuAccountsList";
import {AccountDTO} from "../../assets/entities/AccountDTO";
import DeleteAccountAlert from "./DeleteAccountAlert/DeleteAccountAlert";
import {useHistory} from "react-router";
import ExpiredSessionPopUp from "../ExpiredSessionPopUp/ExpiredSessionPopUp";

const log = getLogger('VerticalMenu');

const mockDataAccount: AccountDTO[] = [
    {
        id: 1,
        username: 'darius',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 2,
        username: 'alex',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 3,
        username: 'marian',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 4,
        username: 'ionut',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 5,
        username: 'andrei',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 6,
        username: 'elena',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 7,
        username: 'simona',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 8,
        username: 'george',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 9,
        username: 'mihai',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 10,
        username: 'claudia',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 11,
        username: 'vlad',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 12,
        username: 'andreea',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 13,
        username: 'daniel',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 14,
        username: 'roberta',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 15,
        username: 'ion',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 16,
        username: 'carmen',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 17,
        username: 'mihai',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 18,
        username: 'claudia',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 19,
        username: 'vlad',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 20,
        username: 'andreea',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 21,
        username: 'daniel',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 22,
        username: 'roberta',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 23,
        username: 'ion',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    },
    {
        id: 24,
        username: 'carmen',
        profile_photo: undefined,
        no_followers: 2,
        no_following: 5,
        no_of_posts: 12,
        analysed: true
    }

]


const VerticalMenu: React.FC = () => {
    log('render')

    const history = useHistory();

    const {logout,tokenExpired} = useContext(AuthContext);
    const {username} = useContext(AuthContext);
    const [searchValue, setSearchValue] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false)

    const filteredAccounts = mockDataAccount.filter(account =>
        account.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleOnClickInfo = useCallback(async () => {
        log('redirecting to /about page')
        if (history.location.pathname !== '/about') {
            history.push("/about");
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
                <MenuAccountsList accounts={filteredAccounts}/>

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
        </>
    );
};

export default VerticalMenu;