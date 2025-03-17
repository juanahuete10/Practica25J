import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyDIRq5o5k3eh9yVb_fqFOUEp5mocGGcbBM",
    authDomain: "entregaindividual10-03-2025.firebaseapp.com",
    projectId: "entregaindividual10-03-2025",
    storageBucket: "entregaindividual10-03-2025.firebasestorage.app",
    messagingSenderId: "109693068494",
    appId: "1:109693068494:web:777ebbb126546d10455c9f",
    measurementId: "G-DH3M24JK6D"
  };

// Initialize Firebase
const appfirebase = initializeApp(firebaseConfig);

const db = getFirestore(appfirebase);


const auth = getAuth(appfirebase);

export {appfirebase,db, auth};