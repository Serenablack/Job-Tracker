import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService.js";
import { useSnackbar } from "./SnackbarContext.jsx";
import { chromeStorageService } from "../services/chromeStorageService.js";
import { storeGoogleToken, removeGoogleToken } from "../utils/authUtils.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [googleToken, setGoogleToken] = useState(null);
  const [sheetId, setSheetId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    loadStoredAuthData();
  }, []);

  const loadStoredAuthData = async () => {
    try {
      const data = await chromeStorageService.get([
        "googleToken",
        "sheetId",
        "userData",
        "jwtToken",
      ]);
      if (data.googleToken) {
        setGoogleToken(data.googleToken);
        setIsAuthenticated(true);
      }
      if (data.sheetId) {
        setSheetId(data.sheetId);
      }
      if (data.userData) {
        setUser(data.userData);
      }
    } catch (error) {
      console.error("Error loading stored auth data:", error);
    }
  };

  const login = async () => {
    try {
      const { token, userData } = await authService.login();

      setGoogleToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      // Store Google OAuth token
      await storeGoogleToken(token);

      await chromeStorageService.set({
        googleToken: token,
        userData: userData,
      });

      showSnackbar("Successfully logged in!", "success");
      return { token, userData };
    } catch (error) {
      showSnackbar(error.message || "Login failed", "error");
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (googleToken) {
        await authService.logout(googleToken);
      }

      setGoogleToken(null);
      setUser(null);
      setSheetId(null);
      setIsAuthenticated(false);

      // Remove Google OAuth token
      await removeGoogleToken();

      await chromeStorageService.remove(["googleToken", "sheetId", "userData"]);
      showSnackbar("Successfully logged out", "info");
    } catch (error) {
      showSnackbar("Logout failed", "error");
      console.error("Logout error:", error);
    }
  };

  const updateSheetId = async (newSheetId) => {
    setSheetId(newSheetId);
    await chromeStorageService.set({ sheetId: newSheetId });
  };

  const value = {
    user,
    googleToken,
    sheetId,
    isAuthenticated,
    login,
    logout,
    updateSheetId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
