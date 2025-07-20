// app/config/firebase.js

// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration which you copied earlier
const firebaseConfig = {
  apiKey: "AIzaSyDmjrMtDHf8k8c2dSdrURj8UKyPBRv5mbo",
  authDomain: "salaryapp-bf7e6.firebaseapp.com",
  projectId: "salaryapp-bf7e6",
  storageBucket: "salaryapp-bf7e6.firebasestorage.app",
  messagingSenderId: "679099600524",
  appId: "1:679099600524:web:9ea31383078291f12eb5a9",
  measurementId: "G-Z7GFH9ZX65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

// Initialize and export Firebase services to be used in our app

export { auth, db};