// src/pages/CompanyDetail.jsx
// One company: details, its contacts, and its deals.

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CompanyForm from "../components/companies/CompanyForm";
import ContactForm from "../components/contacts/ContactForm";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { useCompanies } from "../hooks/useCompanies";
import { useContacts } from "../hooks/useContacts";
import { useDeals } from "../hooks/useDeals";
import { usePermissions } from "../hooks/usePermissions";
import { contactStatuses, dealStages } from "../data/mock";
import { formatCurrency, formatDate } from "../utils/formatters";
import TimeStamp from "../components/ui/TimeStamp";
import { card, colors, spacing, fontSizes, fontWeights } from "../styles/theme";

// Only allow normal web links, never things like javascript:
function toWebsiteUrl(site) {
  if (!site) return null;
  const trimmed = site.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  return `https://${trimmed}`;
}

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
  sub: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 8,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  link: { color: colors.primary, textDecoration: "none", fontWeight: fontWeights.medium },
  actions: { display: "flex", gap: spacing.sm },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: { ...card, padding: spacing.lg },
  statLabel: { fontSize: fontSizes.sm, color: colors.textSecondary },
  statValue: {
    marginTop: 4,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  columns: { display: "flex", flexWrap: "wrap", gap: spacing.lg, alignItems: "flex-start" },
  main: {
    flex: "2 1 420px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  },
  side: { flex: "1 1 280px", minWidth: 0 },
  section: { ...card, padding: spacing.xl },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    margin: 0,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: `${spacing.md}px 0`,
    borderBottom: `1px solid ${colors.border}`,
  },
  rowMain: { display: "flex", alignItems: "center", gap: spacing.md, minWidth: 0 },
  rowTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
    textDecoration: "none",
  },
  rowMeta: { fontSize: fontSizes.sm, color: colors.textMuted },
  rowRight: { textAlign: "right", flexShrink: 0 },
  detailRow: { display: "flex", flexDirection: "column", gap: 2, padding: `${spacing.sm}px 0` },
  detailLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: fontWeights.semibold,
  },
  detailValue: { fontSize: fontSizes.md, color: colors.textPrimary, overflowWrap: "anywhere" },
  muted: { color: colors.textMuted },
};

function DetailRow({ label, children }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{children || <span style={styles.muted}>-</span>}</span>
    </div>
  );
}

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getCompanyById, updateCompany, deleteCompany } = useCompanies();
  const { getContactsByCompany, addContact } = useContacts();
  const { getDealsByCompany } = useDeals();
  const { can, canModify } = usePermissions();

  const [editOpen, setEditOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const company = getCompanyById(id);

  if (!company) {
    return (
      <div style={styles.section}>
        <EmptyState
          title="Company not found"
          message="This company may have been deleted."
          action={<Button onClick={() => navigate("/companies")}>Back to companies</Button>}
        />
      </div>
    );
  }

  const contacts = getContactsByCompany(company.id);
  const deals = getDealsByCompany(company.id);
  const wonValue = deals
    .filter((deal) => deal.stage === "won")
    .reduce((sum, deal) => sum + deal.value, 0);
  const websiteUrl = toWebsiteUrl(company.website);
  const location = [company.city, company.country].filter(Boolean).join(", ");

  function statusLabel(key) {
    const found = contactStatuses.find((s) => s.key === key);
    return found ? found.label : key;
  }

  function stageLabel(key) {
    const found = dealStages.find((s) => s.key === key);
    return found ? found.label : key;
  }

  async function handleSave(values) {
  const saved = await updateCompany(company.id, values);
  if (saved) setEditOpen(false);
  }

  async function handleAddContact(values) {
  const saved = await addContact({ ...values, companyId: company.id });
  if (saved) setContactOpen(false);
  }

  function handleDelete() {
    deleteCompany(company.id);
    navigate("/companies");
  }

  return (
    <div>
      <Link to="/companies" style={styles.back}>
        ← Back to companies
      </Link>

      <div style={styles.headerCard}>
        <div style={styles.identity}>
          <Avatar name={company.name} size={60} />
          <div>
            <h1 style={styles.name}>{company.name}</h1>
            <div style={styles.sub}>
              {company.industry && <Badge tone="primary">{company.industry}</Badge>}
              {location && <span>{location}</span>}
              {websiteUrl && (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  {company.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          {canModify("companies:edit", company) && (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          )}
          {canModify("companies:delete", company) && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Open deals</div>
          <div style={styles.statValue}>{formatCurrency(company.openDealValue)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Won revenue</div>
          <div style={styles.statValue}>{formatCurrency(wonValue)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Contacts</div>
          <div style={styles.statValue}>{contacts.length}</div>
        </div>
      </div>

      <div style={styles.columns}>
        <div style={styles.main}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Contacts ({contacts.length})</h2>
              {can("contacts:create") && (
                <Button size="sm" variant="secondary" onClick={() => setContactOpen(true)}>
                  Add contact
                </Button>
              )}
            </div>
            {contacts.length === 0 ? (
              <span style={styles.muted}>No contacts at this company yet.</span>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} style={styles.row}>
                  <div style={styles.rowMain}>
                    <Avatar name={contact.name} size={34} />
                    <div>
                      <Link to={`/contacts/${contact.id}`} style={styles.rowTitle}>
                        {contact.name}
                      </Link>
                      <div style={styles.rowMeta}>{contact.jobTitle || "No job title"}</div>
                    </div>
                  </div>
                  <Badge status={contact.status}>{statusLabel(contact.status)}</Badge>
                </div>
              ))
            )}
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Deals ({deals.length})</h2>
            </div>
            {deals.length === 0 ? (
              <span style={styles.muted}>No deals with this company yet.</span>
            ) : (
              deals.map((deal) => (
                <div key={deal.id} style={styles.row}>
                  <div>
                    <div style={styles.rowTitle}>{deal.title}</div>
                    <div style={styles.rowMeta}>
                      Close {formatDate(deal.expectedCloseDate)}
                      {deal.contactName ? ` · ${deal.contactName}` : ""}
                    </div>
                  </div>
                  <div style={styles.rowRight}>
                    <div style={styles.rowTitle}>{formatCurrency(deal.value)}</div>
                    <Badge stage={deal.stage}>{stageLabel(deal.stage)}</Badge>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>

        <div style={styles.side}>
          <section style={styles.section}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: spacing.md }}>Details</h2>
            <DetailRow label="Industry">{company.industry}</DetailRow>
            <DetailRow label="Website">
              {websiteUrl && (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  {company.website}
                </a>
              )}
            </DetailRow>
            <DetailRow label="Employees">
              {company.employees ? company.employees.toLocaleString() : ""}
            </DetailRow>
            <DetailRow label="Location">{location}</DetailRow>
            <DetailRow label="Owner">{company.ownerName}</DetailRow>
            <DetailRow label="Created">
              <TimeStamp value={company.createdAt} />
            </DetailRow>
          </section>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit company" width={600}>
        <CompanyForm
          company={company}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Modal>

      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Add contact at ${company.name}`}
        width={600}
      >
        <ContactForm
          defaultCompanyId={company.id}
          onSubmit={handleAddContact}
          onCancel={() => setContactOpen(false)}
          submitLabel="Add contact"
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete company"
        message={`Delete ${company.name}? Its contacts and deals will stay, but they will no longer be linked to a company.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}