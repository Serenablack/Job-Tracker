export const chromeStorageService = {
  async get(keys) {
    return new Promise((resolve) => {
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.get(keys, resolve);
      } else {
        resolve({});
      }
    });
  },

  async set(items) {
    return new Promise((resolve) => {
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.set(items, resolve);
      } else {
        resolve();
      }
    });
  },

  async remove(keys) {
    return new Promise((resolve) => {
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.remove(keys, resolve);
      } else {
        resolve();
      }
    });
  },
};
