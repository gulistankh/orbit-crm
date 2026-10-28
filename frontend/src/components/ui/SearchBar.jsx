// src/components/ui/SearchBar.jsx
// <SearchBar value={search} onChange={setSearch} placeholder="Search contacts..." />
// onChange receives the text itself, not the event.

import { colors, radius, fontSizes } from "../../styles/theme";

const styles = {
  wrapper: { position: "relative", width: "100%", maxWidth: 360 },
  icon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: colors.textMuted,
    pointerEvents: "none",
    display: "flex",
  },
  input: {
    width: "100%",
    padding: "9px 12px 9px 36px",
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: radius.md,
  },
};

export default function SearchBar({ value, onChange, placeholder = "Search...", style }) {
  return (
    <div style={{ ...styles.wrapper, ...style }}>
      <span style={styles.icon}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </div>
  );
}