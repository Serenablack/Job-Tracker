import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { Google as GoogleIcon, Work as WorkIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import { SecondaryButton } from "./common";

const AuthPage = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      showSnackbar(error.message || "Login failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "fit-content", // Consistent with other pages
        minHeight: "400px", // Ensure minimum usable height
        maxHeight: "600px", // Prevent excessive size
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "primary.main",
        p: { xs: 2, sm: 3 },
        overflow: "hidden", // Consistent with MainApp
      }}>
      {/* App Icon */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: { xs: 60, sm: 80 },
          height: { xs: 60, sm: 80 },
          borderRadius: 3,
          bgcolor: alpha(theme.palette.common.white, 0.15),
          color: "primary.contrastText",
          mb: { xs: 2, sm: 3 },
        }}>
        <WorkIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
      </Box>

      {/* App Title */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: "primary.contrastText",
          mb: 2,
          textAlign: "center",
          fontSize: { xs: "2rem", sm: "2.5rem" },
        }}>
        Job Tracker
      </Typography>

      {/* App Subtitle */}
      <Typography
        variant="body1"
        sx={{
          color: alpha(theme.palette.common.white, 0.8),
          mb: { xs: 3, sm: 4 },
          textAlign: "center",
          fontSize: { xs: "1rem", sm: "1.1rem" },
          lineHeight: 1.6,
          maxWidth: { xs: 300, sm: 400 },
        }}>
        Your AI-powered job application assistant
      </Typography>

      {/* Sign In Button */}
      <SecondaryButton
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <GoogleIcon />
          )
        }
        onClick={handleGoogleLogin}
        disabled={isLoading}
        size="large"
        variant="outlined"
        sx={{
          mb: { xs: 2, sm: 3 },
          bgcolor: "background.paper",
          borderColor: "background.paper",
          color: "primary.main",
          py: { xs: 1.2, sm: 1.5 },
          px: { xs: 3, sm: 4 },
          fontSize: { xs: "0.9rem", sm: "1rem" },
          fontWeight: 600,
          minWidth: { xs: 240, sm: 280 },
          "&:hover": {
            bgcolor: alpha(theme.palette.common.white, 0.9),
            borderColor: alpha(theme.palette.common.white, 0.9),
          },
        }}>
        {isLoading ? "Signing in..." : "Sign in with Google"}
      </SecondaryButton>

      {/* Terms Text */}
      <Typography
        variant="caption"
        sx={{
          color: alpha(theme.palette.common.white, 0.7),
          lineHeight: 1.4,
          textAlign: "center",
          maxWidth: { xs: 280, sm: 350 },
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
        }}>
        By signing in, you agree to our terms of service and privacy policy.
      </Typography>
    </Box>
  );
};

export default AuthPage;
