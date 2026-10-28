// src/pages/NotFound.jsx

import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { colors, spacing, fontSizes, fontWeights } from "../styles/theme";

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: `${spacing.xxxl * 2}px ${spacing.lg}px`,
    gap: spacing.sm,
  },
  code: {
    fontSize: 64,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    lineHeight: 1,
  },
  title: {
    margin: 0,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  text: {
    margin: 0,
    maxWidth: 380,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  action: { marginTop: spacing.lg },
};

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <div style={styles.code}>404</div>
      <h1 style={styles.title}>Page not found</h1>
      <p style={styles.text}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={styles.action}>
        <Button onClick={() => navigate("/")}>Back to dashboard</Button>
      </div>
    </div>
  );
}