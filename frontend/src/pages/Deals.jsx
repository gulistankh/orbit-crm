// src/pages/Deals.jsx
// Deals pipeline: kanban board or sortable list, with search and filters.

import { useMemo, useState } from "react";
import KanbanBoard from "../components/deals/KanbanBoard";
import DealForm from "../components/deals/DealForm";
import DataTable from "../components/ui/DataTable";
import SearchBar from "../components/ui/SearchBar";
import FilterBar from "../components/ui/FilterBar";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useDeals } from "../hooks/useDeals";
import { useCompanies } from "../hooks/useCompanies";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { dealStages } from "../data/mock";
import { exportDealsCsv } from "../utils/csv";
import { formatCurrency, formatDate } from "../utils/formatters";
import { colors, pageTitle, spacing, fontSizes, fontWeights } from "../styles/theme";

const styles = {
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  headerActions: { display: "flex", flexWrap: "wrap", gap: spacing.sm },
  viewToggle: { display: "flex", gap: 4 },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dealTitle: { fontWeight: fontWeights.medium, color: colors.textPrimary },
  muted: { color: colors.textMuted },
  actions: { display: "flex", justifyContent: "flex-end", gap: 4 },
};

const emptyFilters = { companyId: "", ownerId: "", stage: "" };

export default function Deals() {
  const { deals, stats, addDeal, updateDeal, deleteDeal, moveDeal } = useDeals();
  const { companies } = useCompanies();
  const { users } = useAuth();
  const { can, canModify } = usePermissions();

  const [view, setView] = useState("board");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [formState, setFormState] = useState({ open: false, deal: null, stage: "lead" });
  const [dealToDelete, setDealToDelete] = useState(null);

  const filteredDeals = useMemo(() => {
    const term = search.trim().toLowerCase();

    return deals.filter((deal) => {
      if (filters.companyId && deal.companyId !== filters.companyId) return false;
      if (filters.ownerId && deal.ownerId !== filters.ownerId) return false;
      if (view === "list" && filters.stage && deal.stage !== filters.stage) return false;

      if (!term) return true;
      return [deal.title, deal.companyName, deal.contactName]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [deals, search, filters, view]);

  const dealsByStage = useMemo(() => {
    const grouped = {};
    dealStages.forEach((stage) => {
      grouped[stage.key] = filteredDeals.filter((deal) => deal.stage === stage.key);
    });
    return grouped;
  }, [filteredDeals]);

  const filterConfig = [
    {
      key: "companyId",
      label: "Company",
      options: [...companies]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => ({ value: c.id, label: c.name })),
    },
    {
      key: "ownerId",
      label: "Owner",
      options: users.map((u) => ({ value: u.id, label: u.name })),
    },
  ];
  if (view === "list") {
    filterConfig.push({
      key: "stage",
      label: "Stage",
      options: dealStages.map((s) => ({ value: s.key, label: s.label })),
    });
  }

  function stageLabel(key) {
    const found = dealStages.find((s) => s.key === key);
    return found ? found.label : key;
  }

  function openAdd(stage = "lead") {
    setFormState({ open: true, deal: null, stage });
  }

  function openEdit(deal) {
    setFormState({ open: true, deal, stage: deal.stage });
  }

  function closeForm() {
    setFormState({ open: false, deal: null, stage: "lead" });
  }

  // Re-check permission here too, so a drop can never bypass the rules
  function handleMove(dealId, stageKey) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || !stageKey || !canModify("deals:edit", deal)) return;
    moveDeal(dealId, stageKey);
  }

  async function handleSubmit(values) {
    const saved = formState.deal
      ? await updateDeal(formState.deal.id, values)
      : await addDeal(values);
    if (saved) closeForm();
  }

  function handleConfirmDelete() {
    deleteDeal(dealToDelete.id);
    setDealToDelete(null);
  }

  const columns = [
    {
      key: "title",
      header: "Deal",
      sortable: true,
      render: (deal) => <span style={styles.dealTitle}>{deal.title}</span>,
    },
    {
      key: "companyName",
      header: "Company",
      sortable: true,
      render: (deal) => deal.companyName || <span style={styles.muted}>-</span>,
    },
    {
      key: "contactName",
      header: "Contact",
      sortable: true,
      render: (deal) => deal.contactName || <span style={styles.muted}>-</span>,
    },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      sortValue: (deal) => dealStages.findIndex((s) => s.key === deal.stage),
      render: (deal) => <Badge stage={deal.stage}>{stageLabel(deal.stage)}</Badge>,
    },
    {
      key: "value",
      header: "Value",
      sortable: true,
      align: "right",
      render: (deal) => formatCurrency(deal.value),
    },
    {
      key: "expectedCloseDate",
      header: "Expected close",
      sortable: true,
      render: (deal) => formatDate(deal.expectedCloseDate),
    },
    { key: "ownerName", header: "Owner", sortable: true },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (deal) => {
        const canEdit = canModify("deals:edit", deal);
        const canDelete = canModify("deals:delete", deal);
        if (!canEdit && !canDelete) return null;
        return (
          <div style={styles.actions}>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => openEdit(deal)}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                style={{ color: colors.danger }}
                onClick={() => setDealToDelete(deal)}
              >
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const addButton = can("deals:create") ? (
    <Button onClick={() => openAdd("lead")}>Add deal</Button>
  ) : null;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={pageTitle}>Deals</h1>
          <p style={styles.subtitle}>
            {stats.openCount} open deals · {formatCurrency(stats.openValue)} in the pipeline
          </p>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.viewToggle}>
            <Button
              variant={view === "board" ? "primary" : "secondary"}
              onClick={() => setView("board")}
            >
              Board
            </Button>
            <Button
              variant={view === "list" ? "primary" : "secondary"}
              onClick={() => setView("list")}
            >
              List
            </Button>
          </div>
          {can("data:export") && (
            <Button
              variant="secondary"
              disabled={filteredDeals.length === 0}
              onClick={() => exportDealsCsv(filteredDeals)}
            >
              Export CSV
            </Button>
          )}
          {addButton}
        </div>
      </div>

      <div style={styles.toolbar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search deals..." />
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onClear={() => setFilters(emptyFilters)}
        />
      </div>

      {view === "board" ? (
        <KanbanBoard
          dealsByStage={dealsByStage}
          onMove={handleMove}
          onEdit={openEdit}
          onDelete={setDealToDelete}
          onAdd={openAdd}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filteredDeals}
          emptyTitle="No deals found"
          emptyMessage="Try a different search or filter, or add a new deal."
          emptyAction={deals.length === 0 ? addButton : null}
        />
      )}

      <Modal
        open={formState.open}
        onClose={closeForm}
        title={formState.deal ? "Edit deal" : "Add deal"}
        width={600}
      >
        <DealForm
          key={formState.deal ? formState.deal.id : `new-${formState.stage}`}
          deal={formState.deal}
          defaultStage={formState.stage}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          submitLabel={formState.deal ? "Save changes" : "Add deal"}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(dealToDelete)}
        title="Delete deal"
        message={dealToDelete ? `Delete "${dealToDelete.title}"? This can't be undone.` : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDealToDelete(null)}
      />
    </div>
  );
}