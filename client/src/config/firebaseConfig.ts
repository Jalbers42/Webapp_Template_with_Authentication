// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHOhubZhPwy3l8OXCu6ydCgYK2ZLgvTuU",
  authDomain: "godzilla-411621.firebaseapp.com",
  projectId: "godzilla-411621",
  storageBucket: "godzilla-411621.appspot.com",
  messagingSenderId: "599611568039",
  appId: "1:599611568039:web:e6903a9984112ff91f1082",
  measurementId: "G-XT4XWB1965"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app); 
export const auth = getAuth(app);