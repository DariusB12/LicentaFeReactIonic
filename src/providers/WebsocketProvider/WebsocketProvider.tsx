import React, {useEffect, useRef, useState, useContext, useCallback} from 'react';
import {WebSocketContext} from "./WebsocketContext";
import PropTypes from "prop-types";
import {baseUrl, getLogger} from "../../assets";
import {AuthContext} from "../AuthProvider/AuthContext";
import {SocialAccountsContext} from "../SocialAccountsProvider/SocialAccountsContext";
import {SocialAccountDTO} from "../../assets/Responses/userResponses/SocialAccountsResponse";
import {AccountDetailsContext} from "../AccountDetailsProvider/AccountDetailsContext";
import {UpdateSocialAccountNotify} from "../../assets/WebsocketNotifications/UpdateSocialAccountNotify";
import {AddedPostNotify} from "../../assets/WebsocketNotifications/AddedPostNotify";
import {UpdatedPostNotify} from "../../assets/WebsocketNotifications/UpdatedPostNotify";


type WebSocketMessage =
    | { type: 'USER_ACCOUNT_DELETED'; payload: null }

    | { type: 'PROFILE_DELETED'; payload: number }
    | { type: 'PROFILE_ADDED'; payload: SocialAccountDTO }
    | {type: 'PROFILE_EDITED'; payload: UpdateSocialAccountNotify }

    | {type: 'POST_DELETED'; payload: number}
    | {type: 'POST_ADDED'; payload: AddedPostNotify}
    | {type: 'POST_EDITED'; payload: UpdatedPostNotify}

// IF USER CONNECTED ON MORE DISPOSITIVE, THEN THE DATA SHOULD BE UPDATED WITHIN THE WEBSOCKET
// SO THAT ON THE OTHER DISPOSITIVE THE DATA IS UPDATED
const PROFILE_ADDED = 'PROFILE_ADDED'
const PROFILE_EDITED = 'PROFILE_EDITED'
const PROFILE_DELETED = 'PROFILE_DELETED'
const ANALYSIS_MADE = 'ANALYSIS_MADE'
const POST_ADDED = 'POST_ADDED'
const POST_EDITED = 'POST_EDITED'
const POST_DELETED = 'POST_DELETED'
const USER_ACCOUNT_DELETED = 'USER_ACCOUNT_DELETED'


interface WebSocketProviderProps {
    children: PropTypes.ReactNodeLike;
}

