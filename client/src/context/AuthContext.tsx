import { IUser } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const INITIAL_USER = {
    username: "",
    password: "",
    rank: 0,
}

const INITIAL_STATE = {
    user: INITIAL_USER,
    setUser: () => {},
    socket: null
}

type IContextType = {
    user: IUser;
    setUser: React.Dispatch<React.SetStateAction<IUser>>;
    socket: Socket | null;
}

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children } : {children : React.ReactNode}) {
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const socket = io('http://localhost:3000');

    const value = {
        user: user,
        setUser: setUser,
        socket: socket
    };

    useEffect(() => {
        return () => {
            console.log('Disconnected from server');
            socket.disconnect();
        };
    }, []);

    return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
}

export const useUserContext = () => useContext(AuthContext);