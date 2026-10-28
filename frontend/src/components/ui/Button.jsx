// src/components/ui/Button.jsx
// <Button>Save</Button>
// <Button variant="secondary" size="sm" onClick={...}>Cancel</Button>
// variants: primary | secondary | danger | ghost

import { colors, radius, fontSizes, fontWeights, spacing } from "../../styles/theme";

const variants = {
  primary: {
    backgroundColor: colors.primary,
    color: colors.textOnPrimary,
    border: `1px solid ${colors.primary}`,
  },
  secondary: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
  },
  danger: {
    backgroundColor: colors.danger,
    color: "#FFFFFF",
    border: `1px solid ${colors.danger}`,
  },
  ghost: {
    backgroundColor: "transparent",
    color: colors.textSecondary,
    border: "1px solid transparent",
  },
};

const sizes = {
  sm: { padding: "6px 10px", fontSize: fontSizes.sm },
  md: { padding: "9px 14px", fontSize: fontSizes.md },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  fullWidth = false,
  style,
  ...rest
}) {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    fontWeight: fontWeights.medium,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    width: fullWidth ? "100%" : "auto",
    transition: "background-color 0.15s ease",
  };

  return (
    <button
      type={type}
      className={`btn-${variant}`}
      style={{ ...baseStyle, ...variants[variant], ...sizes[size], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}