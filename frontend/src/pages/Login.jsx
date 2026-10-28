// src/pages/Login.jsx

import { useState } from "react";
import { Navigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import { useAuth, DEMO_PASSWORD } from "../context/AuthContext";
import { roleLabels } from "../utils/permissions";
import {
  card,
  colors,
  radius,
  spacing,
  shadows,
  fontSizes,
  fontWeights,
} from "../styles/theme";

// The demo accounts only show when VITE_DEMO_MODE=true (see .env.development)
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const demoAccounts = [
  { id: "demo-admin", name: "Sara Mitchell", email: "sara@demo.com", role: "admin" },
  { id: "demo-manager", name: "Daniel Okafor", email: "daniel@demo.com", role: "manager" },
  { id: "demo-rep", name: "Lina Haddad", email: "lina@demo.com", role: "sales_rep" },
  { id: "demo-viewer", name: "Tom Becker", email: "tom@demo.com", role: "viewer" },
];

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  wrapper: { width: "100%", maxWidth: 420 },
  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    color: colors.textOnPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.lg,
  },
  brandName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  card: {
    ...card,
    boxShadow: shadows.md,
    padding: spacing.xxl,
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  },
  title: {
    margin: 0,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  form: { display: "flex", flexDirection: "column", gap: spacing.lg },
  errorBox: {
    padding: "10px 12px",
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    color: "#B91C1C",
    fontSize: fontSizes.sm,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  demoList: { display: "flex", flexDirection: "column", gap: spacing.sm },
  demoButton: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
    padding: "8px 12px",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    textAlign: "left",
  },
  demoText: { flex: 1, minWidth: 0 },
  demoName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  demoEmail: { fontSize: fontSizes.xs, color: colors.textMuted },
  hint: {
    margin: 0,
    textAlign: "center",
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
};

export default function Login() {
  const { isAuthenticated, authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) return null;
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) setError(result.error);
  }

  async function handleDemoLogin(user) {
    setSubmitting(true);
    const result = await login(user.email, DEMO_PASSWORD);
    setSubmitting(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>O</div>
          <span style={styles.brandName}>Orbit CRM</span>
        </div>

        <div style={styles.card}>
          <div>
            <h1 style={styles.title}>Sign in</h1>
            <p style={styles.subtitle}>Welcome back. Enter your details to continue.</p>
          </div>

          <form style={styles.form} onSubmit={handleSubmit}>
            {error && <div style={styles.errorBox}>{error}</div>}
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              autoComplete="current-password"
              required
            />
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {DEMO_MODE && (
            <>
              <div style={styles.divider}>
                <span style={styles.line} />
                Try a demo account
                <span style={styles.line} />
              </div>

              <div style={styles.demoList}>
                {demoAccounts.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="btn-secondary"
                    style={styles.demoButton}
                    disabled={submitting}
                    onClick={() => handleDemoLogin(user)}
                  >
                    <Avatar name={user.name} size={32} />
                    <span style={styles.demoText}>
                      <div style={styles.demoName}>{user.name}</div>
                      <div style={styles.demoEmail}>{user.email}</div>
                    </span>
                    <Badge tone="neutral">{roleLabels[user.role]}</Badge>
                  </button>
                ))}
              </div>

              <p style={styles.hint}>Demo password for all accounts: {DEMO_PASSWORD}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}