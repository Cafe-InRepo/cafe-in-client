// src/context/AuthContext.js
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = token ? true : false;
  const navigate = useNavigate();

  const login = (token) => {
    localStorage.setItem('token', token);
    navigate('/admin'); // Redirect to admin page
  };
  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