const log = getLogger('WebSocketProvider');

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext);
    const [retries, setRetries] = useState<number>(0);
    const [websocketConnected, setWebsocketConnected] = useState<boolean>(false);
    const [accountDeleted, setAccountDeleted] = useState<boolean>(false);

    const wsRef = useRef<WebSocket | null>(null);
    const maxRetries = 5;

    const {fetchSocialAccounts,notifySocialAccountDeleted,notifySocialAccountAdded,notifySocialAccountEdited} = useContext(SocialAccountsContext)
    const {reFetchSocialAccount,notifyAccountDetailsDelete,notifyAccountDetailsEdited,notifyAccountDetailsPostDeleted,notifyAccountDetailsPostAdded,notifyAccountDetailsPostEdited} = useContext(AccountDetailsContext)
    const {setTokenExpired} = useContext(AuthContext);

    const messageQueue = useRef<WebSocketMessage[]>([]);
    // USED WHEN WE WANT TO BUFFER THE WS MESSAGES RECEIVED WHILE FETCHING SOCIAL ACCOUNTS/SOCIAL ACCOUNT
    const canHandleMessages = useRef(false);
    //LOCK FOR THE QUEUE PROCESSING METHOD
    const isProcessingQueue = useRef(false);


    const retryConnection = useCallback(() => {
        if (retries < maxRetries) {
            setTimeout(() => {
                setRetries(prev => prev + 1);
            }, 1000);
        }
    }, [retries]);

    
    const handleMessage = useCallback(async (message: WebSocketMessage) => {
        const {type, payload} = message;
        // TODO: handle messages
        log('MESSAGE RECEIVED, type:', type, 'payload:', payload);
        if (type == USER_ACCOUNT_DELETED) {
            setAccountDeleted(true)
        }
        else if(type == PROFILE_DELETED){
            await notifySocialAccountDeleted?.(payload)
            await notifyAccountDetailsDelete?.(payload)
        }
        else if(type == PROFILE_ADDED){
            await notifySocialAccountAdded?.(payload)
        }
        else if(type == PROFILE_EDITED){
            await notifySocialAccountEdited?.(payload)
            await notifyAccountDetailsEdited?.(payload)
        }
        else if(type == POST_DELETED){
            await notifyAccountDetailsPostDeleted?.(payload)
        }
        else if(type == POST_ADDED){
            await notifyAccountDetailsPostAdded?.(payload)
        }
        else if(type == POST_EDITED){
            await notifyAccountDetailsPostEdited?.(payload)
        }
    }, [notifyAccountDetailsPostEdited,notifyAccountDetailsPostAdded,notifySocialAccountDeleted, notifyAccountDetailsDelete, notifySocialAccountAdded, notifySocialAccountEdited, notifyAccountDetailsEdited, notifyAccountDetailsPostDeleted]); // Dependency array


    const processQueue = useCallback(async () => {
        if (isProcessingQueue.current) return; // avoid parallel runs
        isProcessingQueue.current = true;

        while (messageQueue.current.length > 0) {
            const msg = messageQueue.current.shift();
            if (msg) {
                await handleMessage(msg);
            }
        }
        isProcessingQueue.current = false;
        //IN CASE IF AFTER LEAVING THE WHILE, MESSAGES WERE ADDED IN QUEUE, RESTART THE PROCESS FUNCTION
        if (messageQueue.current.length > 0) {
            log('RESTART PROCESSING QUEUE-----')
            processQueue(); // recursive restart
        }
    }, [handleMessage]);

    //FUNCTIE DE TEST PT A VEDEA CA DACA FAC RELOAD LA PAGINA SE ASTEAPTA 10 SECUNDE PANA SA SE I-A DIN COADA
    //REQUEST-URILE, IAR DIN ALT WINDOW FAC DELETE LA CONTURI SI IN PRIMUL WINDOW DOAR DUPA 10 SECUNDE SE EXECUTA
    //NOTIFICARILE
    function delay(ms:number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const connectWebSocket = useCallback( () => {
        if (retries >= maxRetries || !token) {
            log('Max retries reached or token is missing. Giving up on WebSocket connection.');
            return;
        }

        log(`Attempting WebSocket connection. Attempt #${retries + 1}`);
        const ws = new WebSocket(`ws://${baseUrl}/ws?token=${token}`);
        wsRef.current = ws;

        ws.onopen = async () => {
            canHandleMessages.current = false;

            log('WebSocket connected.');
            setRetries(0);
            setWebsocketConnected(true)

            //IF THE CONNECTION IS OPENING, THEN WE NEED TO RELOAD THE PROVIDERS, SO THAT THE ITEMS ARE UPTO DATE
            //AND WHILE WAITING THE PROVIDERS TO FETCH ITEMS, WE PUT THE NOTIFIES INTO A LIST 
            const response = await fetchSocialAccounts?.()
            reFetchSocialAccount?.()
            
            //FUNCTIE DE TEST PT A VEDEA CA DACA FAC RELOAD LA PAGINA SE ASTEAPTA 10 SECUNDE PANA SA SE I-A DIN COADA
            //REQUEST-URILE, IAR DIN ALT WINDOW FAC DELETE LA CONTURI SI IN PRIMUL WINDOW DOAR DUPA 10 SECUNDE SE EXECUTA
            //NOTIFICARILE
            // await delay(3000)

            if (response?.status_code == 403) {
                //403 FORBIDDEN if the token is expired
                // show the session expired popup
                setTokenExpired?.(true)
            }

            canHandleMessages.current = true;
            // PROCESS THE MESSAGES RECEIVED WHILE FETCHING SOCIAL ACCOUNTS
            await processQueue();
        };

        ws.onclose = () => {
            log('WebSocket closed.');

            setWebsocketConnected(false)
            retryConnection();
        };

        ws.onerror = (error) => {
            log('WebSocket error', error);
            ws.close();
            setWebsocketConnected(false)
        };

        ws.onmessage = async (event) => {
            const message:WebSocketMessage = JSON.parse(event.data);
            if (!canHandleMessages.current) {
                //IF MESSAGES ARE RECEIVED WHILE FETCHING THE ACCOUNTS, THEN BUFFER THEM
                //ADDS AT THE END OF QUEUE
                messageQueue.current.push(message);
                return;
            }

            messageQueue.current.push(message);
            await processQueue();
        };
    }, [fetchSocialAccounts, processQueue, reFetchSocialAccount, retries, retryConnection, setTokenExpired, token]);

    

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                log('Cleaning up WebSocket connection.');
                wsRef.current.onopen = null;
                wsRef.current.onclose = null;
                wsRef.current.onerror = null;
                wsRef.current.onmessage = null;
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connectWebSocket]);

    const value = {
        retries: retries,
        websocketConnected: websocketConnected,
        maxRetries: maxRetries,
        accountDeleted:accountDeleted,
    }

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
