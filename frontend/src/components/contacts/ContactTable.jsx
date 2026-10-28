// src/components/contacts/ContactTable.jsx
// <ContactTable contacts={filtered} onEdit={...} onDelete={...} emptyAction={...} />
// Clicking a row opens the contact's detail page.

import { useNavigate } from "react-router-dom";
import DataTable from "../ui/DataTable";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { usePermissions } from "../../hooks/usePermissions";
import { contactStatuses } from "../../data/mock";
import { formatDate } from "../../utils/formatters";
import { colors, spacing, fontSizes, fontWeights } from "../../styles/theme";

const styles = {
  nameCell: { display: "flex", alignItems: "center", gap: spacing.md },
  name: { fontWeight: fontWeights.medium, color: colors.textPrimary },
  email: { fontSize: fontSizes.xs, color: colors.textMuted },
  muted: { color: colors.textMuted },
  actions: { display: "flex", justifyContent: "flex-end", gap: 4 },
};

export default function ContactTable({ contacts, onEdit, onDelete, emptyAction }) {
  const navigate = useNavigate();
  const { canModify } = usePermissions();

  function statusLabel(key) {
    const found = contactStatuses.find((s) => s.key === key);
    return found ? found.label : key;
  }

  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (contact) => (
        <div style={styles.nameCell}>
          <Avatar name={contact.name} size={34} />
          <div>
            <div style={styles.name}>{contact.name}</div>
            <div style={styles.email}>{contact.email || "No email"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      sortable: true,
      render: (contact) =>
        contact.companyName || <span style={styles.muted}>-</span>,
    },
    {
      key: "jobTitle",
      header: "Job title",
      sortable: true,
      render: (contact) => contact.jobTitle || <span style={styles.muted}>-</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (contact) => (
        <Badge status={contact.status}>{statusLabel(contact.status)}</Badge>
      ),
    },
    { key: "ownerName", header: "Owner", sortable: true },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (contact) => formatDate(contact.createdAt),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (contact) => {
        const canEdit = canModify("contacts:edit", contact);
        const canDelete = canModify("contacts:delete", contact);
        if (!canEdit && !canDelete) return null;

        return (
          <div style={styles.actions} onClick={(event) => event.stopPropagation()}>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(contact)}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                style={{ color: colors.danger }}
                onClick={() => onDelete(contact)}
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
      rows={contacts}
      onRowClick={(contact) => navigate(`/contacts/${contact.id}`)}
      emptyTitle="No contacts found"
      emptyMessage="Try a different search or filter, or add a new contact."
      emptyAction={emptyAction}
    />
  );
}