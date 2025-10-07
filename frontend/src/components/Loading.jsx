import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Work as WorkIcon,
  Description as DescriptionIcon,
  Compare as CompareIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as HourglassIcon,
} from "@mui/icons-material";
// Local UI layout values replacing constants usage
const MODAL_Z_INDEX = 1000;
const CARD_MAX_WIDTH = 400;

const Loading = ({
  size = 50,
  message = "Loading...",
  subMessage = null,
  variant = "default", // "default", "page", "inline", "job-extract", "resume-analyze", "resume-generate", "upload", "download", "search"
  color = "primary",
  backdrop = false,
  progress = null, // For progress-based loading
  showProgress = false,
}) => {
  const theme = useTheme();
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (
      variant === "job-extract" ||
      variant === "resume-analyze" ||
      variant === "resume-generate"
    ) {
      const interval = setInterval(() => {
        setDots((prev) => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [variant]);

  useEffect(() => {
    if (variant === "upload" || variant === "download") {
      const interval = setInterval(() => {
        // Pulse animation for upload/download
      }, 800);
      return () => clearInterval(interval);
    }
  }, [variant]);

  const getContainerStyles = () => {
    switch (variant) {
      case "page":
        return {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: backdrop
            ? alpha(theme.palette.background.default, 0.95)
            : "background.default",
          zIndex: theme.zIndex.modal + MODAL_Z_INDEX,
          backdropFilter: backdrop ? "blur(4px)" : "none",
          overflow: "hidden",
        };
      case "inline":
        return {
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 1,
        };
      default:
        return {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          bgcolor: alpha(theme.palette.background.default, 0.9),
          zIndex: MODAL_Z_INDEX,
          backdropFilter: "blur(2px)",
        };
    }
  };

  const getMessageStyles = () => {
    switch (variant) {
      case "inline":
        return {
          variant: "body2",
          color: "text.secondary",
        };
      default:
        return {
          variant: "h6",
          color: "text.secondary",
          sx: { fontWeight: 500 },
        };
    }
  };

  const getAnimationForVariant = () => {
    switch (variant) {
      case "job-extract":
        return (
          <Box sx={{ position: "relative", mb: 3 }}>
            <Box
              sx={{
                width: 120,
                height: 80,
                bgcolor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: 3,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
              {/* Animated job details extraction */}
              <Box
                sx={{
                  position: "absolute",
                  left: 20,
                  top: 15,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Company{"".padEnd(dots, ".")}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: 20,
                  top: 35,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Title{"".padEnd(dots, ".")}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: 20,
                  top: 55,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Salary{"".padEnd(dots, ".")}
              </Box>
              {/* Scanning line */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: 2,
                  bgcolor: "primary.main",
                  opacity: 0.6,
                  transform: `translateY(${15 + dots * 20}px)`,
                  transition: "transform 0.5s ease",
                }}
              />
            </Box>
          </Box>
        );

      case "resume-analyze":
        return (
          <Box sx={{ position: "relative", mb: 3 }}>
            <Box
              sx={{
                width: 140,
                height: 100,
                bgcolor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: 3,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
              {/* Resume analysis animation */}
              <Box
                sx={{
                  position: "absolute",
                  left: 15,
                  top: 15,
                  fontSize: 10,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Skills Match{"".padEnd(dots, ".")}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: 15,
                  top: 35,
                  fontSize: 10,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Keywords{"".padEnd(dots, ".")}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: 15,
                  top: 55,
                  fontSize: 10,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Experience{"".padEnd(dots, ".")}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: 15,
                  top: 75,
                  fontSize: 10,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Score{"".padEnd(dots, ".")}
              </Box>
              {/* Analysis progress bar */}
              <Box
                sx={{
                  position: "absolute",
                  right: 15,
                  top: 50,
                  width: 4,
                  height: 40,
                  bgcolor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                }}>
                <Box
                  sx={{
                    width: "100%",
                    height: `${(dots / 4) * 100}%`,
                    bgcolor: "primary.main",
                    transition: "height 0.5s ease",
                  }}
                />
              </Box>
            </Box>
          </Box>
        );

      case "resume-generate":
        return (
          <Box sx={{ position: "relative", mb: 3 }}>
            <Box
              sx={{
                width: 120,
                height: 80,
                bgcolor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: 3,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
              {/* Document generation animation */}
              <Box
                sx={{
                  position: "absolute",
                  left: 20,
                  top: 20,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Formatting{"".padEnd(dots, ".")}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: 20,
                  top: 40,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Optimizing{"".padEnd(dots, ".")}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: 20,
                  top: 60,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                Finalizing{"".padEnd(dots, ".")}
              </Box>
              {/* Document icon */}
              <DescriptionIcon
                sx={{
                  position: "absolute",
                  right: 15,
                  top: 20,
                  fontSize: 30,
                  color: "primary.main",
                  opacity: 0.8,
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.4, transform: "scale(0.9)" },
                    "50%": { opacity: 0.8, transform: "scale(1.1)" },
                    "100%": { opacity: 0.4, transform: "scale(0.9)" },
                  },
                }}
              />
            </Box>
          </Box>
        );

      case "upload":
        return (
          <Box sx={{ position: "relative", mb: 3 }}>
            <Box
              sx={{
                width: 100,
                height: 60,
                bgcolor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                border: `2px dashed ${theme.palette.primary.main}`,
                borderRadius: 2,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "uploadPulse 1.5s ease-in-out infinite",
                "@keyframes uploadPulse": {
                  "0%": {
                    borderColor: theme.palette.primary.main,
                    opacity: 0.6,
                  },
                  "50%": {
                    borderColor: theme.palette.primary.dark,
                    opacity: 1,
                  },
                  "100%": {
                    borderColor: theme.palette.primary.main,
                    opacity: 0.6,
                  },
                },
              }}>
              <UploadIcon
                sx={{
                  fontSize: 24,
                  color: "primary.main",
                  animation: "uploadMove 1.5s ease-in-out infinite",
                  "@keyframes uploadMove": {
                    "0%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-5px)" },
                    "100%": { transform: "translateY(0px)" },
                  },
                }}
              />
            </Box>
          </Box>
        );

      case "download":
        return (
          <Box sx={{ position: "relative", mb: 3 }}>
            <Box
              sx={{
                width: 100,
                height: 60,
                bgcolor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 2,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <DownloadIcon
                sx={{
                  fontSize: 24,
                  color: "primary.main",
                  animation: "downloadMove 1.5s ease-in-out infinite",
                  "@keyframes downloadMove": {
                    "0%": { transform: "translateY(-5px)" },
                    "50%": { transform: "translateY(0px)" },
                    "100%": { transform: "translateY(-5px)" },
                  },
                }}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Progress-based loading
  if (showProgress && progress !== null) {
    return (
      <Box sx={getContainerStyles()}>
        <Box sx={{ width: 300, mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{ mt: 1, textAlign: "center", color: "text.secondary" }}>
            {progress}% Complete
          </Typography>
        </Box>
        <Typography {...getMessageStyles()}>{message}</Typography>
        {subMessage && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: "center", opacity: 0.8 }}>
            {subMessage}
          </Typography>
        )}
      </Box>
    );
  }

  // Job-specific loading variants
  if (
    variant === "job-extract" ||
    variant === "resume-analyze" ||
    variant === "resume-generate" ||
    variant === "upload" ||
    variant === "download"
  ) {
    return (
      <Box sx={getContainerStyles()}>
        {getAnimationForVariant()}
        <Typography {...getMessageStyles()} sx={{ mb: 1 }}>
          {message}
        </Typography>
        {subMessage && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              opacity: 0.8,
              maxWidth: CARD_MAX_WIDTH,
              textAlign: "center",
            }}>
            {subMessage}
          </Typography>
        )}
      </Box>
    );
  }

  // Inline loading
  if (variant === "inline") {
    return (
      <Box sx={getContainerStyles()}>
        <CircularProgress size={size} color={color} />
        <Typography {...getMessageStyles()}>{message}</Typography>
      </Box>
    );
  }

  // Default loading
  return (
    <Box sx={getContainerStyles()}>
      <CircularProgress
        size={size}
        color={color}
        sx={{ mb: variant === "page" ? 4 : 3 }}
      />
      <Typography
        {...getMessageStyles()}
        sx={{
          ...getMessageStyles().sx,
          mb: subMessage ? 1 : 0,
        }}>
        {message}
      </Typography>
      {subMessage && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            opacity: 0.8,
            maxWidth: CARD_MAX_WIDTH,
            textAlign: "center",
          }}>
          {subMessage}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
