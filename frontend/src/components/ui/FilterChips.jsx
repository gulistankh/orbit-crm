// src/components/ui/FilterChips.jsx
// The active filters as small removable chips, plus "Clear all".
// Shows nothing when no filter is active.

import Button from "./Button";
import { colors, radius, spacing, fontSizes, fontWeights } from "../../styles/theme";

const styles = {
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    maxWidth: 260,
    padding: "4px 6px 4px 12px",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  chipLabel: { opacity: 0.75, fontWeight: fontWeights.regular },
  chipValue: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chipRemove: {
    width: 20,
    height: 20,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "50%",
    backgroundColor: "transparent",
    color: "inherit",
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
  },
};

function optionLabel(filter, value) {
  const found = (filter.options || []).find((option) => String(option.value) === String(value));
  return found ? found.label : value;
}

export default function FilterChips({ filters = [], values = {}, onChange, onClear }) {
  const active = filters.filter((filter) => values[filter.key]);
  if (active.length === 0) return null;

  return (
    <div style={styles.row}>
      {active.map((filter) => (
        <span key={filter.key} style={styles.chip}>
          <span style={styles.chipLabel}>{filter.label}:</span>
          <span style={styles.chipValue}>{optionLabel(filter, values[filter.key])}</span>
          <button
            type="button"
            className="btn-ghost"
            aria-label={`Remove ${filter.label} filter`}
            style={styles.chipRemove}
            onClick={() => onChange(filter.key, "")}
          >
            ×
          </button>
        </span>
      ))}

      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear all
      </Button>
    </div>
  );
}