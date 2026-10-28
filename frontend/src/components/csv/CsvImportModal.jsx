// src/components/csv/CsvImportModal.jsx
// <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} />

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useContacts } from "../../hooks/useContacts";
import {
  parseContactsCsv,
  downloadContactTemplate,
  contactFieldLabels,
} from "../../utils/csv";
import {
  colors,
  radius,
  spacing,
  fontSizes,
  fontWeights,
} from "../../styles/theme";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const PREVIEW_FIELDS = ["firstName", "lastName", "email", "companyName", "status"];

const styles = {
  body: { display: "flex", flexDirection: "column", gap: spacing.lg },
  text: {
    margin: 0,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  dropzone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: spacing.xl,
    border: `2px dashed ${colors.borderStrong}`,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    textAlign: "center",
    cursor: "pointer",
  },
  dropzoneStrong: { color: colors.primary, fontWeight: fontWeights.semibold },
  errorBox: {
    padding: "10px 12px",
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    color: "#B91C1C",
    fontSize: fontSizes.sm,
  },
  successBox: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    color: "#15803D",
    fontSize: fontSizes.md,
    lineHeight: 1.6,
  },
  warnBox: {
    padding: "10px 12px",
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    color: "#B45309",
    fontSize: fontSizes.sm,
  },
  summaryTitle: {
    margin: 0,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  previewWrap: {
    overflowX: "auto",
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: fontSizes.sm },
  th: {
    padding: "8px 12px",
    textAlign: "left",
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.xs,
    whiteSpace: "nowrap",
    borderBottom: `1px solid ${colors.border}`,
  },
  td: {
    padding: "8px 12px",
    color: colors.textPrimary,
    whiteSpace: "nowrap",
    borderBottom: `1px solid ${colors.border}`,
  },
  footer: { display: "flex", justifyContent: "flex-end", gap: spacing.sm },
};

export default function CsvImportModal({ open, onClose }) {
  const { importContacts } = useContacts();
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState(null);
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState(null);

  function handleClose() {
    setFileName("");
    setParsed(null);
    setFileError("");
    setResult(null);
    onClose();
  }

  async function handleFile(event) {
    const file = event.target.files[0];
    event.target.value = ""; // lets you pick the same file again
    if (!file) return;

    setParsed(null);
    setResult(null);
    setFileError("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileError("Please choose a .csv file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("That file is too large. The limit is 2 MB.");
      return;
    }

    try {
      const text = await file.text();
      const next = parseContactsCsv(text);
      setFileName(file.name);
      if (next.error) setFileError(next.error);
      else setParsed(next);
    } catch {
      setFileError("Couldn't read that file.");
    }
  }

   async function handleImport() {
    const summary = await importContacts(parsed.rows);
    if (summary) setResult(summary);
  }

  const previewColumns = parsed ? PREVIEW_FIELDS.filter((f) => parsed.columns.includes(f)) : [];
  const missingNames = parsed
    ? parsed.rows.filter((row) => !row.firstName && !row.lastName).length
    : 0;

  let footer;
  if (result) {
    footer = <Button onClick={handleClose}>Done</Button>;
  } else {
    footer = (
      <>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        {parsed && (
          <Button onClick={handleImport}>
            Import {parsed.rows.length} contact{parsed.rows.length === 1 ? "" : "s"}
          </Button>
        )}
      </>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import contacts from CSV" width={640} footer={footer}>
      <div style={styles.body}>
        {result ? (
          <div style={styles.successBox}>
            <p style={styles.summaryTitle}>Import finished</p>
            Added {result.added} contact{result.added === 1 ? "" : "s"}.
            <br />
            Skipped {result.skipped} (duplicate email or no name).
            <br />
            Created {result.companiesCreated} new compan{result.companiesCreated === 1 ? "y" : "ies"}.
          </div>
        ) : (
          <>
            <p style={styles.text}>
              Upload a CSV with a header row. We look for First name, Last name, Email, Phone,
              Job title, Company, Status and Source. Contacts with an email that already
              exists are skipped, and unknown companies are created for you.
            </p>

            <label style={styles.dropzone}>
              <input
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={handleFile}
              />
              <span>
                <span style={styles.dropzoneStrong}>Click to choose a CSV file</span>
              </span>
              <span>{fileName ? `Selected: ${fileName}` : "Up to 2 MB, 2000 rows"}</span>
            </label>

            <div>
              <Button variant="ghost" size="sm" onClick={downloadContactTemplate}>
                Download a template
              </Button>
            </div>

            {fileError && <div style={styles.errorBox}>{fileError}</div>}

            {parsed && (
              <>
                <p style={styles.summaryTitle}>
                  Found {parsed.rows.length} row{parsed.rows.length === 1 ? "" : "s"}. Preview of the
                  first {Math.min(5, parsed.rows.length)}:
                </p>
                <div style={styles.previewWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {previewColumns.map((field) => (
                          <th key={field} style={styles.th}>
                            {contactFieldLabels[field]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {previewColumns.map((field) => (
                            <td key={field} style={styles.td}>
                              {row[field] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {missingNames > 0 && (
                  <div style={styles.warnBox}>
                    {missingNames} row{missingNames === 1 ? " has" : "s have"} no name and will be
                    skipped.
                  </div>
                )}
                {parsed.ignoredColumns.length > 0 && (
                  <div style={styles.warnBox}>
                    These columns weren't recognized and will be ignored:{" "}
                    {parsed.ignoredColumns.join(", ")}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}