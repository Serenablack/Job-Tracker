import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";

const ListBox = ({
  title,
  items = [],
  icon: Icon,
  color = "primary",
  itemIcon = CheckCircleIcon,
  onItemClick,
  sx = {},
  maxHeight,
  showDividers = false,
  dense = false,
  maxDisplay,
  emptyMessage = "No items to display",
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

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        bgcolor: "background.paper",
        ...sx,
      }}
      {...props}>
      {/* Header */}
      <Box sx={{ p: 1.5, pb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
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
      </Box>

      {/* List */}
      {items.length > 0 ? (
        <List
          dense={true}
          sx={{
            px: 1.5,
            pb: 1.5,
            pt: 0,
            maxHeight: maxHeight,
            overflow: maxHeight ? "auto" : "visible",
          }}>
          {(maxDisplay ? items.slice(0, maxDisplay) : items).map(
            (item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  button={!!onItemClick}
                  onClick={
                    onItemClick ? () => onItemClick(item, index) : undefined
                  }
                  sx={{
                    borderRadius: 1,
                    "&:hover": onItemClick
                      ? {
                          backgroundColor: theme.palette.action.hover,
                        }
                      : {},
                  }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {React.createElement(itemIcon, {
                      sx: {
                        fontSize: 16,
                        color: getColor(color),
                      },
                    })}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      typeof item === "string"
                        ? item
                        : item.primary || item.text
                    }
                    secondary={
                      typeof item === "object" ? item.secondary : undefined
                    }
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { fontWeight: 500, fontSize: "0.8rem" },
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      sx: { color: "text.secondary", fontSize: "0.7rem" },
                    }}
                  />
                </ListItem>
                {showDividers && index < items.length - 1 && (
                  <Divider sx={{ mx: 2 }} />
                )}
              </React.Fragment>
            )
          )}
        </List>
      ) : (
        <Box sx={{ p: 1.5, pt: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
              textAlign: "center",
            }}>
            {emptyMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ListBox;
