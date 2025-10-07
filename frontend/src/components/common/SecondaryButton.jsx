import React from "react";
import { Button, CircularProgress } from "@mui/material";

const SecondaryButton = ({
  children,
  loading = false,
  disabled = false,
  size = "large",
  variant = "outlined",
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
    borderWidth: 2,
    "&:hover": {
      borderWidth: 2,
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "scale(0.98)",
    },
    "&:focus": {
      outline: "none",
    },
    "&:focus-visible": {
      outline: "none",
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

export default SecondaryButton;
