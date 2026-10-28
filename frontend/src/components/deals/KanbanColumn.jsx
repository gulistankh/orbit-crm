// src/components/deals/KanbanColumn.jsx
// One stage column. Cards can be dropped onto it.

import { useState } from "react";
import DealCard from "./DealCard";
import { usePermissions } from "../../hooks/usePermissions";
import { formatCurrency } from "../../utils/formatters";
import {
  colors,
  stageColors,
  radius,
  spacing,
  fontSizes,
  fontWeights,
} from "../../styles/theme";

const styles = {
  column: {
    flex: "0 0 290px",
    width: 290,
    display: "flex",
    flexDirection: "column",
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    transition: "background-color 0.15s ease, border-color 0.15s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: `${spacing.md}px ${spacing.md}px 0`,
  },
  titleWrap: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  dot: { width: 9, height: 9, borderRadius: "50%", flexShrink: 0 },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  count: {
    padding: "1px 8px",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  addButton: {
    width: 26,
    height: 26,
    border: "none",
    borderRadius: radius.sm,
    backgroundColor: "transparent",
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 1,
  },
  total: {
    padding: `4px ${spacing.md}px ${spacing.sm}px`,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    padding: `0 ${spacing.sm}px ${spacing.sm}px`,
    minHeight: 120,
  },
  empty: {
    padding: spacing.lg,
    textAlign: "center",
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    border: `1px dashed ${colors.borderStrong}`,
    borderRadius: radius.md,
  },
};

export default function KanbanColumn({
  stage,
  deals,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropDeal,
  onMove,
  onEdit,
  onDelete,
  onAdd,
}) {
  const { can } = usePermissions();
  const [isOver, setIsOver] = useState(false);

  const total = deals.reduce((sum, deal) => sum + deal.value, 0);
  const color = stageColors[stage.key];
  const dragActive = Boolean(draggingId);

  function handleDragOver(event) {
    if (!dragActive) return;
    event.preventDefault(); // allows dropping
    event.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
  }

  function handleDragLeave(event) {
    // ignore when moving between children of this column
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsOver(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsOver(false);
    const id = draggingId || event.dataTransfer.getData("text/plain");
    if (id) onDropDeal(id, stage.key);
  }

  return (
    <div
      style={{
        ...styles.column,
        backgroundColor: isOver ? colors.primarySoft : "#F1F5F9",
        borderColor: isOver ? colors.primary : colors.border,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <span style={{ ...styles.dot, backgroundColor: color.dot }} />
          <span style={styles.title}>{stage.label}</span>
          <span style={styles.count}>{deals.length}</span>
        </div>
        {onAdd && can("deals:create") && (
          <button
            type="button"
            className="btn-ghost"
            aria-label={`Add deal to ${stage.label}`}
            style={styles.addButton}
            onClick={() => onAdd(stage.key)}
          >
            +
          </button>
        )}
      </div>
      <div style={styles.total}>{formatCurrency(total)}</div>

      <div style={styles.body}>
        {deals.length === 0 ? (
          <div style={styles.empty}>{dragActive ? "Drop here" : "No deals"}</div>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              dragging={draggingId === deal.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}