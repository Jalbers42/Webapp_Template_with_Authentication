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
import { signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, sendPasswordResetEmail, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebaseConfig"; 

// to-do I might not need to save the user info in the context and firbase already stores user object --> auth.currentUser
const INITIAL_USER = {
    username: "",
    uid: "",
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
    sign_in_with_google: async () => {},
    sign_in_with_facebook: async () => {},
    sign_in_with_apple: async () => {},
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
    sign_in_with_google: () => Promise<void>;
    sign_in_with_facebook: () => Promise<void>;
    sign_in_with_apple: () => Promise<void>;
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
            setUser({
                username: `guest_${result.user.uid.substring(0, 8)}`, // Generate guest username
                uid: result.user.uid,
                isGuest: true,
            });
        } catch (error) {
            console.error("Error signing in anonymously", error);
        }
    };

    // Login function for registered users
    const log_in = async (email: string, password: string) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            setUser({
                username: result.user.email || `user_${result.user.uid.substring(0, 8)}`,
                uid: result.user.uid,
                isGuest: false,
            });
        } catch (error) {
            console.error("Error logging in", error);
            throw new Error("Invalid email or password");
        }
    };

    // Register function in AuthContext with unique username check
    const register = async (email: string, password: string, username: string) => {
        try {
            const q = query(collection(db, "users"), where("username", "==", username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error("Username is already taken");
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, { displayName: username });

            await setDoc(doc(db, "users", userCredential.user.uid), {
                username: username,
                email: email,
                uid: userCredential.user.uid,
                createdAt: new Date(),
            });

            setUser({
                username: username,
                uid: userCredential.user.uid,
                isGuest: false,
            });

        } catch (error) {
            console.error("Error during registration", error);
            throw error; // Rethrow the error so it can be handled in the UI
        }
    };

    // Logout function for registered users
    const logOut = async () => {
        try {
        await signOut(auth); // Sign out the user from Firebase
        setUser(INITIAL_USER); // Reset user state to initial state
        } catch (error) {
        console.error("Error logging out", error);
        }
    };

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
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Google user signed in:', result.user);
        } catch (error) {
            console.error('Google sign-in error:', error);
        }
    }

    async function sign_in_with_facebook() {
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            console.log('Facebook user signed in:', result.user);
        } catch (error) {
            console.error('Facebook sign-in error:', error);
        }
    }

    async function sign_in_with_apple() {
        try {
            const result = await signInWithPopup(auth, appleProvider);
            console.log('Apple user signed in:', result.user);
        } catch (error) {
            console.error('Apple sign-in error:', error);
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

    // Check if user is already signed in (anonymous or regular)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    username: firebaseUser.email || `guest_${firebaseUser.uid.substring(0, 8)}`,
                    uid: firebaseUser.uid,
                    isGuest: firebaseUser.isAnonymous,
                });
            } else {
                // User is signed out or there is no user
                setUser(INITIAL_USER);
            }
        });
        return () => unsubscribe(); // Clean up the listener on unmount
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