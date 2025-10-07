import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ActionCard = ({
  title,
  subtitle,
  description,
  icon: Icon,
  color = "primary",
  primaryAction,
  secondaryAction,
  onCardClick,
  disabled = false,
  sx = {},
  elevation = 1,
  children,
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

  const cardStyles = {
    cursor: onCardClick ? "pointer" : "default",
    transition: "all 0.2s ease-in-out",
    border: `1px solid ${theme.palette.divider}`,
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : "auto",
    "&:hover":
      onCardClick && !disabled
        ? {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[4],
            borderColor: getColor(color),
          }
        : {},
    ...sx,
  };

  return (
    <Card
      sx={cardStyles}
      elevation={elevation}
      onClick={onCardClick && !disabled ? onCardClick : undefined}
      {...props}>
      <CardContent sx={{ pb: primaryAction || secondaryAction ? 1 : 2 }}>
        {/* Header with Icon and Title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: subtitle || description ? 2 : 0,
          }}>
          {Icon && (
            <Box sx={{ mr: 2 }}>
              <Icon
                sx={{
                  fontSize: 32,
                  color: getColor(color),
                }}
              />
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: subtitle ? 0.5 : 0,
              }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="subtitle2"
                sx={{
                  color: getColor(color),
                  fontWeight: 500,
                }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Description */}
        {description && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.6,
              mb: children ? 2 : 0,
            }}>
            {description}
          </Typography>
        )}

        {/* Custom Content */}
        {children}
      </CardContent>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            {secondaryAction && (
              <Button
                variant="outlined"
                size="small"
                startIcon={secondaryAction.icon}
                onClick={secondaryAction.onClick}
                disabled={disabled || secondaryAction.disabled}
                sx={{ borderWidth: 2, "&:hover": { borderWidth: 2 } }}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant="contained"
                size="small"
                startIcon={primaryAction.icon}
                onClick={primaryAction.onClick}
                disabled={disabled || primaryAction.disabled}
                sx={{ ml: "auto" }}>
                {primaryAction.label}
              </Button>
            )}
          </Box>
        </CardActions>
      )}
    </Card>
  );
};

export default ActionCard;
