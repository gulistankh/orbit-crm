// src/components/activity/ActivityLog.jsx
// Timeline of notes, calls, emails and meetings for one contact.
// <ActivityLog activities={list} onDelete={(activity) => ...} />

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { usePermissions } from "../../hooks/usePermissions";
import { activityTypes } from "../../data/mock";
import TimeStamp from "../ui/TimeStamp";
import { colors, spacing, fontSizes, fontWeights } from "../../styles/theme";


const icons = {
  note: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  call: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  email: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  meeting: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
};

const typeColors = {
  note: { bg: "#EFECE6", text: colors.textSecondary, tone: "neutral" },
  call: { bg: colors.infoSoft, text: colors.info, tone: "info" },
  email: { bg: colors.primarySoft, text: colors.primary, tone: "primary" },
  meeting: { bg: colors.warningSoft, text: colors.warning, tone: "warning" },
};

const styles = {
  list: { display: "flex", flexDirection: "column" },
  item: {
    display: "flex",
    gap: spacing.md,
    padding: `${spacing.lg}px 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
  icon: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, minWidth: 0 },
  top: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    fontSize: fontSizes.sm,
  },
  author: { fontWeight: fontWeights.semibold, color: colors.textPrimary },
  time: { color: colors.textMuted },
  content: {
    margin: "6px 0 0",
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  delete: { color: colors.danger, marginLeft: "auto" },
};

export default function ActivityLog({ activities, onDelete }) {
  const { can } = usePermissions();
  const canDelete = can("activities:delete");

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        message="Notes, calls, emails and meetings you log will appear here, newest first."
      />
    );
  }

  function typeLabel(key) {
    const found = activityTypes.find((t) => t.key === key);
    return found ? found.label : key;
  }

  return (
    <div style={styles.list}>
      {activities.map((activity) => {
        const color = typeColors[activity.type] || typeColors.note;
        return (
          <div key={activity.id} style={styles.item}>
            <div style={{ ...styles.icon, backgroundColor: color.bg, color: color.text }}>
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
                {icons[activity.type] || icons.note}
              </svg>
            </div>

            <div style={styles.body}>
              <div style={styles.top}>
                <span style={styles.author}>{activity.userName}</span>
                <Badge tone={color.tone}>{typeLabel(activity.type)}</Badge>
                <TimeStamp value={activity.createdAt} mode="datetime" />
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    style={styles.delete}
                    onClick={() => onDelete(activity)}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <p style={styles.content}>{activity.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}