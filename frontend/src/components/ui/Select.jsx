// src/components/ui/Select.jsx
// <Select label="Status" options={[{ value: "lead", label: "Lead" }]} value={...} onChange={...} />
// options can also be plain strings: ["Website", "Referral"]

import { useId } from "react";
import { colors, radius, fontSizes, fontWeights } from "../../styles/theme";

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: 6, width: "100%" },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  field: {
    width: "100%",
    padding: "9px 12px",
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: radius.md,
  },
  fieldError: { borderColor: colors.danger },
  error: { fontSize: fontSizes.xs, color: colors.danger },
};

export default function Select({ label, options = [], placeholder, error, style, ...rest }) {
  const id = useId();

  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );

  return (
    <div style={styles.wrapper}>
      {label && (
        <label htmlFor={id} style={styles.label}>
          {label}
        </label>
      )}
      <select
        id={id}
        style={{ ...styles.field, ...(error ? styles.fieldError : {}), ...style }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {normalized.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}