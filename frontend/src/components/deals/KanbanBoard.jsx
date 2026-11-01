// src/components/deals/KanbanBoard.jsx
// The full pipeline: one column per stage.
// The board has a fixed height, so the sideways scrollbar is always on screen,
// and each column scrolls on its own. Ways to move sideways:
//  - stage buttons that jump to a column
//  - arrow buttons
//  - drag a card to the left or right edge and the board scrolls by itself

import { useEffect, useRef, useState } from "react";
import KanbanColumn from "./KanbanColumn";
import { dealStages } from "../../data/mock";
import {
  colors,
  stageColors,
  radius,
  spacing,
  fontSizes,
  fontWeights,
} from "../../styles/theme";

const EDGE_SIZE = 90; // how close to the edge (px) before dragging scrolls the board
const EDGE_SPEED = 22; // how far it scrolls on each drag event

const styles = {
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  jumps: { display: "flex", flexWrap: "wrap", gap: spacing.sm },
  jump: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    border: `1px solid ${colors.border}`,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  jumpDot: { width: 8, height: 8, borderRadius: "50%" },
  jumpCount: { color: colors.textMuted, fontWeight: fontWeights.regular },
  arrows: { display: "flex", gap: spacing.sm },
  arrow: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    padding: 0,
  },
  board: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.lg,
    overflowX: "auto",
    overflowY: "hidden",
    height: "calc(100vh - 340px)",
    minHeight: 420,
    paddingBottom: spacing.sm,
  },
};

function Chevron({ direction }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}

export default function KanbanBoard({ dealsByStage, onMove, onEdit, onDelete, onAdd }) {
  const [draggingId, setDraggingId] = useState(null);
  const [edges, setEdges] = useState({ left: false, right: true });
  const scrollRef = useRef(null);

  // Remember whether there is more to see on each side, to enable or disable the arrows
  function updateEdges() {
    const element = scrollRef.current;
    if (!element) return;
    const left = element.scrollLeft > 4;
    const right = element.scrollLeft + element.clientWidth < element.scrollWidth - 4;
    setEdges((previous) =>
      previous.left === left && previous.right === right ? previous : { left, right }
    );
  }

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealsByStage]);

  function scrollPage(direction) {
    const element = scrollRef.current;
    element.scrollBy({
      left: direction * Math.max(280, element.clientWidth * 0.75),
      behavior: "smooth",
    });
  }

  function jumpTo(stageKey) {
    const column = document.getElementById(`kanban-col-${stageKey}`);
    if (column) {
      column.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }

  // While a card is being dragged near an edge, scroll the board that way
  function handleDragOver(event) {
    if (!draggingId) return;
    const element = scrollRef.current;
    const rect = element.getBoundingClientRect();
    if (event.clientX < rect.left + EDGE_SIZE) {
      element.scrollLeft -= EDGE_SPEED;
    } else if (event.clientX > rect.right - EDGE_SIZE) {
      element.scrollLeft += EDGE_SPEED;
    }
  }

  function handleDropDeal(dealId, stageKey) {
    setDraggingId(null);
    onMove(dealId, stageKey);
  }

  return (
    <div>
      <div style={styles.controls}>
        <div style={styles.jumps}>
          {dealStages.map((stage) => (
            <button
              key={stage.key}
              type="button"
              className="btn-secondary"
              style={styles.jump}
              onClick={() => jumpTo(stage.key)}
            >
              <span
                style={{ ...styles.jumpDot, backgroundColor: stageColors[stage.key].dot }}
              />
              {stage.label}
              <span style={styles.jumpCount}>{(dealsByStage[stage.key] || []).length}</span>
            </button>
          ))}
        </div>

        <div style={styles.arrows}>
          <button
            type="button"
            className="btn-secondary"
            style={styles.arrow}
            aria-label="Scroll left"
            disabled={!edges.left}
            onClick={() => scrollPage(-1)}
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={styles.arrow}
            aria-label="Scroll right"
            disabled={!edges.right}
            onClick={() => scrollPage(1)}
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="thin-scroll"
        style={styles.board}
        onScroll={updateEdges}
        onDragOver={handleDragOver}
      >
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
    </div>
  );
}