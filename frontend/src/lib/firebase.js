import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAbAOoh962PS-I1rDCgChBsJ-8R596nhzU",
  authDomain: "chatify-3c776.firebaseapp.com",
  projectId: "chatify-3c776",
  storageBucket: "chatify-3c776.firebasestorage.app",
  messagingSenderId: "301415010899",
  appId: "1:301415010899:web:2aa77c139024f56ac16ca6",
  measurementId: "G-D47MQ0353D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
