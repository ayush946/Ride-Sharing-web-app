const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');
require('firebase/database');

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

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.database(app);
const database = firebase.firestore(app);

module.exports = { auth, provider, db, database };
