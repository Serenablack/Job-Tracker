import React from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Section = ({
  title,
  subtitle,
  children,
  icon: Icon,
  color = "primary",
  variant = "paper", // "paper", "outlined", "plain"
  spacing = 3,
  titleVariant = "h5",
  sx = {},
  headerSx = {},
  contentSx = {},
  showDivider = false,
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

  const containerProps = {
    sx: {
      p: spacing,
      ...(variant === "outlined" && {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
      }),
      ...sx,
    },
    ...props,
  };

  const renderHeader = () => (
    <Box sx={{ mb: spacing, ...headerSx }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: subtitle ? 1 : 0 }}>
        {Icon && (
          <Icon
            sx={{
              fontSize: 28,
              color: getColor(color),
              mr: 1.5,
            }}
          />
        )}
        <Typography
          variant={titleVariant}
          sx={{
            fontWeight: 600,
            color: "text.primary",
          }}>
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
            ml: Icon ? 5 : 0,
          }}>
          {subtitle}
        </Typography>
      )}
      {showDivider && <Divider sx={{ mt: 2 }} />}
    </Box>
  );

  const renderContent = () => <Box sx={{ ...contentSx }}>{children}</Box>;

  if (variant === "paper") {
    return (
      <Paper {...containerProps}>
        {title && renderHeader()}
        {renderContent()}
      </Paper>
    );
  }

  return (
    <Box {...containerProps}>
      {title && renderHeader()}
      {renderContent()}
    </Box>
  );
};

export default Section;
