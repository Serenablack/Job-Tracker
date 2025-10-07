import { createTheme } from "@mui/material/styles";

// Design System Constants - Extension Optimized with Responsive Units
export const SPACING = {
  xs: 0.25, // 2px at base, scales with zoom
  sm: 0.5, // 4px at base, scales with zoom
  md: 0.75, // 6px at base, scales with zoom
  lg: 1, // 8px at base, scales with zoom
  xl: 1.5, // 12px at base, scales with zoom
  xxl: 2, // 16px at base, scales with zoom
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const SHADOWS = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
};

// Colors from index.css
const CSS_COLORS = {
  primary: "#646cff", // From index.css :root
  primaryHover: "#535bf2", // From index.css a:hover
  primaryLight: "#747bff", // From index.css light mode a:hover
  scrollbarThumb: "rgba(147, 112, 219, 0.3)", // From index.css --scrollbar-thumb
  scrollbarThumbHover: "rgba(147, 112, 219, 0.5)", // From index.css --scrollbar-thumb-hover
  scrollbarThumbActive: "rgba(147, 112, 219, 0.7)", // From index.css --scrollbar-thumb-active
  scrollbarTrack: "rgba(255, 255, 255, 0.1)", // From index.css --scrollbar-track
};

export const createAppTheme = (isDarkMode = false) =>
  createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: CSS_COLORS.primary, // #646cff from index.css
        dark: CSS_COLORS.primaryHover, // #535bf2 from index.css
        light: CSS_COLORS.primaryLight, // #747bff from index.css light mode
        contrastText: "#ffffff",
      },
      secondary: {
        main: CSS_COLORS.scrollbarThumb, // Using scrollbar color as secondary
        dark: CSS_COLORS.scrollbarThumbActive,
        light: CSS_COLORS.scrollbarThumbHover,
        contrastText: "#ffffff",
      },
      background: {
        default: isDarkMode ? "#0F0F23" : "#FEFEFE", // Clean background
        paper: isDarkMode ? "#1A1A2E" : "#ffffff",
      },
      text: {
        primary: isDarkMode ? "#E2E8F0" : "#213547", // From index.css light mode
        secondary: isDarkMode ? "#94A3B8" : "#6B7280", // Gray text
      },
      divider: isDarkMode
        ? "rgba(255, 255, 255, 0.12)"
        : `rgba(100, 108, 255, 0.12)`, // Using primary color for divider
    },
    typography: {
      fontFamily:
        "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

      // Extension-optimized typography scale with responsive sizing
      h1: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", // Responsive sizing
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.025em",
        marginBottom: SPACING.lg,
      },
      h2: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "clamp(0.8rem, 2.2vw, 1rem)", // Responsive sizing
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: "-0.025em",
        marginBottom: SPACING.md,
      },
      h3: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.85rem", // Extra compact for extensions
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.025em",
        marginBottom: SPACING.md,
      },
      h4: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.8rem", // Extra compact for extensions
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "-0.015em",
        marginBottom: SPACING.sm,
      },
      h5: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.75rem", // Extra compact for extensions
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "-0.015em",
        marginBottom: SPACING.sm,
      },
      h6: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.7rem", // Extra compact for extensions
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: "-0.01em",
        marginBottom: SPACING.sm,
      },
      subtitle1: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.75rem", // Extra compact for extensions
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: "-0.01em",
        marginBottom: SPACING.sm,
      },
      subtitle2: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.7rem", // Extra compact for extensions
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: "-0.01em",
        marginBottom: SPACING.sm,
      },
      body1: {
        fontFamily: "'Roboto', sans-serif",
        fontSize: "clamp(0.7rem, 1.8vw, 0.85rem)", // Responsive sizing
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0.01em",
        marginBottom: SPACING.sm,
      },
      body2: {
        fontFamily: "'Roboto', sans-serif",
        fontSize: "0.7rem", // Extra compact for extensions
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: "0.01em",
        marginBottom: SPACING.xs,
      },
      button: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.7rem", // Extra compact for extensions
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: "0.025em",
        textTransform: "none",
      },
      caption: {
        fontFamily: "'Roboto', sans-serif",
        fontSize: "0.65rem", // Extra compact for extensions
        fontWeight: 400,
        lineHeight: 1.3,
        letterSpacing: "0.03em",
        marginBottom: SPACING.xs,
      },
      overline: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.65rem", // Extra compact for extensions
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: SPACING.xs,
      },
    },
    spacing: (factor) => `${factor * 8}px`,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: BORDER_RADIUS.sm,
            fontWeight: 500,
            padding: "4px 8px", // Extension-optimized compact padding
            boxShadow: SHADOWS.sm,
            transition: "all 0.2s ease-in-out",
            border: "none",
            minHeight: "28px", // Compact button height
            "&:hover": {
              boxShadow: SHADOWS.md,
              transform: "scale(1.02)",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          sizeSmall: {
            fontSize: "0.65rem", // Extra compact for extensions
            padding: "2px 6px", // Extra compact padding
            minHeight: "24px",
          },
          sizeMedium: {
            fontSize: "0.7rem", // Extra compact for extensions
            padding: "4px 8px", // Compact padding
            minHeight: "28px",
          },
          sizeLarge: {
            fontSize: "0.75rem", // Extra compact for extensions
            padding: "6px 12px", // Slightly larger but still compact
            minHeight: "32px",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: BORDER_RADIUS.sm,
              fontSize: "0.7rem", // Extra compact for extensions
              padding: "4px 8px", // Compact padding
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.7rem", // Extra compact for extensions
            },
            "& .MuiFormHelperText-root": {
              fontSize: "0.65rem", // Extra compact for extensions
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: BORDER_RADIUS.lg,
            boxShadow: SHADOWS.sm,
            "&:hover": {
              boxShadow: SHADOWS.md,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: BORDER_RADIUS.md,
            boxShadow: SHADOWS.sm,
          },
        },
      },
      MuiBox: {
        styleOverrides: {
          root: {
            // Compact spacing for Box components
            "&.MuiBox-root": {
              "& > * + *": {
                marginTop: SPACING.sm,
              },
            },
          },
        },
      },
      // Global component overrides for extension optimization
      MuiList: {
        styleOverrides: {
          root: {
            padding: SPACING.xs,
          },
          dense: {
            padding: 0,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            paddingTop: SPACING.xs,
            paddingBottom: SPACING.xs,
            minHeight: "auto",
          },
          dense: {
            paddingTop: SPACING.xs / 2,
            paddingBottom: SPACING.xs / 2,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: "20px",
            marginRight: SPACING.sm,
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: {
            marginTop: 0,
            marginBottom: 0,
          },
          primary: {
            fontSize: "0.7rem",
            lineHeight: 1.3,
          },
          secondary: {
            fontSize: "0.65rem",
            lineHeight: 1.2,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: BORDER_RADIUS.md,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: `${SPACING.lg}px ${SPACING.lg}px ${SPACING.sm}px`,
            fontSize: "0.8rem",
            fontWeight: 600,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: SPACING.lg,
            fontSize: "0.7rem",
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: `${SPACING.sm}px ${SPACING.lg}px ${SPACING.lg}px`,
            gap: SPACING.sm,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            // Remove default margins for tighter spacing
            "&.MuiTypography-h1, &.MuiTypography-h2, &.MuiTypography-h3, &.MuiTypography-h4, &.MuiTypography-h5, &.MuiTypography-h6":
              {
                marginBottom: SPACING.sm,
              },
            "&.MuiTypography-body1, &.MuiTypography-body2": {
              marginBottom: SPACING.xs,
            },
            "&.MuiTypography-caption": {
              marginBottom: SPACING.xs / 2,
            },
          },
        },
      },
      MuiIcon: {
        styleOverrides: {
          root: {
            // Smaller default icon sizes for extensions
            fontSize: "1rem",
          },
          fontSizeSmall: {
            fontSize: "0.75rem",
          },
          fontSizeLarge: {
            fontSize: "1.25rem",
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            // Smaller default icon sizes for extensions
            fontSize: "1rem",
          },
          fontSizeSmall: {
            fontSize: "0.75rem",
          },
          fontSizeLarge: {
            fontSize: "1.25rem",
          },
        },
      },
    },
  });

export default createAppTheme;
