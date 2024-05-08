import {React, useState, useEffect } from 'react';
import {useForm } from "react-hook-form";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import { getAuth,signInWithEmailAndPassword , signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import {auth ,provider} from "./firebase"

// importing components
import Admin from './admin';
import Traveler from './traveler';
import Registration from './registration';
import Ride from './ride';
 
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
    }, []);

  return (
     <Router>
          <nav className="navbar navbar-expand-lg bg-dark"  data-bs-theme="dark">
            <div className="container-fluid">
              <span className="navbar-brand mb-0 h1">Ride Sharing</span>
            </div>
          </nav>
      <div className="App">
        <Routes>
          <Route path='/Register' element={<Registration/>}/>
          <Route path='/ride/:rideId' element={<Ride />} />
          <Route path='/' element={user == null ? <Login/> : <ProtectedRoutes user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}
function ProtectedRoutes({ user }) {
  return (
    <Routes>
      <Route path='/' element={user.email === "ayushkg@iitbhilai.ac.in" ? <Admin admin = {user}/> : <Traveler user = {user}/>} />
    </Routes>
  );
}


function Login(){
  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
    .then((result) => {
      console.log("User Signed In", result);

    })
    .catch((error) => {
      console.error("Error Signing In", error);
    });
  };
  const { register, handleSubmit } = useForm();
  const handleEmailLogin = (data) => {
    // console.log(data);
    const auth = getAuth();
    signInWithEmailAndPassword(auth, data.username, data.password)
    .then( (userCredential) => {
      const user = userCredential.user;
    })
    .catch( (error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  };

  return ( 
    <div className="Logins">
        <form onSubmit={handleSubmit(handleEmailLogin)}> 
            <h2>Login</h2>
            <label for="username">Username:</label>
            <input type="text" {...register('username')} required />
            <label for="password">Password:</label>
            <input type="password" {...register('password')} required />
            <input type="submit" value="Login"></input>
            <input type="button" value="Google" onClick={handleGoogleLogin}></input>
            <Link to={"/Register"}>
            <input type="button" value="Register"/>
            </Link>
        </form>
    </div>
  )
} 


signInWithPopup(auth, provider)
  .then((result) => {
    console.log("signInwithPopup");
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    // const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // // Handle Errors here.
    // const errorCode = error.code;
    // const errorMessage = error.message;
    // // The email of the user's account used.
    // const email = error.customData.email;
    // // The AuthCredential type that was used.
    // const credential = GoogleAuthProvider.credentialFromError(error);
    // // ...
  });

export default App;
