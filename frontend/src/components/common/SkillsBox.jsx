import React from "react";
import { Box, Typography, Chip, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const SkillsBox = ({
  title,
  skills = [],
  icon: Icon,
  color = "primary",
  variant = "filled",
  size = "medium",
  onSkillClick,
  sx = {},
  maxDisplay,
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

  const displaySkills = maxDisplay ? skills.slice(0, maxDisplay) : skills;
  const remainingCount =
    maxDisplay && skills.length > maxDisplay ? skills.length - maxDisplay : 0;

  return (
    <Paper
      sx={{
        p: 3,
        border: `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
      {...props}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {Icon && (
          <Icon
            sx={{
              fontSize: 24,
              color: getColor(color),
              mr: 1,
            }}
          />
        )}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "text.primary",
          }}>
          {title}
        </Typography>
      </Box>

      {/* Skills */}
      {skills.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {displaySkills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              variant={variant}
              size={size}
              color={color}
              onClick={onSkillClick ? () => onSkillClick(skill) : undefined}
              sx={{
                cursor: onSkillClick ? "pointer" : "default",
                "&:hover": onSkillClick
                  ? {
                      transform: "scale(1.05)",
                    }
                  : {},
              }}
            />
          ))}
          {remainingCount > 0 && (
            <Chip
              label={`+${remainingCount} more`}
              variant="outlined"
              size={size}
              sx={{
                color: "text.secondary",
                borderColor: "text.secondary",
              }}
            />
          )}
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontStyle: "italic",
          }}>
          No {title.toLowerCase()} available
        </Typography>
      )}
    </Paper>
  );
};

export default SkillsBox;
