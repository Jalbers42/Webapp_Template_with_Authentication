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
import { signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, updateProfile, signOut, sendPasswordResetEmail, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebaseConfig"; 
import { SERVER_URL } from "@/types & constants/constants";

// to-do I might not need to save the user info in the context and firbase already stores user object --> auth.currentUser
const INITIAL_USER = {
    username: "",
    uid: "",
    elo: 0,
    isGuest: true, 
}

const INITIAL_STATE = {
    user: INITIAL_USER,
    setUser: () => {},
    log_in: async () => {},
    register: async () => {},
    logOut: async () => {},
    play_as_guest: async () => {},
    reset_password_with_username_or_email: async () => {},
    sign_in_with_google: async () => false,
    sign_in_with_facebook: async () => false,
    sign_in_with_apple: async () => false,
    edit_current_users_username: async () => {},
    // socket: null
}

type IContextType = {
    user: IUser;
    setUser: React.Dispatch<React.SetStateAction<IUser>>;
    log_in: (username: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logOut: () => Promise<void>;
    play_as_guest: () => Promise<void>;
    reset_password_with_username_or_email: (input: string) => Promise<void>;
    sign_in_with_google: () => Promise<boolean>;
    sign_in_with_facebook: () => Promise<boolean>;
    sign_in_with_apple: () => Promise<boolean>;
    edit_current_users_username: (new_username: string) => Promise<void>;
    // socket: any; // Replace this with your actual socket type if needed
}

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children } : {children : React.ReactNode}) {
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const googleProvider = new GoogleAuthProvider();
    const facebookProvider = new FacebookAuthProvider();
    const appleProvider = new OAuthProvider('apple.com');
    
    console.log("Auth Context Render");
    console.log("User: ", auth.currentUser);
    
    // Initialize Firebase anonymous auth for guest users
    const play_as_guest = async () => {
        try {
            const result = await signInAnonymously(auth);
            const guest_username = `guest_${result.user.uid.substring(0, 8)}`
            await updateProfile(result.user, { displayName: guest_username});
        } catch (error) {
            console.error("Error signing in anonymously", error);
        }
    };
    
    // Login function for registered users
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
            const response = await fetch(`${SERVER_URL}/firebase/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                }),
            });
            if (!response.ok)
                throw new Error(`Registration failed: ${response.statusText}`);
            const data = await response.json();
            console.log('User successfully registered:', data);
            return data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    };
    
    const logOut = async () => {
        try {
            await signOut(auth);
            setUser(INITIAL_USER);
        } catch (error) {
            console.error("Error logging out", error);
        }
    };
    
    // to-do improve this
    const isValidEmail = (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
    };
    
    const reset_password_with_username_or_email = async (input: string) => {
        try {
            let email = input;
            
            if (!isValidEmail(input)) {
                const q = query(collection(db, "users"), where("username", "==", input));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty)
                    throw new Error("Username not found");
                const userDoc = querySnapshot.docs[0];
                email = userDoc.data().email;
            }
            await sendPasswordResetEmail(auth, email);
            console.log(`Password reset email sent to: ${email}`);
        } catch (error) {
            console.error("Error during password reset", error);
            throw error;
        }
    };
    
    async function sign_in_with_google() {
        try {
            let is_new_user: boolean = false;
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user;
            const userRef = doc(db, "users", user.uid)
            
            const userSnapshot = await getDoc(userRef)
            if (!userSnapshot.exists()) {
                await setDoc(userRef, {
                    username: user.displayName || "Anonymous",
                    email: user.email,
                    uid: user.uid,
                    createdAt: new Date(),
                });
                is_new_user = true
            }
            console.log('Google user signed in:', user)
            return (is_new_user)
        } catch (error) {
            console.error('Google sign-in error:', error)
            return (false)
        }
    }
    
    // Facebook Sign-In
    async function sign_in_with_facebook() {
        try {
            let is_new_user: boolean = false;
            const result = await signInWithPopup(auth, facebookProvider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()) {
                await setDoc(userRef, {
                    username: user.displayName || "Anonymous", 
                    email: user.email,
                    uid: user.uid,
                    createdAt: new Date(),
                });
                is_new_user = true
            }
            
            console.log('Facebook user signed in:', user);
            return (is_new_user);
        } catch (error) {
            console.error('Facebook sign-in error:', error);
            return (false)
        }
    }
    
    // Apple Sign-In
    async function sign_in_with_apple() {
        try {
            let is_new_user: boolean = false;
            const result = await signInWithPopup(auth, appleProvider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()) {
                await setDoc(userRef, {
                    username: user.displayName || "Anonymous",
                    email: user.email,
                    uid: user.uid,
                    createdAt: new Date(),
                });
                is_new_user = true
            }
            
            console.log('Apple user signed in:', user);
            return (is_new_user);
        } catch (error) {
            console.error('Apple sign-in error:', error);
            return (false)
        }
    }
    
    async function edit_current_users_username(new_username:string) {
        if (!auth.currentUser) {
            throw new Error("No authenticated user found");
        }
        const userId = auth.currentUser.uid;
        
        // Step 1: Check if the username is already taken
        const q = query(collection(db, "users"), where("username", "==", new_username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            throw new Error("Username is already taken");
        }
        
        // Step 2: Update the username in Firestore
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { username: new_username});
        
        // Step 3: Update the displayName in Firebase Auth
        await updateProfile(auth.currentUser, { displayName: new_username });
        
        // Step 4: Update the local user state in the AuthContext
        setUser((prevUser) => ({
            ...prevUser,
            username: new_username,
        }));
        
        console.log(`Username successfully updated to ${new_username}`);
    }
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    username: firebaseUser.displayName || "",
                    uid: firebaseUser.uid,
                    elo: 700,
                    isGuest: firebaseUser.isAnonymous,
                });
            } else {
                play_as_guest();
            }
        });
        return () => unsubscribe();
    }, []);
    
    const value = {
        user,
        setUser,
        play_as_guest,
        log_in,
        register,
        logOut,
        reset_password_with_username_or_email,
        sign_in_with_google,
        sign_in_with_facebook,
        sign_in_with_apple,
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