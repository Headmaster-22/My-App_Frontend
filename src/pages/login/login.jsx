import React, { useState, useEffect } from 'react';
import "./login.css";
import icon from "../../assets/icons/icon.png";
import LoadingGif from '../../assets/icons/Loading.gif';
import { signUp, logIn } from '../../firebase.js';
import { toast } from 'react-toastify';

const REMEMBER_KEY = "myapp_remembered_email";

const Login = () => {
  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prefill remembered email on mount
  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBER_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (signState === "Sign Up" && name.trim().length < 2) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      if (signState === "Sign In") {
        await logIn(email, password);
      } else {
        await signUp(name, email, password);
      }

      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_KEY, email);
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
      }
      // Navigation on success is handled by the auth-state listener in App.jsx
    } catch (error) {
      // firebase.js already toasts a friendly message; just log for devs
      console.error("Authentication error:", error);
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

          <div className='password-field'>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className='password-toggle'
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" className='btn-submit'>{signState}</button>

          <div className='form-help'>
            <div className='remember'>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
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
