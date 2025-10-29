import React, {useEffect} from 'react'
import Home from "./pages/Home/Home.jsx"
import {Routes, Route} from 'react-router-dom'
import Login from "./pages/login/login.jsx"
import Player from './pages/Player/Player.jsx'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase.js'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';



const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async(user) => {
      if (user) {
        console.log("Useer logged In");
        navigate("/");
      } else {
        console.log("No User Registered");
        navigate("/login");
      } 
    })
  }, []);


  return (
    <div>
      <Routes>
        <Route path='/' element = {<Home/>}/>
        <Route path='/login' element = {<Login/>}/>
        <Route path='/player/:id' element = {<Player/>}/>
      </Routes>
    </div>
  )
}

export default App