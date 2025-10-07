import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ProgressBox = ({
  title,
  score,
  maxScore = 100,
  icon: Icon,
  color = "primary",
  variant = "linear", // "linear" or "circular"
  height = 8,
  size = 60,
  subtitle,
  showPercentage = true,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  const getColor = (colorName) => {
    if (colorName === "primary") return theme.palette.primary.main;
    if (colorName === "secondary") return theme.palette.secondary.main;
    if (colorName === "success") return theme.palette.success.main;
    if (colorName === "warning") return theme.palette.warning.main;
    if (colorName === "error") return theme.palette.error.main;
    return colorName;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const percentage = Math.round((score / maxScore) * 100);
  const scoreColor = getScoreColor(percentage);

  return (
    <Box
      sx={{
        p: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        bgcolor: "background.paper",
        ...sx,
      }}
      {...props}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        {Icon && (
          <Icon
            sx={{
              fontSize: 20,
              color: getColor(color),
              mr: 1,
            }}
          />
        )}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            fontSize: "0.9rem",
          }}>
          {title}
        </Typography>
      </Box>

      {/* Progress Display */}
      {variant === "circular" ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
          }}>
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              variant="determinate"
              value={percentage}
              size={Math.min(size, 80)}
              thickness={4}
              sx={{
                color: scoreColor,
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: scoreColor,
                  fontSize: "0.9rem",
                }}>
                {showPercentage ? `${percentage}%` : score}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}>
              Score
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: scoreColor,
              }}>
              {showPercentage ? `${percentage}%` : `${score}/${maxScore}`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: height,
              borderRadius: height / 2,
              backgroundColor: theme.palette.grey[200],
              "& .MuiLinearProgress-bar": {
                backgroundColor: scoreColor,
                borderRadius: height / 2,
              },
            }}
          />
        </Box>
      )}

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            textAlign: "center",
          }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default ProgressBox;
