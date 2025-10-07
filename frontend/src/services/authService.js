export const authService = {
  async login() {
    return new Promise((resolve, reject) => {
      if (!window.chrome?.identity) {
        reject(new Error("Chrome identity API not available"));
        return;
      }

      window.chrome.identity.getAuthToken(
        { interactive: true },
        async (token) => {
          if (window.chrome?.runtime?.lastError || !token) {
            reject(new Error("Google login failed"));
            return;
          }

          try {
            // Get user data
            const userRes = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!userRes.ok) {
              throw new Error("Failed to get user info");
            }

            const userData = await userRes.json();
            resolve({ token, userData });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  },

  async logout(token) {
    return new Promise((resolve) => {
      if (window.chrome?.identity?.removeCachedAuthToken) {
        window.chrome.identity.removeCachedAuthToken({ token }, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  },
};
