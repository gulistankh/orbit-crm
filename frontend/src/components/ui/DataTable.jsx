// src/components/ui/DataTable.jsx
// A sortable, paginated table used for contacts, companies and deals.
//
// const columns = [
//   { key: "name", header: "Name", sortable: true, render: (row) => <strong>{row.name}</strong> },
//   { key: "value", header: "Value", sortable: true, align: "right" },
//   { key: "actions", header: "", render: (row) => <Button>Edit</Button> },
// ];
// <DataTable columns={columns} rows={rows} onRowClick={(row) => ...} pageSize={10} />
//
// Optional per column: width, align, sortValue(row) for custom sorting.

import { useMemo, useState } from "react";
import Button from "./Button";
import EmptyState from "./EmptyState";
import { card, colors, spacing, fontSizes, fontWeights } from "../../styles/theme";

const styles = {
  card: { ...card, overflow: "hidden" },
  scroll: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 640 },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    backgroundColor: colors.background,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  td: {
    padding: "12px 16px",
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    borderBottom: `1px solid ${colors.border}`,
    verticalAlign: "middle",
  },
  sortArrow: { marginLeft: 6, fontSize: 10, color: colors.primary },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: `${spacing.md}px ${spacing.lg}px`,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  pager: { display: "flex", gap: spacing.sm },
};

export default function DataTable({
  columns,
  rows,
  onRowClick,
  pageSize = 10,
  rowKey = "id",
  emptyTitle = "No results",
  emptyMessage = "Try changing your search or filters.",
  emptyAction,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;

    const column = columns.find((c) => c.key === sortKey);
    const getValue = column && column.sortValue ? column.sortValue : (row) => row[sortKey];
    const direction = sortDir === "asc" ? 1 : -1;

    return [...rows].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const emptyA = va === null || va === undefined || va === "";
      const emptyB = vb === null || vb === undefined || vb === "";

      if (emptyA && emptyB) return 0;
      if (emptyA) return 1; // empty values always go last
      if (emptyB) return -1;

      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * direction;
      }
      return (
        String(va).localeCompare(String(vb), undefined, {
          numeric: true,
          sensitivity: "base",
        }) * direction
      );
    });
  }, [rows, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRows = sortedRows.slice(startIndex, startIndex + pageSize);

  function handleSort(column) {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(column.key);
      setSortDir("asc");
    }
    setPage(1);
  }

  if (rows.length === 0) {
    return (
      <div style={styles.card}>
        <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.scroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    sortKey === column.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  style={{
                    ...styles.th,
                    width: column.width,
                    textAlign: column.align || "left",
                    cursor: column.sortable ? "pointer" : "default",
                  }}
                  onClick={() => handleSort(column)}
                >
                  {column.header}
                  {sortKey === column.key && (
                    <span style={styles.sortArrow}>{sortDir === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row[rowKey]}
                className="row-hover"
                style={{ cursor: onRowClick ? "pointer" : "default" }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{ ...styles.td, textAlign: column.align || "left" }}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <span>
          Showing {startIndex + 1}-{startIndex + visibleRows.length} of {sortedRows.length}
        </span>
        {totalPages > 1 && (
          <div style={styles.pager}>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}