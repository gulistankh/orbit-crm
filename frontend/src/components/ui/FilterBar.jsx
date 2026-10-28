// src/components/ui/FilterBar.jsx
// <FilterBar
//   filters={[{ key: "status", label: "Status", options: [{ value: "lead", label: "Lead" }] }]}
//   values={{ status: "" }}
//   onChange={(key, value) => ...}
//   onClear={() => ...}
// />

import Select from "./Select";
import Button from "./Button";
import { spacing } from "../../styles/theme";

const styles = {
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  item: { flex: "0 1 180px", minWidth: 150 },
};

export default function FilterBar({ filters = [], values = {}, onChange, onClear }) {
  const anyActive = filters.some((filter) => values[filter.key]);

  return (
    <div style={styles.row}>
      {filters.map((filter) => (
        <div key={filter.key} style={styles.item}>
          <Select
            aria-label={filter.label}
            placeholder={`${filter.label}: All`}
            options={filter.options}
            value={values[filter.key] || ""}
            onChange={(event) => onChange(filter.key, event.target.value)}
          />
        </div>
      ))}
      {anyActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}