// src/pages/Login.jsx

import { useEffect, useState } from "react";
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

const valueProps = [
  "Pipeline board, searchable tables and CSV import in one place",
  "Notes and a full activity history on every contact",
  "Roles and permissions, so everyone sees only what they should",
];

const WIDE_QUERY = "(min-width: 900px)";

function useIsWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(WIDE_QUERY);
    function handleChange(event) {
      setWide(event.matches);
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return wide;
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: colors.background,
  },
  // left panel
  showcase: {
    position: "relative",
    overflow: "hidden",
    flex: "0 0 46%",
    maxWidth: 660,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 56px",
    background: "linear-gradient(160deg, #0F1F1D 0%, #12332F 55%, #0F766E 140%)",
    color: colors.sidebarTextActive,
  },
  ringLarge: {
    position: "absolute",
    right: -180,
    bottom: -180,
    width: 520,
    height: 520,
    borderRadius: "50%",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  ringSmall: {
    position: "absolute",
    right: -80,
    bottom: -80,
    width: 320,
    height: 320,
    borderRadius: "50%",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  showcaseTop: { position: "relative", zIndex: 1 },
  showcaseMiddle: { position: "relative", zIndex: 1 },
  headline: {
    margin: 0,
    fontSize: 38,
    fontWeight: fontWeights.bold,
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
    maxWidth: 460,
  },
  lead: {
    margin: `${spacing.lg}px 0 ${spacing.xl}px`,
    maxWidth: 420,
    fontSize: fontSizes.lg,
    lineHeight: 1.55,
    color: colors.sidebarText,
  },
  propList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
  prop: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.md,
    maxWidth: 440,
    fontSize: fontSizes.md,
    lineHeight: 1.5,
    color: "#D4E2DF",
  },
  propIcon: { flexShrink: 0, marginTop: 1, color: colors.sidebarAccent },
  showcaseFooter: {
    position: "relative",
    zIndex: 1,
    fontSize: fontSizes.sm,
    color: "#6F8A86",
  },
  // right side
  formSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  wrapper: { width: "100%", maxWidth: 420 },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
  },
  brandCentered: { justifyContent: "center", marginBottom: spacing.xl },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    background: "linear-gradient(135deg, #14B8A6, #0F766E)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.lg,
  },
  brandName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    letterSpacing: "-0.01em",
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
    color: colors.danger,
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

function BrandMark() {
  return <div style={styles.brandMark}>O</div>;
}

export default function Login() {
  const { isAuthenticated, authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const wide = useIsWide();

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
      {wide && (
        <aside style={styles.showcase}>
          <div style={styles.ringLarge} />
          <div style={styles.ringSmall} />

          <div style={styles.showcaseTop}>
            <div style={styles.brand}>
              <BrandMark />
              <span style={{ ...styles.brandName, color: colors.sidebarTextActive }}>
                Orbit CRM
              </span>
            </div>
          </div>

          <div style={styles.showcaseMiddle}>
            <h2 style={styles.headline}>Replace messy spreadsheets with a clean sales workspace.</h2>
            <p style={styles.lead}>
              Keep every contact, company and deal in one place, and know exactly where each
              opportunity stands.
            </p>
            <ul style={styles.propList}>
              {valueProps.map((text) => (
                <li key={text} style={styles.prop}>
                  <svg
                    style={styles.propIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="8 12 11 15 16 9" />
                  </svg>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.showcaseFooter}>An internal tool for small sales teams</div>
        </aside>
      )}

      <div style={styles.formSide}>
        <div style={styles.wrapper}>
          {!wide && (
            <div style={{ ...styles.brand, ...styles.brandCentered }}>
              <BrandMark />
              <span style={{ ...styles.brandName, color: colors.textPrimary }}>Orbit CRM</span>
            </div>
          )}

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
    </div>
  );
}