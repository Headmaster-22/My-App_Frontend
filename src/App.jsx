import React from 'react';
import Home from "./pages/Home/Home.jsx";
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/login/login.jsx";
import Player from './pages/Player/Player.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthProvider.jsx';
import { useAuth } from './context/AuthContext.js';

// Guards a route: bounces to /login if there's no signed-in user.
const PrivateRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  if (loadingAuth) return <div className="app-loading">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Keeps a signed-in user off the login screen.
const PublicOnlyRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  if (loadingAuth) return <div className="app-loading">Loading...</div>;
  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path='/'
      element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      }
    />
    <Route
      path='/login'
      element={
        <PublicOnlyRoute>
          <Login />
        </PublicOnlyRoute>
      }
    />
    <Route
      path='/player/:mediaType/:id'
      element={
        <PrivateRoute>
          <Player />
        </PrivateRoute>
      }
    />
  </Routes>
);

const App = () => {
  return (
    <AuthProvider>
      <div>
        <AppRoutes />
        <ToastContainer
          position="bottom-right"
          theme="dark"
          autoClose={3000}
          pauseOnHover
        />
      </div>
    </AuthProvider>
  );
};

export default App;
