import React, { useState } from 'react';
import "./login.css";
import icon from "../../assets/icons/icon.png";
import LoadingGif from '../../assets/icons/Loading.gif';
import { signUp, logIn } from '../../firebase.js';

const Login = () => {
  const [signState, setSignState] = useState("Sign In"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Sign In / Sign Up
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (signState === "Sign In") {
        await logIn(email, password);
      } else {
        await signUp(name, email, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className='loading'>
      <img src={LoadingGif} alt="Loading..." />
    </div>
  ) : (
    <div className='login'>
      <img src={icon} alt="App Icon" className='login-icon' />

      <div className='login-form'>
        <h1>{signState}</h1>
        <form onSubmit={handleAuth}>
          {signState === "Sign Up" && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className='btn-submit'>{signState}</button>

          <div className='form-help'>
            <div className='remember'>
              <input type="checkbox" id="rememberMe" />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>
            <p>Need Help?</p>
          </div>
        </form>

        <div className='form-switch'>
          {signState === "Sign In" ? (
            <p>
              New to My App?{" "}
              <span onClick={() => setSignState("Sign Up")} className='switch-link'>
                Sign Up Now
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span onClick={() => setSignState("Sign In")} className='switch-link'>
                Sign In
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
