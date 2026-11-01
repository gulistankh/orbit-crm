 // src/pages/Companies.jsx

import { useMemo, useState } from "react";
import CompanyTable from "../components/companies/CompanyTable";
import CompanyForm from "../components/companies/CompanyForm";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Button from "../components/ui/Button";
import { useCompanies } from "../hooks/useCompanies";
import { usePermissions } from "../hooks/usePermissions";
import { exportCompaniesCsv } from "../utils/csv";
import { colors, pageTitle, spacing, fontSizes } from "../styles/theme";
import FilterChips from "../components/ui/FilterChips";
import { usePageFilters } from "../hooks/usePageFilters";

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


export default function Companies() {
  const { companies, addCompany, updateCompany, deleteCompany } = useCompanies();
  const { can } = usePermissions();
  const { search, values: filters, definitions, count, setFilter, clearFilters } =
  usePageFilters();
  const [formState, setFormState] = useState({ open: false, company: null });
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    return companies.filter((company) => {
      if (filters.industry && company.industry !== filters.industry) return false;
      if (filters.ownerId && company.ownerId !== filters.ownerId) return false;

      if (!term) return true;
      return [company.name, company.industry, company.city, company.country, company.website]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [companies, search, filters]);

  function closeForm() {
    setFormState({ open: false, company: null });
  }

  async function handleSubmit(values) {
    const saved = formState.company
      ? await updateCompany(formState.company.id, values)
      : await addCompany(values);
    if (saved) closeForm();
  }

  function handleConfirmDelete() {
    deleteCompany(companyToDelete.id);
    setCompanyToDelete(null);
  }

  const addButton = can("companies:create") ? (
    <Button onClick={() => setFormState({ open: true, company: null })}>Add company</Button>
  ) : null;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={pageTitle}>Companies</h1>
          <p style={styles.subtitle}>
            {filteredCompanies.length === companies.length
              ? `${companies.length} companies`
              : `${filteredCompanies.length} of ${companies.length} companies`}
          </p>
        </div>

        <div style={styles.headerActions}>
          {can("data:export") && (
            <Button
              variant="secondary"
              disabled={filteredCompanies.length === 0}
              onClick={() => exportCompaniesCsv(filteredCompanies)}
            >
              Export CSV
            </Button>
          )}
          {addButton}
        </div>
      </div>

      <div style={styles.toolbar}>
       {count > 0 && (
          <div style={styles.toolbar}>
            <FilterChips
              filters={definitions}
              values={filters}
              onChange={setFilter}
              onClear={clearFilters}
            />
          </div>
        )}
      </div>

      <CompanyTable
        companies={filteredCompanies}
        onEdit={(company) => setFormState({ open: true, company })}
        onDelete={setCompanyToDelete}
        emptyAction={companies.length === 0 ? addButton : null}
      />

      <Modal
        open={formState.open}
        onClose={closeForm}
        title={formState.company ? "Edit company" : "Add company"}
        width={600}
      >
        <CompanyForm
          key={formState.company ? formState.company.id : "new"}
          company={formState.company}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          submitLabel={formState.company ? "Save changes" : "Add company"}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(companyToDelete)}
        title="Delete company"
        message={
          companyToDelete
            ? `Delete ${companyToDelete.name}? Its contacts and deals will stay, but they will no longer be linked to a company.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setCompanyToDelete(null)}
      />
    </div>
  );
}