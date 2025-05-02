import {getLogger} from "../../assets";
import {RouteComponentProps} from "react-router";
import React from "react";
import {IonPage} from "@ionic/react";
import './ViewAllAccounts.css'
import VerticalMenu from "../../components/VerticalMenu/VerticalMenu";
import MenuAccountsList from "../../components/VerticalMenu/MenuAccountsList/MenuAccountsList";
import {AccountDTO} from "../../assets/entities/AccountDTO";

const mockDataAccount: AccountDTO[] = [
    {id: 1, username: 'darius', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 2, username: 'alex', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 3, username: 'marian', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 4, username: 'ionut', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 5, username: 'andrei', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 6, username: 'elena', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 7, username: 'simona', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 8, username: 'george', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 9, username: 'mihai', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 10, username: 'claudia', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 11, username: 'vlad', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 12, username: 'andreea', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 13, username: 'daniel', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 14, username: 'roberta', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 15, username: 'ion', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 16, username: 'carmen', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 17, username: 'mihai', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 18, username: 'claudia', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 19, username: 'vlad', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 20, username: 'andreea', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 21, username: 'daniel', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 22, username: 'roberta', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 23, username: 'ion', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true},
    {id: 24, username: 'carmen', profile_photo: undefined,no_followers:2,no_following:5,no_of_posts:12,analysed:true}

]

const log = getLogger('ViewAllAccounts');

export const ViewAllAccounts: React.FC<RouteComponentProps> = ({history}) => {
    log('render')
    return (
        <IonPage className="view-all-accounts-main-container">
            <VerticalMenu/>
            <div className="view-all-accounts-content-container">
                <MenuAccountsList accounts={mockDataAccount}/>
            </div>
        </IonPage>

    )
};
