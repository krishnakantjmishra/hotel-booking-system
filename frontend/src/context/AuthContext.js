import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh_token"));
  const [user, setUser] = useState(null); // We can fill from /users/profile/ later
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Persist access and refresh tokens in localStorage
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    } else {
      localStorage.removeItem("refresh_token");
    }

    // When access token changes, try to fetch profile
    const fetchProfile = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await api.get("/api/v1/auth/profile/");
        // backend profile doesn't include user flags; but include profile data
        setUser(res.data || null);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token, refreshToken]);

  // Login accepts access token and optional refresh token
  const login = (accessToken, newRefreshToken) => {
    setToken(accessToken);
    if (newRefreshToken) setRefreshToken(newRefreshToken);
  };

  const refreshProfile = async () => {
    if (!token) return null;
    setLoading(true);
    try {
      const res = await api.get("/api/v1/auth/profile/");
      setUser(res.data || null);
      return res.data || null;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear both access and refresh tokens from state (useEffect will sync localStorage)
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    setUser,
    login,
    logout,
    refreshProfile,
    isAuthenticated: !!token,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
