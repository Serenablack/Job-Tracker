import React, { createContext, useContext, useState, useEffect } from "react";
import { chromeStorageService } from "../services/chromeStorageService.js";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preference from Chrome storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const data = await chromeStorageService.get(["darkMode"]);
        if (data.darkMode !== undefined) {
          setIsDarkMode(data.darkMode);
        } else {
          // Fallback to localStorage for migration
          const localSaved = localStorage.getItem("darkMode");
          if (localSaved) {
            const darkMode = JSON.parse(localSaved);
            setIsDarkMode(darkMode);
            // Migrate to Chrome storage
            await chromeStorageService.set({ darkMode });
            localStorage.removeItem("darkMode");
          }
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        // Fallback to localStorage
        const saved = localStorage.getItem("darkMode");
        setIsDarkMode(saved ? JSON.parse(saved) : false);
      }
      setIsLoaded(true);
    };

    loadTheme();
  }, []);

  // Save theme preference to Chrome storage
  useEffect(() => {
    if (isLoaded) {
      const saveTheme = async () => {
        try {
          await chromeStorageService.set({ darkMode: isDarkMode });
        } catch (error) {
          console.error("Error saving theme:", error);
          // Fallback to localStorage
          localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
        }
      };
      saveTheme();
    }
  }, [isDarkMode, isLoaded]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    isLoaded, // Useful for preventing flash of wrong theme
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
