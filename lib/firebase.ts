// FIX: Changed to a namespace import to resolve a potential module resolution issue with 'initializeApp'.
import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../firebaseConfig";

// Initialize Firebase using the v9 modular syntax
const app = firebaseApp.initializeApp(firebaseConfig);

// Get instances of Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };