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
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
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
    logIn: async () => {},
    register: async () => {},
    logOut: async () => {},
    playAsGuest: async () => {},
    resetPasswordWithUsernameOrEmail: async () => {},
    signInWithGoogle: async () => {},
    signInWithFacebook: async () => {},
    signInWithApple: async () => {},
    // socket: null
}

type IContextType = {
    user: IUser;
    setUser: React.Dispatch<React.SetStateAction<IUser>>;
    logIn: (username: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logOut: () => Promise<void>;
    playAsGuest: () => Promise<void>;
    resetPasswordWithUsernameOrEmail: (input: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
    signInWithApple: () => Promise<void>;
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
    const playAsGuest = async () => {
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
    const logIn = async (email: string, password: string) => {
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

    const resetPasswordWithUsernameOrEmail = async (input: string) => {
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

    async function signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Google user signed in:', result.user);
        } catch (error) {
            console.error('Google sign-in error:', error);
        }
    }

    async function signInWithFacebook() {
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            console.log('Facebook user signed in:', result.user);
        } catch (error) {
            console.error('Facebook sign-in error:', error);
        }
    }

    async function signInWithApple() {
        try {
            const result = await signInWithPopup(auth, appleProvider);
            console.log('Apple user signed in:', result.user);
        } catch (error) {
            console.error('Apple sign-in error:', error);
        }
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
        playAsGuest,
        logIn,
        register,
        logOut,
        resetPasswordWithUsernameOrEmail,
        signInWithGoogle,
        signInWithFacebook,
        signInWithApple,
        // socket,
    };

    return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext);