import React from "react";
import { Button, CircularProgress } from "@mui/material";

const PrimaryButton = ({
  children,
  loading = false,
  disabled = false,
  size = "large",
  variant = "contained",
  color = "primary",
  startIcon,
  endIcon,
  onClick,
  fullWidth = false,
  sx = {},
  loadingText,
  icon, // Optional icon prop for compatibility
  ...props
}) => {
  const buttonStyles = {
    fontWeight: 600,

    borderRadius: 2,
    fontSize: "0.875rem",
    py: 2,
    px: 2,
    margin: "0 0 16px 0",
    boxShadow: variant === "contained" ? 3 : 0,
    border: "none",
    outline: "none",
    "&:hover": {
      ...(variant === "contained" && {
        boxShadow: 6,
        transform: "translateY(-1px)",
      }),
    },
    "&:active": {
      transform: "scale(0.98)",
      boxShadow: variant === "contained" ? 2 : 0,
    },
    "&:focus": {
      outline: "none",
      boxShadow: variant === "contained" ? 3 : 0,
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: variant === "contained" ? 3 : 0,
    },
    transition: "all 0.2s ease-in-out",
    ...sx,
  };

  // Use icon prop if provided, otherwise use startIcon
  const displayStartIcon = loading ? (
    <CircularProgress size={20} color="inherit" />
  ) : (
    icon || startIcon
  );

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      startIcon={displayStartIcon}
      endIcon={endIcon}
      onClick={onClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      sx={buttonStyles}
      {...props}>
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};

export default PrimaryButton;
