import { createContext, useContext, useEffect } from "react";
import { Socket, io } from "socket.io-client";

const INITIAL_STATE = {
    socket: null,
}

type IContextType = {
    socket: Socket | null;
}

const WebSocketContext = createContext<IContextType>(INITIAL_STATE);

export function WebSocketProvider({ children } : {children : React.ReactNode}) {

    const socket = io('http://localhost:3000');
    
    const value = {
        socket : socket
    }

    useEffect(() => {
        return () => {
            console.log('Disconnected from server');
            socket.disconnect();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocketContext = () => useContext(WebSocketContext);