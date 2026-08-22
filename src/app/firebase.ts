// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDuKXX4Ia9-14YOJvRvSbOdBEkP2vgiNfE',
  authDomain: 'ltsolutions-8b402.firebaseapp.com',
  projectId: 'ltsolutions-8b402',
  storageBucket: 'ltsolutions-8b402.firebasestorage.app',
  messagingSenderId: '503778823882',
  appId: '1:503778823882:web:f8da457448afb73fb0ee33',
  measurementId: 'G-G5ELPL8HWN',
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Auth and Firestore instances you can import anywhere in the app
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Analytics only works in a browser environment that supports it.
// Guarding with isSupported() prevents errors during SSR/build.
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(firebaseApp) : null
);