import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ initialize from localStorage immediately
  const stored = JSON.parse(localStorage.getItem("auth"));
  const [auth, setAuth] = useState(stored); 
  const [loading, setLoading] = useState(false); // no need to wait now

  const login = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};