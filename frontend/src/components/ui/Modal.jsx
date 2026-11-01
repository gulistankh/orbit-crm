// src/components/ui/Modal.jsx
// <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Add contact" footer={<>...buttons...</>}>
//   ...form...
// </Modal>
// Closes on Escape and when you click the dark background.
// It is drawn on document.body (a "portal"), so no parent element can clip or shrink it.

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { colors, radius, shadows, spacing, fontSizes, fontWeights } from "../../styles/theme";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(28, 25, 23, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    zIndex: 1000,
  },
  panel: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadows.lg,
    display: "flex",
    flexDirection: "column",
    maxHeight: "calc(100vh - 48px)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${spacing.lg}px ${spacing.xl}px`,
    borderBottom: `1px solid ${colors.border}`,
  },
  title: {
    margin: 0,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: 24,
    lineHeight: 1,
    color: colors.textMuted,
    padding: "0 4px",
  },
  body: {
    padding: spacing.xl,
    overflowY: "auto",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.sm,
    padding: `${spacing.lg}px ${spacing.xl}px`,
    borderTop: `1px solid ${colors.border}`,
  },
};

export default function Modal({ open, onClose, title, children, footer, width = 520 }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div style={styles.overlay} onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ ...styles.panel, maxWidth: width }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button
            type="button"
            className="btn-ghost"
            aria-label="Close"
            style={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div style={styles.body}>{children}</div>
        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}