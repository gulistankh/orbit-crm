// src/styles/theme.js
// One place for every color, size and shadow used in the app.
// Palette: warm paper + deep teal. Change a value here and the whole app follows.

export const colors = {
  // brand
  primary: "#0F766E",
  primaryHover: "#115E59",
  primarySoft: "#E3F3F0",

  // surfaces and lines (warm neutrals)
  background: "#F6F4EF",
  surface: "#FFFFFF",
  surfaceMuted: "#FAF8F4",
  border: "#E8E3DA",
  borderStrong: "#D6CFC2",

  // text
  textPrimary: "#1C1917",
  textSecondary: "#57534E",
  textMuted: "#78716C",
  textOnPrimary: "#FFFFFF",

  // status
  success: "#15803D",
  successSoft: "#E1F3E6",
  warning: "#B45309",
  warningSoft: "#FDF0DC",
  danger: "#B91C1C",
  dangerSoft: "#FBE4E1",
  info: "#1D4ED8",
  infoSoft: "#E4EEFB",

  // sidebar (dark)
  sidebarBg: "#0F1F1D",
  sidebarBorder: "#1D3532",
  sidebarText: "#A9BDB9",
  sidebarTextActive: "#FFFFFF",
  sidebarActiveBg: "#1B3D39",
  sidebarHoverBg: "#162B29",
  sidebarAccent: "#5EEAD4",
};

// Pipeline stages for the kanban board (used by deals)
export const stageColors = {
  lead: { bg: "#EFECE6", text: "#57534E", dot: "#A8A29E" },
  contacted: { bg: "#E4EEFB", text: "#1D4ED8", dot: "#3B82F6" },
  proposal: { bg: "#EDE7FB", text: "#6D28D9", dot: "#8B5CF6" },
  negotiation: { bg: "#FDF0DC", text: "#B45309", dot: "#F59E0B" },
  won: { bg: "#E1F3E6", text: "#15803D", dot: "#22A55A" },
  lost: { bg: "#FBE4E1", text: "#B91C1C", dot: "#EF4444" },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  pill: 999,
};

export const fontSizes = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  title: 30,
};

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const shadows = {
  sm: "0 1px 2px rgba(28, 25, 23, 0.05)",
  md: "0 6px 16px rgba(28, 25, 23, 0.08)",
  lg: "0 18px 40px rgba(28, 25, 23, 0.16)",
};

export const layout = {
  sidebarWidth: 248,
  topbarHeight: 64,
  contentMaxWidth: 1280,
};

export const fontFamily =
  "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Handy shared style objects so we don't repeat ourselves
export const card = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.lg,
  boxShadow: shadows.sm,
};

export const pageTitle = {
  fontSize: fontSizes.xxl,
  fontWeight: fontWeights.bold,
  color: colors.textPrimary,
  margin: 0,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
}; 