// src/pages/Contacts.jsx

import { useMemo, useState } from "react";
import ContactTable from "../components/contacts/ContactTable";
import ContactForm from "../components/contacts/ContactForm";
import CsvImportModal from "../components/csv/CsvImportModal";
import SearchBar from "../components/ui/SearchBar";
import FilterBar from "../components/ui/FilterBar";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Button from "../components/ui/Button";
import { useContacts } from "../hooks/useContacts";
import { useCompanies } from "../hooks/useCompanies";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { contactStatuses } from "../data/mock";
import { exportContactsCsv } from "../utils/csv";
import { colors, pageTitle, spacing, fontSizes } from "../styles/theme";

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
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
};

const emptyFilters = { status: "", companyId: "", ownerId: "" };

export default function Contacts() {
  const { contacts, addContact, updateContact, deleteContact } = useContacts();
  const { companies } = useCompanies();
  const { users } = useAuth();
  const { can } = usePermissions();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [formState, setFormState] = useState({ open: false, contact: null });
  const [contactToDelete, setContactToDelete] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return contacts.filter((contact) => {
      if (filters.status && contact.status !== filters.status) return false;
      if (filters.companyId && contact.companyId !== filters.companyId) return false;
      if (filters.ownerId && contact.ownerId !== filters.ownerId) return false;

      if (!term) return true;
      return [
        contact.name,
        contact.email,
        contact.phone,
        contact.jobTitle,
        contact.companyName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [contacts, search, filters]);

  const filterConfig = [
    {
      key: "status",
      label: "Status",
      options: contactStatuses.map((s) => ({ value: s.key, label: s.label })),
    },
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

  function openAddForm() {
    setFormState({ open: true, contact: null });
  }

  function openEditForm(contact) {
    setFormState({ open: true, contact });
  }

  function closeForm() {
    setFormState({ open: false, contact: null });
  }

  async function handleSubmit(values) {
  const saved = formState.contact
    ? await updateContact(formState.contact.id, values)
    : await addContact(values);
  if (saved) closeForm();
}

  function handleConfirmDelete() {
    deleteContact(contactToDelete.id);
    setContactToDelete(null);
  }

  const canCreate = can("contacts:create");
  const addButton = canCreate ? <Button onClick={openAddForm}>Add contact</Button> : null;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={pageTitle}>Contacts</h1>
          <p style={styles.subtitle}>
            {filteredContacts.length === contacts.length
              ? `${contacts.length} contacts`
              : `${filteredContacts.length} of ${contacts.length} contacts`}
          </p>
        </div>

        <div style={styles.headerActions}>
          {can("data:export") && (
            <Button
              variant="secondary"
              disabled={filteredContacts.length === 0}
              onClick={() => exportContactsCsv(filteredContacts)}
            >
              Export CSV
            </Button>
          )}
          {can("data:import") && (
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              Import CSV
            </Button>
          )}
          {addButton}
        </div>
      </div>

      <div style={styles.toolbar}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search name, email, company..."
        />
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onClear={() => setFilters(emptyFilters)}
        />
      </div>

      <ContactTable
        contacts={filteredContacts}
        onEdit={openEditForm}
        onDelete={setContactToDelete}
        emptyAction={contacts.length === 0 ? addButton : null}
      />

      <Modal
        open={formState.open}
        onClose={closeForm}
        title={formState.contact ? "Edit contact" : "Add contact"}
        width={600}
      >
        <ContactForm
          key={formState.contact ? formState.contact.id : "new"}
          contact={formState.contact}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          submitLabel={formState.contact ? "Save changes" : "Add contact"}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(contactToDelete)}
        title="Delete contact"
        message={
          contactToDelete
            ? `Delete ${contactToDelete.name}? Their notes and activity log will be removed too. Deals linked to this contact will stay but lose the link.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setContactToDelete(null)}
      />

      <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}