// src/firebase.js
import React from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider , signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyASWv_M5tw0bOVzWlh69xvogF2xtnO7P7E",
  authDomain: "ridesharing-2c67f.firebaseapp.com",
  projectId: "ridesharing-2c67f",
  storageBucket: "ridesharing-2c67f.appspot.com",
  messagingSenderId: "114749265679",
  appId: "1:114749265679:web:3c67196a5c9cd7d0bad07a",
  measurementId: "G-5XFBZXZ5RC",
  databaseURL:"https://ridesharing-2c67f-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const UserLoginContext = React.createContext();
export const db = getDatabase(app);
export const database = getFirestore(app);