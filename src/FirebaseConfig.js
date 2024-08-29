// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBkZPxNKyofy9ckFbEYa1hY0_7ATB_Avmk",
    authDomain: "neo-material.firebaseapp.com",
    databaseURL: "https://neo-material-default-rtdb.firebaseio.com",
    projectId: "neo-material",
    storageBucket: "neo-material.appspot.com",
    messagingSenderId: "682307159910",
    appId: "1:682307159910:web:d050c41199afbf92deaaa7",
    measurementId: "G-114CH5P1F1"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const realTimeDb = getDatabase(app)

setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error("Error setting persistence: ", error);
    });

export {
    app,
    db,
    analytics,
    auth,
    storage,
    realTimeDb
}