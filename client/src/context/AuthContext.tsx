/******************************************************************************/
/*                                                                            */
/*                                                        :::      ::::::::   */
/*                                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*                                                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Jalbers42                                         #+#    #+#             */
/*   https://github.com/Jalbers42                     ###   ###########       */
/*                                                                            */
/******************************************************************************/

import { IUser } from "@/types & constants/types";
import { createContext, useContext, useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, updateProfile, signOut, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { SERVER_URL } from "@/types & constants/constants";

// to-do I might not need to save the user info in the context and firbase already stores user object --> auth.currentUser
const INITIAL_USER = {
    username: "",
    uid: "",
    elo: 0,
    isGuest: true,
}

const INITIAL_STATE = {
    userState: INITIAL_USER,
    setUserState: () => {},
    log_in: async () => {},
    register: async () => {},
    logOut: async () => {},
    play_as_guest: async () => {},
    delete_account: async () => {},
    reset_password_with_email: async () => {},
    sign_in_with_third_party_provider: async () => false,
    edit_current_users_username: async () => {},
    // socket: null
}

type IContextType = {
    userState: IUser;
    setUserState: React.Dispatch<React.SetStateAction<IUser>>;
    log_in: (username: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logOut: () => Promise<void>;
    play_as_guest: () => Promise<void>;
    delete_account: () => Promise<void>;
    reset_password_with_email: (email: string) => Promise<void>;
    sign_in_with_third_party_provider: (provider: string) => Promise<boolean>;
    edit_current_users_username: (new_username: string) => Promise<void>;
    // socket: any; // Replace this with your actual socket type if needed
}

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children } : {children : React.ReactNode}) {
    const [userState, setUserState] = useState<IUser>(INITIAL_USER);

    console.log("Auth Context Render");
    console.log("User: ", auth.currentUser);

    // This needs to be checked
    const play_as_guest = async () => {
        try {
            const result = await signInAnonymously(auth);
            const guest_username = `guest_${result.user.uid.substring(0, 8)}`
            await updateProfile(result.user, { displayName: guest_username});
        } catch (error) {
            console.error("Error signing in anonymously", error);
        }
    };

    const log_in = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error logging in", error);
            throw new Error("Invalid email or password");
        }
    };

    const register = async (email: string, password: string, username: string) => {
        try {
            const response = await fetch(`${SERVER_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || 'Registration failed');
            console.log('User successfully registered:', data);
            await signInWithEmailAndPassword(auth, email, password);
            return data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
            setUserState(INITIAL_USER);
        } catch (error) {
            console.error("Error logging out", error);
        }
    };

    const delete_account = async () => {
        try {
            const user = auth.currentUser
            if (!user)
                throw new Error("No authenticated user.")

            const response = await fetch(`${SERVER_URL}/auth/delete-user`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
            });

            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || 'Account deletion failed');
            console.log('Account deleted successfully:', data);
            await logOut();
            return data;
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    };

    const reset_password_with_email = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log("Password reset email sent successfully");
        } catch (error) {
            console.error("Error sending password reset email:", error);
        }
    };

    async function sign_in_with_third_party_provider(provider: any) {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log('User object from Firebase:', user);

            const response = await fetch(`${SERVER_URL}/auth/sync-user-with-database`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
            });

            const data = await response.json();
            if (data.isNewUser) {
                console.log('New user created in the database');
            } else {
                console.log('Existing user signed in');
            }

            return data.is_new_user;
        } catch (error) {
            console.error('Third party sign-in error:', error);
            return false;
        }
    }

    async function edit_current_users_username(new_username:string) {
        try {
            const user = auth.currentUser
            if (!user)
                throw new Error("No authenticated user.")

            const response = await fetch(`${SERVER_URL}/auth/edit-username`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user.getIdToken()}`,
                },
                body: JSON.stringify({
                    new_username,
                }),
            });

            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || 'Select username failed');
            console.log('Username changed successfully:', data);
            setUserState((prevUser) => ({
                ...prevUser,
                username: new_username,
            }));
            return data;
        } catch (error) {
            console.error('Error editing username:', error);
            throw error;
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUserState({
                    username: firebaseUser.displayName || "Missing Username",
                    uid: firebaseUser.uid,
                    elo: 700,
                    isGuest: firebaseUser.isAnonymous,
                });
            } else {
                // play_as_guest();
                console.log('Currently no user signed in.');
            }
        });
        return () => unsubscribe();
    }, []);

    const value = {
        userState,
        setUserState,
        play_as_guest,
        log_in,
        register,
        logOut,
        delete_account,
        reset_password_with_email,
        sign_in_with_third_party_provider,
        edit_current_users_username,
        // socket,
    };

    return (
        <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);