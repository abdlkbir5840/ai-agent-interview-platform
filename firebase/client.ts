import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCVe6ogFPd8fywXxAb6UYvRxebh-IA7d78",
  authDomain: "ai-projects-42ea4.firebaseapp.com",
  projectId: "ai-projects-42ea4",
  storageBucket: "ai-projects-42ea4.firebasestorage.app",
  messagingSenderId: "110176236381",
  appId: "1:110176236381:web:ef1d5caa52ec458d3baeb4",
  measurementId: "G-HPXW0LG31G"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);