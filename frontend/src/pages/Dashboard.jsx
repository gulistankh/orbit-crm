// src/pages/Dashboard.jsx

import { Link } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { useDeals } from "../hooks/useDeals";
import { useActivities } from "../hooks/useActivities";
import { useContacts } from "../hooks/useContacts";
import { useCompanies } from "../hooks/useCompanies";
import { dealStages, activityTypes } from "../data/mock";
import { formatCurrency, formatDate, timeAgo } from "../utils/formatters";
import {
  card,
  pageTitle,
  stageColors,
  colors,
  radius,
  spacing,
  fontSizes,
  fontWeights,
} from "../styles/theme";

const activityTones = {
  note: "neutral",
  call: "info",
  email: "primary",
  meeting: "warning",
};

const styles = {
  header: { marginBottom: spacing.xl },
  subtitle: {
    margin: "6px 0 0",
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: { ...card, padding: spacing.xl },
  statLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  statValue: {
    margin: "8px 0 4px",
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: 1.1,
  },
  statSub: { fontSize: fontSizes.sm, color: colors.textMuted },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: { ...card, padding: spacing.xl },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    margin: 0,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.primary,
    textDecoration: "none",
  },
  // pipeline by stage
  stageList: { display: "flex", flexDirection: "column", gap: spacing.lg },
  stageTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    fontSize: fontSizes.sm,
  },
  stageName: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  stageDot: { width: 8, height: 8, borderRadius: "50%" },
  stageCount: { color: colors.textMuted, fontWeight: fontWeights.regular },
  stageValue: { fontWeight: fontWeights.semibold, color: colors.textPrimary },
  barTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  // activity list
  list: { display: "flex", flexDirection: "column" },
  activityItem: {
    display: "flex",
    gap: spacing.md,
    padding: `${spacing.md}px 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
  activityBody: { flex: 1, minWidth: 0 },
  activityTitle: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  activityName: { fontWeight: fontWeights.semibold, color: colors.textPrimary },
  contactLink: {
    color: colors.primary,
    textDecoration: "none",
    fontWeight: fontWeights.medium,
  },
  activityText: {
    margin: "4px 0 0",
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 1.45,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  activityTime: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    whiteSpace: "nowrap",
  },
  // upcoming deals
  dealItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    padding: `${spacing.md}px 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
  dealTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  dealMeta: { fontSize: fontSizes.sm, color: colors.textMuted, marginTop: 2 },
  dealRight: { textAlign: "right", flexShrink: 0 },
  dealValue: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
};

function StatCard({ label, value, sub }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  );
}

function Section({ title, linkTo, linkLabel, children }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {linkTo && (
          <Link to={linkTo} style={styles.sectionLink}>
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { deals, dealsByStage, stats } = useDeals();
  const { getRecentActivities } = useActivities();
  const { contacts } = useContacts();
  const { companies } = useCompanies();

  const recentActivities = getRecentActivities(6);

  const stageTotals = dealStages.map((stage) => {
    const stageDeals = dealsByStage[stage.key] || [];
    return {
      ...stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
    };
  });
  const maxStageValue = Math.max(...stageTotals.map((s) => s.value), 0);

  const upcomingDeals = deals
    .filter((deal) => deal.stage !== "won" && deal.stage !== "lost")
    .sort((a, b) =>
      (a.expectedCloseDate || "9999").localeCompare(b.expectedCloseDate || "9999")
    )
    .slice(0, 5);

  function activityLabel(type) {
    const found = activityTypes.find((t) => t.key === type);
    return found ? found.label : type;
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={pageTitle}>Dashboard</h1>
        <p style={styles.subtitle}>Overview of your pipeline and recent team activity.</p>
      </div>

      <div style={styles.statGrid}>
        <StatCard
          label="Open pipeline"
          value={formatCurrency(stats.openValue)}
          sub={`${stats.openCount} open deals`}
        />
        <StatCard
          label="Won revenue"
          value={formatCurrency(stats.wonValue)}
          sub={`${stats.wonCount} deals won`}
        />
        <StatCard label="Win rate" value={`${stats.winRate}%`} sub="Of closed deals" />
        <StatCard
          label="Contacts"
          value={contacts.length}
          sub={`${companies.length} companies`}
        />
      </div>

      <div style={styles.twoColumn}>
        <Section title="Pipeline by stage" linkTo="/deals" linkLabel="View pipeline">
          <div style={styles.stageList}>
            {stageTotals.map((stage) => {
              const percent = maxStageValue ? (stage.value / maxStageValue) * 100 : 0;
              const color = stageColors[stage.key];
              return (
                <div key={stage.key}>
                  <div style={styles.stageTop}>
                    <span style={styles.stageName}>
                      <span style={{ ...styles.stageDot, backgroundColor: color.dot }} />
                      {stage.label}
                      <span style={styles.stageCount}>({stage.count})</span>
                    </span>
                    <span style={styles.stageValue}>{formatCurrency(stage.value)}</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        height: "100%",
                        width: `${stage.value > 0 ? Math.max(percent, 3) : 0}%`,
                        backgroundColor: color.dot,
                        borderRadius: radius.pill,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Recent activity" linkTo="/contacts" linkLabel="All contacts">
          {recentActivities.length === 0 ? (
            <EmptyState
              title="No activity yet"
              message="Notes, calls and emails you log on a contact will show up here."
            />
          ) : (
            <div style={styles.list}>
              {recentActivities.map((activity) => (
                <div key={activity.id} style={styles.activityItem}>
                  <Avatar name={activity.userName} size={32} />
                  <div style={styles.activityBody}>
                    <div style={styles.activityTitle}>
                      <span style={styles.activityName}>{activity.userName}</span>
                      <Badge tone={activityTones[activity.type] || "neutral"}>
                        {activityLabel(activity.type)}
                      </Badge>
                      {activity.contactName && (
                        <Link to={`/contacts/${activity.contactId}`} style={styles.contactLink}>
                          {activity.contactName}
                        </Link>
                      )}
                    </div>
                    <p style={styles.activityText}>{activity.content}</p>
                  </div>
                  <span style={styles.activityTime}>{timeAgo(activity.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Section title="Closing soon" linkTo="/deals" linkLabel="All deals">
        {upcomingDeals.length === 0 ? (
          <EmptyState
            title="No open deals"
            message="Deals that are still in progress will appear here, ordered by close date."
          />
        ) : (
          <div style={styles.list}>
            {upcomingDeals.map((deal) => (
              <div key={deal.id} style={styles.dealItem}>
                <div>
                  <div style={styles.dealTitle}>{deal.title}</div>
                  <div style={styles.dealMeta}>
                    {[deal.companyName, deal.contactName].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div style={styles.dealRight}>
                  <div style={styles.dealValue}>{formatCurrency(deal.value)}</div>
                  <div style={styles.dealMeta}>{formatDate(deal.expectedCloseDate)}</div>
                </div>
                <Badge stage={deal.stage}>
                  {dealStages.find((s) => s.key === deal.stage)?.label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}