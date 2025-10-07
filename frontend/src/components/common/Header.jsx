import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  alpha,
  useTheme,
  Divider,
  ListItemText,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Work as WorkIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme as useAppTheme } from "../../contexts/ThemeContext";
import { getTypographyProps } from "../../utils/typography";

const Header = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    handleMenuClose();
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.primary.light} 100%)`,
          flexShrink: 0,
          boxShadow: theme.shadows[4],
        }}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: "72px !important",
            px: { xs: 2, sm: 3 },
            width: "100%",
          }}>
          {/* Left side - App branding */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minWidth: 0,
            }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.common.white, 0.2),
                backdropFilter: "blur(10px)",
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.common.black,
                  0.15
                )}`,
              }}>
              <WorkIcon sx={{ color: "primary.contrastText", fontSize: 24 }} />
            </Box>
            <Typography
              {...getTypographyProps("large", {
                component: "h1",
                sx: {
                  color: "primary.contrastText",
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.5rem" },
                  letterSpacing: "-0.025em",
                  textShadow: `0 2px 4px ${alpha(
                    theme.palette.common.black,
                    0.3
                  )}`,
                },
              })}>
              Job Tracker
            </Typography>
          </Box>

          {/* Right side - User section */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            {user && (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    color: "primary.contrastText",
                    display: { xs: "none", sm: "block" },
                    mr: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 200,
                    textShadow: `0 1px 2px ${alpha(
                      theme.palette.common.black,
                      0.3
                    )}`,
                  }}>
                  {user.name || user.email}
                </Typography>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      p: 0,
                      border: `2px solid ${alpha(
                        theme.palette.common.white,
                        0.3
                      )}`,
                      borderRadius: "50%",
                      transition: "all 0.2s ease-in-out",
                      flexShrink: 0,
                      boxShadow: `0 4px 12px ${alpha(
                        theme.palette.common.black,
                        0.2
                      )}`,
                      "&:hover": {
                        borderColor: alpha(theme.palette.common.white, 0.5),
                        transform: "scale(1.05)",
                        boxShadow: `0 6px 16px ${alpha(
                          theme.palette.common.black,
                          0.3
                        )}`,
                      },
                    }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: alpha(theme.palette.common.white, 0.15),
                        color: "primary.contrastText",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                      src={user.picture}>
                      {!user.picture && <AccountCircleIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {/* User menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            sx={{
              "& .MuiPaper-root": {
                bgcolor: "background.paper",
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
                mt: 1,
                minWidth: 250,
              },
            }}>
            {/* User Email - Non-clickable */}
            <MenuItem disabled sx={{ opacity: 1, cursor: "default" }}>
              <EmailIcon sx={{ mr: 1, fontSize: 20, color: "primary.main" }} />
              <ListItemText
                primary={user?.email}
                secondary="Signed in as"
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: "0.75rem",
                  },
                }}
              />
            </MenuItem>

            <Divider />

            {/* Dark Mode Toggle */}
            <MenuItem onClick={handleThemeToggle}>
              {isDarkMode ? (
                <LightModeIcon sx={{ mr: 1, fontSize: 20 }} />
              ) : (
                <DarkModeIcon sx={{ mr: 1, fontSize: 20 }} />
              )}
              <Typography variant="body2">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </Typography>
            </MenuItem>

            {/* Logout */}
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
