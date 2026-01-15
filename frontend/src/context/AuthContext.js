import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh_token"));
  const [emailToken, setEmailToken] = useState(localStorage.getItem("email_token"));
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
    if (emailToken) {
      localStorage.setItem("email_token", emailToken);
    } else {
      localStorage.removeItem("email_token");
    }

    // When access token changes, try to fetch profile
    const fetchProfile = async () => {
      if (!token) {
        // If we have an email token, we might want to set a "Guest User" state
        if (emailToken) {
          // We could decode the token or just set a dummy user
          // But for now, let's just leave user null or set a flag.
          // Actually, let's keep user null for Guest/OTP users in this context to avoid confusion with Admin,
          // OR set a special property.
          // But Navbar checks !user?.is_staff. If user is null, it works.
          // But we want to show "My Bookings" if emailToken is present.
          setUser({ is_guest: true, email_login: true });
        } else {
          setUser(null);
        }
        return;
      }
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
  }, [token, refreshToken, emailToken]);

  // Login accepts access token and optional refresh token
  const login = (accessToken, newRefreshToken) => {
    setToken(accessToken);
    if (newRefreshToken) setRefreshToken(newRefreshToken);
    // Clear email token on admin login to avoid confusion
    setEmailToken(null);
  };

  const loginEmail = (newEmailToken) => {
    setEmailToken(newEmailToken);
    setToken(null);
    setRefreshToken(null);
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
    setEmailToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    setUser,
    login,
    loginEmail,
    logout,
    refreshProfile,
    isAuthenticated: !!token || !!emailToken,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
