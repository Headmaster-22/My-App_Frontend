import { createContext, useContext } from 'react';

export const AuthContext = createContext({ user: null, loadingAuth: true });

export const useAuth = () => useContext(AuthContext);
