import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ContentCard = ({
  title,
  subtitle,
  children,
  icon: Icon,
  color = "primary",
  variant = "outlined", // "outlined", "elevation"
  sx = {},
  elevation = 1,
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
    ...(variant === "outlined" && {
      border: `1px solid ${theme.palette.divider}`,
    }),
    ...sx,
  };

  return (
    <Card
      sx={cardStyles}
      elevation={variant === "elevation" ? elevation : 0}
      variant={variant}
      {...props}>
      <CardContent>
        {/* Header */}
        {(title || Icon) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: children ? 2 : 0,
            }}>
            {Icon && (
              <Icon
                sx={{
                  fontSize: 24,
                  color: getColor(color),
                  mr: 1.5,
                }}
              />
            )}
            <Box>
              {title && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: subtitle ? 0.5 : 0,
                  }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Content */}
        {children}
      </CardContent>
    </Card>
  );
};

export default ContentCard;
