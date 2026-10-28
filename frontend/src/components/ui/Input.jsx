// src/components/ui/Input.jsx
// <Input label="Email" value={...} onChange={...} error="Required" />
// <Input label="Note" multiline rows={4} ... />

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
  hint: { fontSize: fontSizes.xs, color: colors.textMuted },
};

export default function Input({
  label,
  error,
  hint,
  multiline = false,
  rows = 4,
  style,
  ...rest
}) {
  const id = useId();
  const Field = multiline ? "textarea" : "input";

  const fieldStyle = {
    ...styles.field,
    ...(multiline ? { resize: "vertical" } : {}),
    ...(error ? styles.fieldError : {}),
    ...style,
  };

  return (
    <div style={styles.wrapper}>
      {label && (
        <label htmlFor={id} style={styles.label}>
          {label}
        </label>
      )}
      <Field id={id} rows={multiline ? rows : undefined} style={fieldStyle} {...rest} />
      {error ? (
        <span style={styles.error}>{error}</span>
      ) : hint ? (
        <span style={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}