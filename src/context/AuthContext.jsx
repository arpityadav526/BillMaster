import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service';
import { socketService } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
          socketService.connect(token);
          
          // Background refresh user data from server to keep state in sync
          const res = await authService.getCurrentUser();
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Only clear on actual auth failure, not network errors
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();

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

  const googleLogin = async (token) => {
    const result = await authService.googleLogin(token);
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
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
