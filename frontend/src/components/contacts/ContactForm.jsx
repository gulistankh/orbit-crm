// src/components/contacts/ContactForm.jsx
// <ContactForm contact={existingOrNull} onSubmit={(values) => ...} onCancel={...} />

import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useCompanies } from "../../hooks/useCompanies";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { contactStatuses, contactSources } from "../../data/mock";
import { roleLabels } from "../../utils/permissions";
import { spacing } from "../../styles/theme";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function ContactForm({
  contact,
  defaultCompanyId = "",
  onSubmit,
  onCancel,
  submitLabel = "Save contact",
}) {
  const { companies } = useCompanies();
  const { users, currentUser } = useAuth();
  const { can } = usePermissions();
  const canAssign = can("users:view"); // admins and managers

  const [values, setValues] = useState({
    firstName: contact?.firstName || "",
    lastName: contact?.lastName || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    jobTitle: contact?.jobTitle || "",
    companyId: contact?.companyId || defaultCompanyId || "",
    status: contact?.status || "lead",
    source: contact?.source || "",
    ownerId: contact?.ownerId || currentUser?.id || "",
  });
  const [errors, setErrors] = useState({});

  const companyOptions = [...companies]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.id, label: c.name }));

  const statusOptions = contactStatuses.map((s) => ({ value: s.key, label: s.label }));

  // Keep an unusual source (like "Import") selectable
  const sourceOptions =
    !values.source || contactSources.includes(values.source)
      ? contactSources
      : [...contactSources, values.source];

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
    if (!values.firstName.trim()) next.firstName = "First name is required.";
    if (!values.lastName.trim()) next.lastName = "Last name is required.";
    if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      jobTitle: values.jobTitle.trim(),
      companyId: values.companyId || null,
      status: values.status,
      source: values.source,
    };
    if (canAssign) payload.ownerId = values.ownerId;

    onSubmit(payload);
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit} noValidate>
      <div style={styles.grid}>
        <Input
          label="First name"
          value={values.firstName}
          onChange={(e) => setField("firstName", e.target.value)}
          error={errors.firstName}
          autoFocus
        />
        <Input
          label="Last name"
          value={values.lastName}
          onChange={(e) => setField("lastName", e.target.value)}
          error={errors.lastName}
        />
      </div>

      <div style={styles.grid}>
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label="Phone"
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
        />
      </div>

      <div style={styles.grid}>
        <Input
          label="Job title"
          value={values.jobTitle}
          onChange={(e) => setField("jobTitle", e.target.value)}
        />
        <Select
          label="Company"
          placeholder="No company"
          options={companyOptions}
          value={values.companyId}
          onChange={(e) => setField("companyId", e.target.value)}
        />
      </div>

      <div style={styles.grid}>
        <Select
          label="Status"
          options={statusOptions}
          value={values.status}
          onChange={(e) => setField("status", e.target.value)}
        />
        <Select
          label="Source"
          placeholder="Select source"
          options={sourceOptions}
          value={values.source}
          onChange={(e) => setField("source", e.target.value)}
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