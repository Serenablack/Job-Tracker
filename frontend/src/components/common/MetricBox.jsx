import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const MetricBox = ({
  title,
  value,
  icon: Icon,
  color = "primary",
  subtitle,
  onClick,
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

  const boxStyles = {
    p: 1.5,
    textAlign: "center",
    cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s ease-in-out",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 1,
    bgcolor: "background.paper",
    "&:hover": onClick
      ? {
          transform: "translateY(-1px)",
          boxShadow: 1,
          borderColor: getColor(color),
        }
      : {},
    ...sx,
  };

  return (
    <Box sx={boxStyles} onClick={onClick} {...props}>
      {Icon && (
        <Box sx={{ mb: 1 }}>
          <Icon
            sx={{
              fontSize: 28,
              color: getColor(color),
            }}
          />
        </Box>
      )}

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: getColor(color),
          mb: 0.5,
          fontSize: "1.4rem",
        }}>
        {value}
      </Typography>

      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          mb: subtitle ? 0.5 : 0,
          fontSize: "0.85rem",
        }}>
        {title}
      </Typography>

      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "0.7rem",
          }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default MetricBox;
