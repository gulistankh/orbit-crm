// src/components/deals/KanbanBoard.jsx
// The full pipeline: one column per stage, scrolls sideways on small screens.
// <KanbanBoard dealsByStage={grouped} onMove={...} onEdit={...} onDelete={...} onAdd={...} />

import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import { dealStages } from "../../data/mock";
import { spacing } from "../../styles/theme";

const styles = {
  board: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.lg,
    overflowX: "auto",
    paddingBottom: spacing.lg,
  },
};

export default function KanbanBoard({ dealsByStage, onMove, onEdit, onDelete, onAdd }) {
  const [draggingId, setDraggingId] = useState(null);

  function handleDropDeal(dealId, stageKey) {
    setDraggingId(null);
    onMove(dealId, stageKey);
  }

  return (
    <div style={styles.board}>
      {dealStages.map((stage) => (
        <KanbanColumn
          key={stage.key}
          stage={stage}
          deals={dealsByStage[stage.key] || []}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onDropDeal={handleDropDeal}
          onMove={onMove}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}