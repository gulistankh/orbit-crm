// src/components/deals/DealForm.jsx
// <DealForm deal={existingOrNull} defaultStage="lead" onSubmit={(values) => ...} onCancel={...} />

import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useCompanies } from "../../hooks/useCompanies";
import { useContacts } from "../../hooks/useContacts";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { dealStages } from "../../data/mock";
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

export default function DealForm({
  deal,
  defaultStage = "lead",
  onSubmit,
  onCancel,
  submitLabel = "Save deal",
}) {
  const { companies } = useCompanies();
  const { contacts } = useContacts();
  const { users, currentUser } = useAuth();
  const { can } = usePermissions();
  const canAssign = can("users:view"); // admins and managers

  const [values, setValues] = useState({
    title: deal?.title || "",
    value: deal ? String(deal.value) : "",
    stage: deal?.stage || defaultStage,
    companyId: deal?.companyId || "",
    contactId: deal?.contactId || "",
    expectedCloseDate: deal?.expectedCloseDate || "",
    ownerId: deal?.ownerId || currentUser?.id || "",
  });
  const [errors, setErrors] = useState({});

  const stageOptions = dealStages.map((s) => ({ value: s.key, label: s.label }));

  const companyOptions = [...companies]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.id, label: c.name }));

  // If a company is chosen, only show that company's contacts
  const contactOptions = contacts
    .filter((c) => !values.companyId || c.companyId === values.companyId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.id, label: c.name }));

  const ownerOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (${roleLabels[u.role]})`,
  }));

  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // Changing the company clears a contact that belongs to a different company
  function handleCompanyChange(companyId) {
    setValues((prev) => {
      const contact = contacts.find((c) => c.id === prev.contactId);
      const keepContact = !companyId || !contact || contact.companyId === companyId;
      return { ...prev, companyId, contactId: keepContact ? prev.contactId : "" };
    });
  }

  // Picking a contact fills in their company if none is chosen yet
  function handleContactChange(contactId) {
    setValues((prev) => {
      const contact = contacts.find((c) => c.id === contactId);
      const fillCompany = contact && contact.companyId && !prev.companyId;
      return {
        ...prev,
        contactId,
        companyId: fillCompany ? contact.companyId : prev.companyId,
      };
    });
  }

  function validate() {
    const next = {};
    if (!values.title.trim()) next.title = "Deal title is required.";
    const amount = values.value.trim();
    if (!amount) next.value = "Value is required.";
    else if (!/^\d+(\.\d{1,2})?$/.test(amount)) next.value = "Use a number, like 12000.";
    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: values.title.trim(),
      value: Number(values.value.trim()),
      stage: values.stage,
      companyId: values.companyId || null,
      contactId: values.contactId || null,
      expectedCloseDate: values.expectedCloseDate,
    };
    if (canAssign) payload.ownerId = values.ownerId;

    onSubmit(payload);
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Deal title"
        value={values.title}
        onChange={(e) => setField("title", e.target.value)}
        error={errors.title}
        autoFocus
      />

      <div style={styles.grid}>
        <Input
          label="Value (USD)"
          inputMode="decimal"
          value={values.value}
          onChange={(e) => setField("value", e.target.value)}
          error={errors.value}
        />
        <Select
          label="Stage"
          options={stageOptions}
          value={values.stage}
          onChange={(e) => setField("stage", e.target.value)}
        />
      </div>

      <div style={styles.grid}>
        <Select
          label="Company"
          placeholder="No company"
          options={companyOptions}
          value={values.companyId}
          onChange={(e) => handleCompanyChange(e.target.value)}
        />
        <Select
          label="Contact"
          placeholder="No contact"
          options={contactOptions}
          value={values.contactId}
          onChange={(e) => handleContactChange(e.target.value)}
        />
      </div>

      <div style={styles.grid}>
        <Input
          label="Expected close date"
          type="date"
          value={values.expectedCloseDate}
          onChange={(e) => setField("expectedCloseDate", e.target.value)}
        />
        {canAssign && (
          <Select
            label="Owner"
            options={ownerOptions}
            value={values.ownerId}
            onChange={(e) => setField("ownerId", e.target.value)}
          />
        )}
      </div>

      <div style={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
