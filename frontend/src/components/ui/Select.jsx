// src/components/ui/Select.jsx
// A styled dropdown. Same props as before, so every place that uses it keeps working.
//   <Select label="Status" options={[{ value: "lead", label: "Lead" }]} value={...} onChange={...} />
//   options can also be plain strings: ["Website", "Referral"]
// Extra props:
//   size="sm"          smaller trigger (used on deal cards)
//   allowEmpty={false}  don't show the placeholder as a choice in the list
// onChange receives an object shaped like an event: onChange({ target: { value } })
// Keyboard: arrows move, Enter or Space picks, Esc closes, typing jumps to a match.

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { colors, radius, shadows, fontSizes, fontWeights } from "../../styles/theme";

const sizes = {
  md: { padding: "9px 12px", fontSize: fontSizes.md },
  sm: { padding: "5px 8px", fontSize: fontSizes.xs },
};

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: 6, width: "100%" },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: radius.md,
    color: colors.textPrimary,
    cursor: "pointer",
    userSelect: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  triggerError: { borderColor: colors.danger },
  triggerDisabled: { opacity: 0.55, cursor: "not-allowed" },
  value: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  placeholder: { color: colors.textMuted },
  chevron: { flexShrink: 0, color: colors.textMuted, transition: "transform 0.15s ease" },
  error: { fontSize: fontSizes.xs, color: colors.danger },
  list: {
    position: "fixed",
    zIndex: 1200,
    overflowY: "auto",
    padding: 4,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    boxShadow: shadows.lg,
  },
  option: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "8px 10px",
    borderRadius: radius.sm,
    cursor: "pointer",
    color: colors.textPrimary,
    fontSize: fontSizes.md,
  },
  optionActive: { backgroundColor: colors.primarySoft },
  optionSelected: { color: colors.primary, fontWeight: fontWeights.semibold },
  optionPlaceholder: { color: colors.textMuted },
};

export default function Select({
  label,
  options = [],
  placeholder,
  error,
  size = "md",
  allowEmpty = true,
  value = "",
  onChange,
  disabled = false,
  style,
  "aria-label": ariaLabel,
}) {
  const id = useId();
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typeBuffer = useRef({ text: "", timer: null });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(null);

  const current = value === null || value === undefined ? "" : String(value);

  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );
  const items =
    placeholder && allowEmpty
      ? [{ value: "", label: placeholder, isPlaceholder: true }, ...normalized]
      : normalized;
  const selectedItem = normalized.find((option) => String(option.value) === current);

  function openList() {
    if (disabled) return;

    // Work out where the list goes, and whether it should open upward
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
    const available = openUp ? spaceAbove : spaceBelow;
    const width = Math.max(rect.width, 170);

    setPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      width,
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      maxHeight: Math.max(120, Math.min(280, available - 6)),
    });

    const selectedIndex = items.findIndex((item) => String(item.value) === current);
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function choose(item) {
    if (onChange) onChange({ target: { value: item.value } });
    setOpen(false);
  }

  // While open: close on an outside click, on scrolling the page, or on resizing
  useEffect(() => {
    if (!open) return undefined;

    function handleMouseDown(event) {
      const inTrigger = triggerRef.current && triggerRef.current.contains(event.target);
      const inList = listRef.current && listRef.current.contains(event.target);
      if (!inTrigger && !inList) setOpen(false);
    }
    function handleScroll(event) {
      if (listRef.current && listRef.current.contains(event.target)) return;
      setOpen(false);
    }
    function handleResize() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  // Keep the highlighted option visible when moving with the arrow keys
  useEffect(() => {
    if (!open) return;
    const element = document.getElementById(`${id}-option-${active}`);
    if (element) element.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  function handleKeyDown(event) {
    if (disabled) return;
    const key = event.key;

    if (!open) {
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
        event.preventDefault();
        openList();
      }
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation(); // so a pop-up around this dropdown doesn't close too
      setOpen(false);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, items.length - 1));
    } else if (key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (key === "End") {
      event.preventDefault();
      setActive(items.length - 1);
    } else if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (items[active]) choose(items[active]);
    } else if (key === "Tab") {
      setOpen(false);
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // typing letters jumps to the first matching option
      const buffer = typeBuffer.current;
      clearTimeout(buffer.timer);
      buffer.text += key.toLowerCase();
      buffer.timer = setTimeout(() => {
        buffer.text = "";
      }, 600);
      const index = items.findIndex((item) => item.label.toLowerCase().startsWith(buffer.text));
      if (index >= 0) setActive(index);
    }
  }

  return (
    <div style={styles.wrapper}>
      {label && (
        <label
          id={`${id}-label`}
          style={styles.label}
          onClick={() => triggerRef.current && triggerRef.current.focus()}
        >
          {label}
        </label>
      )}

      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-disabled={disabled || undefined}
        className="dropdown-trigger"
        style={{
          ...styles.trigger,
          ...sizes[size],
          ...(error ? styles.triggerError : {}),
          ...(disabled ? styles.triggerDisabled : {}),
          ...style,
        }}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
      >
        <span style={{ ...styles.value, ...(selectedItem ? {} : styles.placeholder) }}>
          {selectedItem ? selectedItem.label : placeholder || "Select..."}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ ...styles.chevron, transform: open ? "rotate(180deg)" : "none" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {error && <span style={styles.error}>{error}</span>}

      {open &&
        position &&
        createPortal(
          <div
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            className="thin-scroll"
            style={{
              ...styles.list,
              left: position.left,
              width: position.width,
              top: position.top,
              bottom: position.bottom,
              maxHeight: position.maxHeight,
            }}
            // keeps focus on the dropdown and stops outer panels from reacting to the click
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {items.map((item, index) => {
              const isSelected = String(item.value) === current;
              return (
                <div
                  key={`${item.value}-${index}`}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  style={{
                    ...styles.option,
                    ...(item.isPlaceholder ? styles.optionPlaceholder : {}),
                    ...(isSelected ? styles.optionSelected : {}),
                    ...(index === active ? styles.optionActive : {}),
                  }}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(item)}
                >
                  <span>{item.label}</span>
                  {isSelected && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}