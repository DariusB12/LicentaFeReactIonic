import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonRouterOutlet, setupIonicReact} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import Home from './pages/Home/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';
import {Login} from "./pages/Login/Login";
import {Register} from "./pages/Register/Register";
import {About} from "./pages/About/About";
import {AuthProvider} from "./providers/AuthProvider/AuthProvider";
import {PrivateRoute} from "./components/PrivateRoute/PrivateRoute";
import {Switch} from "react-router";
import {ViewAllAccounts} from "./pages/ViewAllAccounts/ViewAllAccounts";
import {AccountDetails} from "./pages/AccountDetails/AccountDetails";


setupIonicReact();

const App: React.FC = () => (
    <IonApp>

        <AuthProvider>

            <IonReactRouter>
                <IonRouterOutlet style={{ backgroundColor: '#000000' }}>
                    {/*USING SWITCH SO THAT NO MORE PAGES ARE MOUNTED AT THE SAME TIME*/}
                    <Switch>
                        <Route path="/home" component={Home} exact={true}/>
                        <Route path="/login" component={Login} exact={true}/>
                        <Route path="/register" component={Register} exact={true}/>

                        <PrivateRoute path="/about" component={About} exact={true}/>
                        <PrivateRoute path="/viewAllAccounts" component={ViewAllAccounts} exact={true}/>
                        <PrivateRoute path="/accountDetails/:id" component={AccountDetails} exact={true}/>

                        <Route exact path="/" render={() => <Redirect to="/about"/>}/>
                    </Switch>
                </IonRouterOutlet>
            </IonReactRouter>

        </AuthProvider>

    </IonApp>
);

export default App;
