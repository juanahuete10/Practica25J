import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyC50ZaX1Jzgknq1AEPBgQ3cuBOHfCnQqKc",
  authDomain: "proyecto25j.firebaseapp.com",
  projectId: "proyecto25j",
  storageBucket: "proyecto25j.firebasestorage.app",
  messagingSenderId: "763755141867",
  appId: "1:763755141867:web:c9ea7ad352341b90b4fcae"
};

// Initialize Firebase
const appfirebase = initializeApp(firebaseConfig);

const db = getFirestore(appfirebase);


const auth = getAuth(appfirebase);

export {appfirebase,db, auth};