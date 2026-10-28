// src/pages/ContactDetail.jsx
// One contact: profile, details, deals, and the notes + activity log.
import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContactForm from "../components/contacts/ContactForm";
import NoteForm from "../components/activity/NoteForm";
import ActivityLog from "../components/activity/ActivityLog";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { useContacts } from "../hooks/useContacts";
import { useDeals } from "../hooks/useDeals";
import { useActivities } from "../hooks/useActivities";
import { usePermissions } from "../hooks/usePermissions";
import { contactStatuses, dealStages } from "../data/mock";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  card,
  colors,
  spacing,
  fontSizes,
  fontWeights,
} from "../styles/theme";

const styles = {
  back: {
    display: "inline-block",
    marginBottom: spacing.lg,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    textDecoration: "none",
  },
  headerCard: {
    ...card,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  identity: { display: "flex", alignItems: "center", gap: spacing.lg },
  name: {
    margin: 0,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  role: { margin: "4px 0 8px", fontSize: fontSizes.md, color: colors.textSecondary },
  link: { color: colors.primary, textDecoration: "none", fontWeight: fontWeights.medium },
  actions: { display: "flex", gap: spacing.sm },
  columns: { display: "flex", flexWrap: "wrap", gap: spacing.lg, alignItems: "flex-start" },
  main: {
    flex: "2 1 420px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  },
  side: {
    flex: "1 1 300px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  },
  section: { ...card, padding: spacing.xl },
  sectionTitle: {
    margin: `0 0 ${spacing.lg}px`,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  detailRow: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: `${spacing.sm}px 0`,
  },
  detailLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: fontWeights.semibold,
  },
  detailValue: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    overflowWrap: "anywhere",
  },
  muted: { color: colors.textMuted },
  dealItem: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: `${spacing.md}px 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
  dealTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  dealMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
};

function DetailRow({ label, children }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{children || <span style={styles.muted}>-</span>}</span>
    </div>
  );
}

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getContactById, updateContact, deleteContact } = useContacts();
  const { getDealsByContact } = useDeals();
  const { getContactActivities, addActivity, deleteActivity } = useActivities();
  const { can, canModify } = usePermissions();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  
  const { loadContactActivities } = useData();

  useEffect(() => {
    loadContactActivities(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  const contact = getContactById(id);

  if (!contact) {
    return (
      <div style={styles.section}>
        <EmptyState
          title="Contact not found"
          message="This contact may have been deleted."
          action={<Button onClick={() => navigate("/contacts")}>Back to contacts</Button>}
        />
      </div>
    );
  }

  const deals = getDealsByContact(contact.id);
  const activities = getContactActivities(contact.id);
  const statusLabel =
    (contactStatuses.find((s) => s.key === contact.status) || {}).label || contact.status;

  function stageLabel(key) {
    const found = dealStages.find((s) => s.key === key);
    return found ? found.label : key;
  }

   async function handleSave(values) {
    const saved = await updateContact(contact.id, values);
    if (saved) setEditOpen(false);
  }

  function handleDelete() {
    deleteContact(contact.id);
    navigate("/contacts");
  }

  function handleAddActivity({ type, content }) {
  return addActivity({ contactId: contact.id, type, content });
  }

  function handleDeleteActivity() {
    deleteActivity(activityToDelete.id);
    setActivityToDelete(null);
  }

  const canEdit = canModify("contacts:edit", contact);
  const canDelete = canModify("contacts:delete", contact);

  return (
    <div>
      <Link to="/contacts" style={styles.back}>
        ← Back to contacts
      </Link>

      <div style={styles.headerCard}>
        <div style={styles.identity}>
          <Avatar name={contact.name} size={60} />
          <div>
            <h1 style={styles.name}>{contact.name}</h1>
            <p style={styles.role}>
              {contact.jobTitle || "No job title"}
              {contact.companyName && (
                <>
                  {" at "}
                  <Link to={`/companies/${contact.companyId}`} style={styles.link}>
                    {contact.companyName}
                  </Link>
                </>
              )}
            </p>
            <Badge status={contact.status}>{statusLabel}</Badge>
          </div>
        </div>

        <div style={styles.actions}>
          {canEdit && (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div style={styles.columns}>
        <div style={styles.main}>
          {can("activities:create") && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Log activity</h2>
              <NoteForm onSubmit={handleAddActivity} />
            </section>
          )}

          <section style={styles.section}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
              Activity ({activities.length})
            </h2>
            <ActivityLog activities={activities} onDelete={setActivityToDelete} />
          </section>
        </div>

        <div style={styles.side}>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Details</h2>
            <DetailRow label="Email">
              {contact.email && (
                <a href={`mailto:${contact.email}`} style={styles.link}>
                  {contact.email}
                </a>
              )}
            </DetailRow>
            <DetailRow label="Phone">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} style={styles.link}>
                  {contact.phone}
                </a>
              )}
            </DetailRow>
            <DetailRow label="Company">{contact.companyName}</DetailRow>
            <DetailRow label="Source">{contact.source}</DetailRow>
            <DetailRow label="Owner">{contact.ownerName}</DetailRow>
            <DetailRow label="Created">{formatDate(contact.createdAt)}</DetailRow>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Deals ({deals.length})</h2>
            {deals.length === 0 ? (
              <span style={styles.muted}>No deals linked to this contact yet.</span>
            ) : (
              deals.map((deal) => (
                <div key={deal.id} style={styles.dealItem}>
                  <span style={styles.dealTitle}>{deal.title}</span>
                  <div style={styles.dealMeta}>
                    <Badge stage={deal.stage}>{stageLabel(deal.stage)}</Badge>
                    <strong>{formatCurrency(deal.value)}</strong>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit contact" width={600}>
        <ContactForm
          contact={contact}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete contact"
        message={`Delete ${contact.name}? Their notes and activity log will be removed too. Deals linked to this contact will stay but lose the link.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={Boolean(activityToDelete)}
        title="Delete activity"
        message="Remove this entry from the activity log? This can't be undone."
        onConfirm={handleDeleteActivity}
        onCancel={() => setActivityToDelete(null)}
      />
    </div>
  );
}