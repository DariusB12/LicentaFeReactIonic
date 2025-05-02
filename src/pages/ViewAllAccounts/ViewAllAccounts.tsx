import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React, {useState} from "react";
import {IonPage} from "@ionic/react";
import './ViewAllAccounts.css'
import VerticalMenu from "../../components/VerticalMenu/VerticalMenu";
import {AccountDTO} from "../../assets/entities/AccountDTO";
import ViewAllAccountsList from "../../components/ViewAllAccountsList/ViewAllAccountsList";

const mockDataAccount: AccountDTO[] = [
    {id: 1, username: 'darius', profile_photo: undefined,no_followers:2000000,no_following:5,no_of_posts:12,analysed:true},
    {id: 2, username: 'alex', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 3, username: 'marian', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 4, username: 'ionut', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 5, username: 'andrei', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 6, username: 'elena', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 7, username: 'simona', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 8, username: 'george', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 9, username: 'mihai', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 10, username: 'claudia', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 11, username: 'vlad', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 12, username: 'andreea', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 13, username: 'daniel', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 14, username: 'roberta', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 15, username: 'ion', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 16, username: 'carmen', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 17, username: 'mihai', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 18, username: 'claudia', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 19, username: 'vlad', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 20, username: 'andreea', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 21, username: 'daniel', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 22, username: 'roberta', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:false},
    {id: 23, username: 'ion', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 24, username: 'carmen', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true}

]

const log = getLogger('ViewAllAccounts');

export const ViewAllAccounts: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    const [searchValue, setSearchValue] = useState('');

    const filteredAccounts = mockDataAccount.filter(account =>
        account.username.toLowerCase().includes(searchValue.toLowerCase())
    );

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
                    <ViewAllAccountsList accounts={filteredAccounts}/>
                </div>
            </div>
        </IonPage>

    )
};
