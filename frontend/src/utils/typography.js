// Typography utility constants for consistent font sizing
export const fontSizes = {
  large: {
    fontSize: "1.5rem", // 24px
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "-0.025em",
  },
  medium: {
    fontSize: "1rem", // 16px
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: "0.01em",
  },
  small: {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "0.01em",
  },
  subtitle: {
    fontSize: "1.125rem", // 18px
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: "-0.01em",
  },
};

// Typography variant mapping for Material-UI components
export const typographyVariants = {
  large: "h3", // Maps to h3 for large text
  medium: "body1", // Maps to body1 for medium text
  small: "body2", // Maps to body2 for small text
  subtitle: "subtitle1", // Maps to subtitle1 for subtitle text
};

// Helper function to get typography props
export const getTypographyProps = (size, options = {}) => {
  // Validate size parameter and provide fallback
  const validSizes = ["large", "medium", "small", "subtitle"];
  const validSize = validSizes.includes(size) ? size : "medium";

  const baseProps = {
    variant: typographyVariants[validSize] || "body1",
    sx: {
      ...fontSizes[validSize],
      fontFamily:
        validSize === "large" || validSize === "subtitle"
          ? "'Inter', sans-serif"
          : "'Roboto', sans-serif",
      ...options.sx,
    },
    ...options,
  };

  return baseProps;
};

// Custom typography component variants
export const customTypography = {
  // Large text for headings and important content
  large: {
    component: "h2",
    variant: "h3",
    sx: {
      ...fontSizes.large,
      fontFamily: "'Inter', sans-serif",
    },
  },

  // Medium text for body content
  medium: {
    component: "p",
    variant: "body1",
    sx: {
      ...fontSizes.medium,
      fontFamily: "'Roboto', sans-serif",
    },
  },

  // Small text for captions and secondary content
  small: {
    component: "p",
    variant: "body2",
    sx: {
      ...fontSizes.small,
      fontFamily: "'Roboto', sans-serif",
    },
  },

  // Subtitle text for section headers
  subtitle: {
    component: "h3",
    variant: "subtitle1",
    sx: {
      ...fontSizes.subtitle,
      fontFamily: "'Inter', sans-serif",
    },
  },
};

// Utility function to apply responsive typography
export const responsiveTypography = (size, breakpoints = {}) => {
  const baseSize = fontSizes[size];

  return {
    ...baseSize,
    fontSize: {
      xs: breakpoints.xs || baseSize.fontSize,
      sm: breakpoints.sm || baseSize.fontSize,
      md: breakpoints.md || baseSize.fontSize,
      lg: breakpoints.lg || baseSize.fontSize,
      xl: breakpoints.xl || baseSize.fontSize,
    },
  };
};

// Export default typography configuration
export default {
  fontSizes,
  typographyVariants,
  getTypographyProps,
  customTypography,
  responsiveTypography,
};
