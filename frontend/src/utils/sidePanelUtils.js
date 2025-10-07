/**
 * Side Panel State Management Utilities
 * Provides enhanced state persistence for the browser extension side panel
 */

// Key prefixes for different types of state
const STATE_KEYS = {
  CURRENT_PAGE: "sidepanel_current_page",
  FORM_DATA: "sidepanel_form_data",
  UI_STATE: "sidepanel_ui_state",
  SCROLL_POSITION: "sidepanel_scroll_position",
  LAST_ACTIVITY: "sidepanel_last_activity",
};

/**
 * Save current page/route state
 */
export const saveCurrentPage = async (pageInfo) => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({
        [STATE_KEYS.CURRENT_PAGE]: {
          ...pageInfo,
          timestamp: Date.now(),
        },
      });
    }
  } catch (error) {
    console.error("Failed to save current page:", error);
  }
};

/**
 * Load current page/route state
 */
export const loadCurrentPage = async () => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const result = await chrome.storage.local.get([STATE_KEYS.CURRENT_PAGE]);
      return result[STATE_KEYS.CURRENT_PAGE] || null;
    }
  } catch (error) {
    console.error("Failed to load current page:", error);
  }
  return null;
};

/**
 * Save form data with auto-cleanup of old data
 */
export const saveFormData = async (formId, formData) => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const key = `${STATE_KEYS.FORM_DATA}_${formId}`;
      await chrome.storage.local.set({
        [key]: {
          data: formData,
          timestamp: Date.now(),
        },
      });

      // Auto-cleanup old form data (older than 24 hours)
      await cleanupOldFormData();
    }
  } catch (error) {
    console.error("Failed to save form data:", error);
  }
};

/**
 * Load form data
 */
export const loadFormData = async (formId) => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const key = `${STATE_KEYS.FORM_DATA}_${formId}`;
      const result = await chrome.storage.local.get([key]);
      const formData = result[key];

      if (formData && formData.timestamp) {
        // Check if data is still fresh (within 24 hours)
        const isRecent = Date.now() - formData.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent) {
          return formData.data;
        } else {
          // Remove stale data
          await chrome.storage.local.remove([key]);
        }
      }
    }
  } catch (error) {
    console.error("Failed to load form data:", error);
  }
  return null;
};

/**
 * Save UI component state (expanded/collapsed panels, selected tabs, etc.)
 */
export const saveUIState = async (componentId, state) => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const key = `${STATE_KEYS.UI_STATE}_${componentId}`;
      await chrome.storage.local.set({
        [key]: {
          state,
          timestamp: Date.now(),
        },
      });
    }
  } catch (error) {
    console.error("Failed to save UI state:", error);
  }
};

/**
 * Load UI component state
 */
export const loadUIState = async (componentId) => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const key = `${STATE_KEYS.UI_STATE}_${componentId}`;
      const result = await chrome.storage.local.get([key]);
      const uiState = result[key];

      if (uiState && uiState.timestamp) {
        // UI state is valid for 7 days
        const isRecent =
          Date.now() - uiState.timestamp < 7 * 24 * 60 * 60 * 1000;
        if (isRecent) {
          return uiState.state;
        } else {
          await chrome.storage.local.remove([key]);
        }
      }
    }
  } catch (error) {
    console.error("Failed to load UI state:", error);
  }
  return null;
};

/**
 * Save scroll position for a page
 */
export const saveScrollPosition = async (pageId, scrollTop) => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const key = `${STATE_KEYS.SCROLL_POSITION}_${pageId}`;
      await chrome.storage.local.set({
        [key]: {
          scrollTop,
          timestamp: Date.now(),
        },
      });
    }
  } catch (error) {
    console.error("Failed to save scroll position:", error);
  }
};

/**
 * Load scroll position for a page
 */
export const loadScrollPosition = async (pageId) => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const key = `${STATE_KEYS.SCROLL_POSITION}_${pageId}`;
      const result = await chrome.storage.local.get([key]);
      const scrollData = result[key];

      if (scrollData && scrollData.timestamp) {
        // Scroll position is valid for 1 hour
        const isRecent = Date.now() - scrollData.timestamp < 60 * 60 * 1000;
        if (isRecent) {
          return scrollData.scrollTop;
        } else {
          await chrome.storage.local.remove([key]);
        }
      }
    }
  } catch (error) {
    console.error("Failed to load scroll position:", error);
  }
  return 0;
};

/**
 * Record user activity for session management
 */
export const recordActivity = async () => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({
        [STATE_KEYS.LAST_ACTIVITY]: Date.now(),
      });
    }
  } catch (error) {
    console.error("Failed to record activity:", error);
  }
};

/**
 * Check if session is still active (user was active within the last hour)
 */
export const isSessionActive = async () => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const result = await chrome.storage.local.get([STATE_KEYS.LAST_ACTIVITY]);
      const lastActivity = result[STATE_KEYS.LAST_ACTIVITY];

      if (lastActivity) {
        const hoursSinceActivity =
          (Date.now() - lastActivity) / (1000 * 60 * 60);
        return hoursSinceActivity < 1; // Active if within last hour
      }
    }
  } catch (error) {
    console.error("Failed to check session activity:", error);
  }
  return false;
};

/**
 * Cleanup old form data to prevent storage bloat
 */
const cleanupOldFormData = async () => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const allData = await chrome.storage.local.get();
      const keysToRemove = [];
      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

      Object.keys(allData).forEach((key) => {
        if (key.startsWith(STATE_KEYS.FORM_DATA)) {
          const data = allData[key];
          if (data && data.timestamp && data.timestamp < cutoffTime) {
            keysToRemove.push(key);
          }
        }
      });

      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        console.log(`Cleaned up ${keysToRemove.length} old form data entries`);
      }
    }
  } catch (error) {
    console.error("Failed to cleanup old form data:", error);
  }
};

/**
 * Clear all side panel state (useful for logout or reset)
 */
export const clearAllSidePanelState = async () => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const allData = await chrome.storage.local.get();
      const keysToRemove = [];

      Object.keys(allData).forEach((key) => {
        if (
          Object.values(STATE_KEYS).some((prefix) => key.startsWith(prefix))
        ) {
          keysToRemove.push(key);
        }
      });

      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        console.log("Cleared all side panel state");
      }
    }
  } catch (error) {
    console.error("Failed to clear side panel state:", error);
  }
};

/**
 * Export state keys for use in other modules
 */
export { STATE_KEYS };






