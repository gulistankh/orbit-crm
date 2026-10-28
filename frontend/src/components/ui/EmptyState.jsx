// src/components/ui/EmptyState.jsx
// <EmptyState title="No contacts yet" message="Add your first contact." action={<Button>Add contact</Button>} />

import { colors, spacing, fontSizes, fontWeights } from "../../styles/theme";

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: `${spacing.xxxl}px ${spacing.xl}px`,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    margin: 0,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  message: {
    margin: 0,
    maxWidth: 360,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  action: { marginTop: spacing.md },
};

export default function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.iconCircle}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      </div>
      <h3 style={styles.title}>{title}</h3>
      {message && <p style={styles.message}>{message}</p>}
      {action && <div style={styles.action}>{action}</div>}
    </div>
  );
}