import React, { useEffect, useState, useCallback } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import createAppTheme from "./styles/theme";
import { Box, CssBaseline } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import MainApp from "./components/MainApp";
import "./App.css";

if (typeof window !== "undefined" && !window.chrome) {
  window.chrome = {
    identity: {
      getAuthToken: (options, callback) => {
        setTimeout(() => callback("mock-token"), 500);
      },
      removeCachedAuthToken: (options, callback) => {
        setTimeout(() => callback(), 100);
      },
    },
    storage: {
      local: {
        get: (keys, cb) => cb({}),
        set: (items, cb) => cb && cb(),
        remove: (keys, cb) => cb && cb(),
      },
    },
    runtime: {
      lastError: null,
    },
  };
}

// Side panel setup and state persistence
const setupSidePanel = () => {
  // Set side panel specific CSS properties
  document.documentElement.style.setProperty("--page-zoom", "1");
  document.documentElement.style.setProperty("--extension-scale", "1");

  // Add side panel specific styling
  document.body.classList.add("side-panel-mode");

  // Notify background script that side panel is opened
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.sendMessage({ type: "SIDE_PANEL_OPENED" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Background script not ready yet");
      } else {
        console.log("Side panel opened notification sent");
      }
    });
  }

  return () => {
    // Cleanup when side panel closes
    document.body.classList.remove("side-panel-mode");
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "SIDE_PANEL_CLOSED" });
    }
  };
};

// State persistence utilities
const saveAppState = (state) => {
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.sendMessage(
      {
        type: "SAVE_APP_STATE",
        state: state,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Failed to save app state:", chrome.runtime.lastError);
        } else {
          console.log("App state saved successfully");
        }
      }
    );
  }
};

const loadAppState = (callback) => {
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.sendMessage({ type: "GET_APP_STATE" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Failed to load app state:", chrome.runtime.lastError);
        callback(null);
      } else if (response.success && response.state) {
        console.log("App state loaded successfully");
        callback(response.state);
      } else {
        callback(null);
      }
    });
  } else {
    callback(null);
  }
};

// Dynamic theme component with side panel support
const DynamicThemeProvider = ({ children }) => {
  const { isDarkMode } = useTheme();
  const theme = createAppTheme(isDarkMode);

  useEffect(() => {
    const cleanup = setupSidePanel();
    return cleanup;
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial app state on mount
  useEffect(() => {
    loadAppState((savedState) => {
      if (savedState) {
        console.log("Restoring app state:", savedState);
        // The saved state will be handled by individual context providers
        // This gives us a hook to restore complex state if needed
      }
      setIsInitialized(true);
    });
  }, []);

  // Auto-save app state periodically (debounced)
  useEffect(() => {
    let saveTimeout;

    const autoSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        // We'll let the context providers handle their own state saving
        // This provides a central place for global state coordination
        const appState = {
          timestamp: Date.now(),
          version: "1.0.0",
        };
        saveAppState(appState);
      }, 2000); // Auto-save 2 seconds after last activity
    };

    // Listen for user activity to trigger auto-save
    const events = ["click", "keypress", "change", "input"];
    events.forEach((event) => {
      document.addEventListener(event, autoSave, { passive: true });
    });

    return () => {
      clearTimeout(saveTimeout);
      events.forEach((event) => {
        document.removeEventListener(event, autoSave);
      });
    };
  }, []);

  // Don't render until we've attempted to load saved state
  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}>
        Loading...
      </Box>
    );
  }

  return (
    <ThemeProvider>
      <DynamicThemeProvider>
        <LoadingProvider>
          <SnackbarProvider>
            <AuthProvider>
              <MainApp />
            </AuthProvider>
          </SnackbarProvider>
        </LoadingProvider>
      </DynamicThemeProvider>
    </ThemeProvider>
  );
};

export default App;
