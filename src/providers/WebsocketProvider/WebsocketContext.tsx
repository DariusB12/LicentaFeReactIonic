import React from "react";



export interface WebSocketState {
    websocketConnected:boolean
    retries:number
    maxRetries:number
    accountDeleted:boolean
}

export const initialState: WebSocketState = {
    websocketConnected:false,
    retries:0,
    maxRetries:0,
    accountDeleted:false,
};

export const WebSocketContext = React.createContext<WebSocketState>(initialState);
