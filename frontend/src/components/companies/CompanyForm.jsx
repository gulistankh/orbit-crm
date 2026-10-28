// src/components/companies/CompanyForm.jsx
// <CompanyForm company={existingOrNull} onSubmit={(values) => ...} onCancel={...} />

import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { industries } from "../../data/mock";
import { roleLabels } from "../../utils/permissions";
import { spacing } from "../../styles/theme";

const styles = {
  form: { display: "flex", flexDirection: "column", gap: spacing.lg },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
    gap: spacing.lg,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
};

export default function CompanyForm({
  company,
  onSubmit,
  onCancel,
  submitLabel = "Save company",
}) {
  const { users, currentUser } = useAuth();
  const { can } = usePermissions();
  const canAssign = can("users:view"); // admins and managers

  const [values, setValues] = useState({
    name: company?.name || "",
    industry: company?.industry || "",
    website: company?.website || "",
    employees: company?.employees ? String(company.employees) : "",
    city: company?.city || "",
    country: company?.country || "",
    ownerId: company?.ownerId || currentUser?.id || "",
  });
  const [errors, setErrors] = useState({});

  // Keep an unlisted industry (for example from an import) selectable
  const industryOptions =
    !values.industry || industries.includes(values.industry)
      ? industries
      : [...industries, values.industry];

  const ownerOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (${roleLabels[u.role]})`,
  }));

  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = "Company name is required.";
    const employees = values.employees.trim();
    if (employees && !/^\d+$/.test(employees)) {
      next.employees = "Use a whole number, like 50.";
    }
    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: values.name.trim(),
      industry: values.industry,
      website: values.website.trim(),
      employees: values.employees.trim() ? Number(values.employees.trim()) : 0,
      city: values.city.trim(),
      country: values.country.trim(),
    };
    if (canAssign) payload.ownerId = values.ownerId;

    onSubmit(payload);
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Company name"
        value={values.name}
        onChange={(e) => setField("name", e.target.value)}
        error={errors.name}
        autoFocus
      />

      <div style={styles.grid}>
        <Select
          label="Industry"
          placeholder="Select industry"
          options={industryOptions}
          value={values.industry}
          onChange={(e) => setField("industry", e.target.value)}
        />
        <Input
          label="Employees"
          inputMode="numeric"
          value={values.employees}
          onChange={(e) => setField("employees", e.target.value)}
          error={errors.employees}
        />
      </div>

      <Input
        label="Website"
        placeholder="example.com"
        value={values.website}
        onChange={(e) => setField("website", e.target.value)}
      />

      <div style={styles.grid}>
        <Input
          label="City"
          value={values.city}
          onChange={(e) => setField("city", e.target.value)}
        />
        <Input
          label="Country"
          value={values.country}
          onChange={(e) => setField("country", e.target.value)}
        />
      </div>

      {canAssign && (
        <Select
          label="Owner"
          options={ownerOptions}
          value={values.ownerId}
          onChange={(e) => setField("ownerId", e.target.value)}
        />
      )}

      <div style={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
