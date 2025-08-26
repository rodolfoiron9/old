
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get instances of Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
