// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { toast } from "react-toastify";
import { mediaKey, getMediaTitle } from "./utils/media.js";

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

// Friendly formatter for firebase auth error codes
const formatAuthError = (err) => {
  try {
    return err.code.split("/")[1].split("-").join(" ");
  } catch {
    return "Something went wrong. Please try again.";
  }
};

const signUp = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    // Keyed by uid (not a random doc id) so we can update it later, e.g. My List
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
      myList: [],
    });
    toast.success(`Welcome, ${name}!`);
  } catch (err) {
    console.error(err);
    toast.error(formatAuthError(err));
    throw err;
  }
};

const logIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Signed in successfully");
  } catch (err) {
    console.error(err);
    toast.error(formatAuthError(err));
    throw err;
  }
};

const logOut = () => {
  signOut(auth);
  toast.info("Signed out");
};

// ---- My List (Firestore) ----

const getMyList = async (uid) => {
  if (!uid) return [];
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().myList || [] : [];
};

const addToMyList = async (uid, movie) => {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { myList: arrayUnion(movie) });
  toast.success(`Added "${getMediaTitle(movie)}" to My List`);
};

const removeFromMyList = async (uid, movie) => {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { myList: arrayRemove(movie) });
  toast.info(`Removed "${getMediaTitle(movie)}" from My List`);
};

// Real-time version of getMyList - fires callback(list) immediately, then again
// on every change to this user's list, from any component/tab. Call the
// returned function to unsubscribe (e.g. in a useEffect cleanup).
const subscribeToMyList = (uid, callback) => {
  if (!uid) return () => {};
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (snap) => {
    callback(snap.exists() ? snap.data().myList || [] : []);
  });
};

// ---- Watch history (powers the "Recommended For You" row) ----

// Call whenever a user opens a title in the Player. Keeps only the most
// recent title for simplicity - swap to an array + arrayUnion if you want
// full history later.
const recordWatched = async (uid, item, mediaType) => {
  if (!uid || !item) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    lastWatched: { id: item.id, mediaType, title: getMediaTitle(item) },
  });
};

const getLastWatched = async (uid) => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().lastWatched || null : null;
};

// ---- Star ratings (1-5, per user per title) ----
// Stored as a map on the user doc: { ratings: { "movie_123": 4, "tv_123": 5 } }
// Keyed by mediaType+id since a movie and a TV show can share the same
// numeric TMDb id. Simple map avoids a second collection; fine at this scale.

const submitRating = async (uid, mediaType, id, rating) => {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { [`ratings.${mediaKey(mediaType, id)}`]: rating });
  toast.success(`You rated this ${rating} star${rating > 1 ? "s" : ""}`);
};

const getUserRating = async (uid, mediaType, id) => {
  if (!uid) return 0;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().ratings?.[mediaKey(mediaType, id)] || 0) : 0;
};

export {
  auth,
  db,
  signUp,
  logIn,
  logOut,
  getMyList,
  addToMyList,
  removeFromMyList,
  subscribeToMyList,
  recordWatched,
  getLastWatched,
  submitRating,
  getUserRating,
};
