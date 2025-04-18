import { createContext, useContext, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useAuthContext } from "./AuthContext";
import { auth } from "@/config/firebaseConfig";

const INITIAL_STATE = {
    socket: null,
    connectSocket: () => {},
    disconnectSocket: () => {},
}

type IContextType = {
    socket: Socket | null;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

const WebSocketContext = createContext<IContextType>(INITIAL_STATE);

export function WebSocketProvider({ children } : {children : React.ReactNode}) {

    const { userState } = useAuthContext();
    const [socket, setSocket] = useState<Socket | null>(null);

    const connectSocket = async () => {
        if (userState && auth.currentUser && !socket) {
            const token = await auth.currentUser.getIdToken();

            const socketInstance = io('http://localhost:3001');

            socketInstance.on('connect', () => {
                console.log("Socket connected. Sending authentication message.");
                socketInstance.emit('authenticate', token);
            });

            socketInstance.on('authenticated', () => {
                console.log("Socket: Authentication successful.");
                setSocket(socketInstance);
            });

            socketInstance.on('unauthorized', (message) => {
                console.log('Socket: Unauthorized:', message);
                socketInstance.disconnect();
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected.');
                setSocket(null);
            });
        }
    };

    const disconnectSocket = () => {
        if (socket) {
            console.log('Disconnected from server');
            socket.disconnect();
            setSocket(null);
        }
    };

    const value = {
        socket: socket,
        connectSocket,
        disconnectSocket
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocketContext = () => useContext(WebSocketContext);