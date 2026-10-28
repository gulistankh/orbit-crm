// src/components/ui/Toast.jsx
// A small message in the corner. Shows server errors (and could show successes).

import { colors, radius, shadows, fontSizes, fontWeights } from "../../styles/theme";

const tones = {
  error: { bg: colors.dangerSoft, text: "#B91C1C", border: "#FCA5A5" },
  success: { bg: colors.successSoft, text: "#15803D", border: "#86EFAC" },
};

export default function Toast({ message, tone = "error", onClose }) {
  const color = tones[tone] || tones.error;

  const style = {
    position: "fixed",
    bottom: 24,
    right: 16,
    left: 16,
    marginLeft: "auto",
    maxWidth: 380,
    zIndex: 1100,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 14px",
    backgroundColor: color.bg,
    color: color.text,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    boxShadow: shadows.md,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 1.45,
  };

  return (
    <div role="alert" style={style}>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        style={{
          border: "none",
          background: "transparent",
          color: "inherit",
          fontSize: 18,
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}