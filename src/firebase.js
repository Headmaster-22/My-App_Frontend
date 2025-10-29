// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { signOut } from "firebase/auth";
import {addDoc, getFirestore} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword,
    signInWithEmailAndPassword} from "firebase/auth";
import { collection } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyD0_RcWIolmsXcWccVvLsKYYqEwO4g7KM8",
  authDomain: "myapp2207.firebaseapp.com",
  projectId: "myapp2207",
  storageBucket: "myapp2207.firebasestorage.app",
  messagingSenderId: "490992054649",
  appId: "1:490992054649:web:aef1ed3ebb710eda627fa8",
  measurementId: "G-HSN33RD62X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signUp = async (name, email, password) => {
    try{
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
    await addDoc(collection(db, "users"), {
            uid: user.uid,
            name,
            authProvider: "local",
            email
        });
    } catch (err) {
        console.error(err);
        toast.error(err.code.split("/")[2].split("-").join(" "));
    }
};

const logIn = async (email, password) => {
    try{
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        console.error(err);
        toast.error(err.code.split("/")[2].split("-").join(" "));
    }
}

const logOut = () => {
    signOut(auth);
};

export { auth, db, signUp, logIn, logOut };