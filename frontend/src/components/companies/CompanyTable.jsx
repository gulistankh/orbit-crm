// src/components/companies/CompanyTable.jsx
// <CompanyTable companies={filtered} onEdit={...} onDelete={...} emptyAction={...} />
// Clicking a row opens the company's detail page.

import { useNavigate } from "react-router-dom";
import DataTable from "../ui/DataTable";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { usePermissions } from "../../hooks/usePermissions";
import { formatCurrency } from "../../utils/formatters";
import { colors, spacing, fontSizes, fontWeights } from "../../styles/theme";

const styles = {
  nameCell: { display: "flex", alignItems: "center", gap: spacing.md },
  name: { fontWeight: fontWeights.medium, color: colors.textPrimary },
  website: { fontSize: fontSizes.xs, color: colors.textMuted },
  muted: { color: colors.textMuted },
  actions: { display: "flex", justifyContent: "flex-end", gap: 4 },
};

export default function CompanyTable({ companies, onEdit, onDelete, emptyAction }) {
  const navigate = useNavigate();
  const { canModify } = usePermissions();

  const dash = <span style={styles.muted}>-</span>;

  const columns = [
    {
      key: "name",
      header: "Company",
      sortable: true,
      render: (company) => (
        <div style={styles.nameCell}>
          <Avatar name={company.name} size={34} />
          <div>
            <div style={styles.name}>{company.name}</div>
            <div style={styles.website}>{company.website || "No website"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      sortable: true,
      render: (company) => company.industry || dash,
    },
    {
      key: "city",
      header: "Location",
      sortable: true,
      render: (company) =>
        [company.city, company.country].filter(Boolean).join(", ") || dash,
    },
    {
      key: "employees",
      header: "Employees",
      sortable: true,
      align: "right",
      render: (company) => (company.employees ? company.employees.toLocaleString() : dash),
    },
    {
      key: "contactCount",
      header: "Contacts",
      sortable: true,
      align: "right",
    },
    {
      key: "openDealValue",
      header: "Open deals",
      sortable: true,
      align: "right",
      render: (company) =>
        company.openDealValue ? formatCurrency(company.openDealValue) : dash,
    },
    { key: "ownerName", header: "Owner", sortable: true },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (company) => {
        const canEdit = canModify("companies:edit", company);
        const canDelete = canModify("companies:delete", company);
        if (!canEdit && !canDelete) return null;

        return (
          <div style={styles.actions} onClick={(event) => event.stopPropagation()}>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(company)}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                style={{ color: colors.danger }}
                onClick={() => onDelete(company)}
              >
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={companies}
      onRowClick={(company) => navigate(`/companies/${company.id}`)}
      emptyTitle="No companies found"
      emptyMessage="Try a different search or filter, or add a new company."
      emptyAction={emptyAction}
    />
  );
}