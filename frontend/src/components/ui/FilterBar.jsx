// src/components/ui/FilterBar.jsx
// The "Filters" button with its panel (in the top bar). Filters apply as soon as you pick them.
// On small screens the panel opens as a centered pop-up and the button shows only the icon.

import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import Select from "./Select";
import {
  colors,
  radius,
  shadows,
  spacing,
  fontSizes,
  fontWeights,
} from "../../styles/theme";

const NARROW_QUERY = "(max-width: 640px)";

const styles = {
  anchor: { position: "relative", flexShrink: 0 },
  count: {
    minWidth: 20,
    height: 20,
    padding: "0 6px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    color: colors.textOnPrimary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  popover: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: 320,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    boxShadow: shadows.lg,
    zIndex: 150,
  },
  popoverHeader: {
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderBottom: `1px solid ${colors.border}`,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  fields: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    padding: spacing.lg,
    maxHeight: 360,
    overflowY: "auto",
  },
  popoverFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderTop: `1px solid ${colors.border}`,
  },
};

function useIsNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(NARROW_QUERY);
    function handleChange(event) {
      setNarrow(event.matches);
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return narrow;
}

export default function FilterBar({ filters = [], values = {}, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const narrow = useIsNarrow();

  const count = filters.filter((filter) => values[filter.key]).length;

  // Close the dropdown with Escape or by clicking elsewhere
  // (the narrow-screen pop-up handles its own closing)
  useEffect(() => {
    if (!open || narrow) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, narrow]);

  if (filters.length === 0) return null;

  const fields = (
    <div
      style={
        narrow ? { display: "flex", flexDirection: "column", gap: spacing.lg } : styles.fields
      }
    >
      {filters.map((filter) => (
        <Select
          key={filter.key}
          label={filter.label}
          placeholder="All"
          options={filter.options}
          value={values[filter.key] || ""}
          onChange={(event) => onChange(filter.key, event.target.value)}
        />
      ))}
    </div>
  );

  return (
    <>
      <div ref={wrapperRef} style={styles.anchor}>
        <Button
          variant="secondary"
          aria-label="Filters"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          style={count > 0 ? { borderColor: colors.primary } : undefined}
        >
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
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          {!narrow && "Filters"}
          {count > 0 && <span style={styles.count}>{count}</span>}
        </Button>

        {open && !narrow && (
          <div role="dialog" aria-label="Filters" style={styles.popover}>
            <div style={styles.popoverHeader}>Filters</div>
            {fields}
            <div style={styles.popoverFooter}>
              <Button variant="ghost" size="sm" disabled={count === 0} onClick={onClear}>
                Clear all
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      {narrow && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Filters"
          width={420}
          footer={
            <>
              <Button variant="ghost" disabled={count === 0} onClick={onClear}>
                Clear all
              </Button>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </>
          }
        >
          {fields}
        </Modal>
      )}
    </>
  );
}