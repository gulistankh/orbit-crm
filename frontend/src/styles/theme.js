// src/styles/theme.js
// One place for every color, size and shadow used in the app.
// Other files import this and use it inside their style objects.

export const colors = {
  // brand
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primarySoft: "#EEF2FF",

  // neutrals
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",

  // text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textOnPrimary: "#FFFFFF",

  // status
  success: "#16A34A",
  successSoft: "#DCFCE7",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  info: "#0284C7",
  infoSoft: "#E0F2FE",
};

// Pipeline stages for the kanban board (used by deals)
export const stageColors = {
  lead: { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  contacted: { bg: "#E0F2FE", text: "#0369A1", dot: "#0284C7" },
  proposal: { bg: "#EEF2FF", text: "#4338CA", dot: "#4F46E5" },
  negotiation: { bg: "#FEF3C7", text: "#B45309", dot: "#D97706" },
  won: { bg: "#DCFCE7", text: "#15803D", dot: "#16A34A" },
  lost: { bg: "#FEE2E2", text: "#B91C1C", dot: "#DC2626" },
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
  sm: 6,
  md: 8,
  lg: 12,
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
  sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
  md: "0 4px 12px rgba(15, 23, 42, 0.08)",
  lg: "0 12px 32px rgba(15, 23, 42, 0.14)",
};

export const layout = {
  sidebarWidth: 240,
  topbarHeight: 60,
  contentMaxWidth: 1280,
};

export const fontFamily =
  "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

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
};