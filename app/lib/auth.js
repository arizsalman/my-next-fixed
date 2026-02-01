"use client"; // used by client components that import it

import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export async function signInWithGoogle(remember = true) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (
      error.code === "auth/cancelled-popup-request" ||
      error.code === "auth/popup-closed-by-user"
    ) {
      console.log("Google login popup was closed or cancelled by user.");
      return null; // return null so caller knows login didn't happen
    }
    throw error; // baki errors ko throw kar do
  }
}

export async function signInWithGitHub(remember = true) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  try {
    return await signInWithPopup(auth, githubProvider);
  } catch (error) {
    if (
      error.code === "auth/cancelled-popup-request" ||
      error.code === "auth/popup-closed-by-user"
    ) {
      console.log("GitHub login popup was closed or cancelled by user.");
      return null;
    }
    throw error;
  }
}

export async function signInWithEmail({ email, password, remember = true }) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail({ email, password }) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser() {
  return firebaseSignOut(auth);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}
