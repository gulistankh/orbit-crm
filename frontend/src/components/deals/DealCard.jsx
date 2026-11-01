// src/components/deals/DealCard.jsx
// One deal on the kanban board. Draggable if the user may edit it.

import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { usePermissions } from "../../hooks/usePermissions";
import { dealStages } from "../../data/mock";
import { formatCurrency } from "../../utils/formatters";
import TimeStamp from "../ui/TimeStamp";
import Select from "../ui/Select";
import {
  card,
  colors,
  radius,
  spacing,
  fontSizes,
  fontWeights,
} from "../../styles/theme";

const styles = {
  card: {
    ...card,
    borderRadius: radius.lg,
    padding: spacing.md,
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    transition: "box-shadow 0.15s ease, opacity 0.15s ease",
  },
  
  title: {
    margin: 0,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    lineHeight: 1.3,
  },
  meta: { fontSize: fontSizes.sm, color: colors.textSecondary },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  owner: { display: "flex", alignItems: "center", gap: 6 },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: spacing.sm,
  },
};

const todayString = () => new Date().toISOString().slice(0, 10);

export default function DealCard({
  deal,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
  onEdit,
  onDelete,
}) {
  const { canModify } = usePermissions();
  const canEdit = canModify("deals:edit", deal);
  const canDelete = canModify("deals:delete", deal);

  const isOpen = deal.stage !== "won" && deal.stage !== "lost";
  const overdue = isOpen && deal.expectedCloseDate && deal.expectedCloseDate < todayString();

  const subtitle = [deal.companyName, deal.contactName].filter(Boolean).join(" · ");

  return (
    <div
      className="card-hover"
      draggable={canEdit}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", deal.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart(deal.id);
      }}
      onDragEnd={onDragEnd}
      style={{
        ...styles.card,
        cursor: canEdit ? "grab" : "default",
        opacity: dragging ? 0.4 : 1,
      }}
    >
      <h3 style={styles.title}>{deal.title}</h3>
      {subtitle && <div style={styles.meta}>{subtitle}</div>}
      <div style={styles.value}>{formatCurrency(deal.value)}</div>

      <div style={styles.footer}>
        <span style={styles.owner}>
          <Avatar name={deal.ownerName} size={22} />
          {deal.ownerName.split(" ")[0]}
        </span>
        {deal.expectedCloseDate ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {overdue && (
              <span style={{ color: colors.danger, fontWeight: fontWeights.medium }}>Overdue</span>
            )}
            <TimeStamp
              value={deal.expectedCloseDate}
              style={overdue ? { color: colors.danger } : undefined}
            />
          </span>
        ) : (
          <span>No close date</span>
        )}
      </div>

      {(canEdit || canDelete) && (
        <div style={styles.actions}>
           {canEdit && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Select
                aria-label={`Move ${deal.title} to another stage`}
                size="sm"
                placeholder="Move to..."
                allowEmpty={false}
                options={dealStages
                  .filter((stage) => stage.key !== deal.stage)
                  .map((stage) => ({ value: stage.key, label: stage.label }))}
                value=""
                onChange={(event) => onMove(deal.id, event.target.value)}
              />
            </div>
          )}
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(deal)}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              style={{ color: colors.danger }}
              onClick={() => onDelete(deal)}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}