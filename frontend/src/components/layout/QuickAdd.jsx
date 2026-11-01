// src/components/layout/QuickAdd.jsx
// The "+ New" button in the top bar. Opens one pop-up with tabs to create
// a contact, a company or a deal from any page. Only shows the tabs the
// current user is allowed to create.

import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ContactForm from "../contacts/ContactForm";
import CompanyForm from "../companies/CompanyForm";
import DealForm from "../deals/DealForm";
import { useContacts } from "../../hooks/useContacts";
import { useCompanies } from "../../hooks/useCompanies";
import { useDeals } from "../../hooks/useDeals";
import { useData } from "../../context/DataContext";
import { usePermissions } from "../../hooks/usePermissions";
import {
  colors,
  radius,
  shadows,
  spacing,
  fontSizes,
  fontWeights,
} from "../../styles/theme";

const allTabs = [
  { key: "contact", label: "Contact", permission: "contacts:create" },
  { key: "company", label: "Company", permission: "companies:create" },
  { key: "deal", label: "Deal", permission: "deals:create" },
];

const styles = {
  tabs: {
    display: "flex",
    gap: 4,
    padding: 4,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceMuted,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
  },
  tab: {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: radius.sm,
    backgroundColor: "transparent",
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  tabActive: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontWeight: fontWeights.semibold,
    boxShadow: shadows.sm,
  },
};

export default function QuickAdd() {
  const { addContact } = useContacts();
  const { addCompany } = useCompanies();
  const { addDeal } = useDeals();
  const { notify } = useData();
  const { can } = usePermissions();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("contact");

  const tabs = allTabs.filter((item) => can(item.permission));
  if (tabs.length === 0) return null; // for example a viewer

  const activeTab = tabs.some((item) => item.key === tab) ? tab : tabs[0].key;
  const activeLabel = tabs.find((item) => item.key === activeTab).label;

  const savers = {
    contact: addContact,
    company: addCompany,
    deal: addDeal,
  };

  function close() {
    setOpen(false);
  }

  // Only closes when the server accepted it; otherwise the form stays open with an error message.
  async function handleSubmit(values) {
    const saved = await savers[activeTab](values);
    if (saved) {
      close();
      notify(`${activeLabel} added`, "success");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New
      </Button>

      <Modal open={open} onClose={close} title="Create new" width={600}>
        {tabs.length > 1 && (
          <div style={styles.tabs} role="tablist">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={activeTab === item.key}
                style={{
                  ...styles.tab,
                  ...(activeTab === item.key ? styles.tabActive : {}),
                }}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === "contact" && (
          <ContactForm
            key="contact"
            onSubmit={handleSubmit}
            onCancel={close}
            submitLabel="Add contact"
          />
        )}
        {activeTab === "company" && (
          <CompanyForm
            key="company"
            onSubmit={handleSubmit}
            onCancel={close}
            submitLabel="Add company"
          />
        )}
        {activeTab === "deal" && (
          <DealForm
            key="deal"
            onSubmit={handleSubmit}
            onCancel={close}
            submitLabel="Add deal"
          />
        )}
      </Modal>
    </>
  );
}