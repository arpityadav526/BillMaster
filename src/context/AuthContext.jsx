import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service';
import { socketService } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        socketService.connect(token);
      } catch {
        // Corrupted storage — clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Standard login (email + password flow)
  const login = async (emailOrUserData, password) => {
    // Overloaded: if password is undefined, treat first arg as user data object (for profile updates)
    if (password === undefined) {
      // Called as login(userData) — update user in context + storage
      const userData = emailOrUserData;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return;
    }
    
    // Normal login flow
    const result = await authService.login(emailOrUserData, password);
    if (result.success) {
      setUser(result.data.user);
      socketService.connect(result.data.token);
    }
    return result;
  };

  // Explicit user update (used after profile/avatar changes)
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    if (result.success) {
      setUser(result.data.user);
      socketService.connect(result.data.token);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
