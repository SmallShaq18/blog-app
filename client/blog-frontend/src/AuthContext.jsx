// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "./api"; // axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  

  // Load from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken !== "undefined") {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);


  const login = (token, user) => {
    if (!user) return; // prevent bad saves
    
    console.log("Saving token:", token);
    console.log("Saving user:", user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setToken(token);
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete API.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy usage
export const useAuthContext = () => useContext(AuthContext);
