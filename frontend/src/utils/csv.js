// src/utils/csv.js
// CSV import (parse) and export (build + download).
// No libraries needed. Handles quotes, line breaks inside cells, and ; or , separators.

import { dealStages } from "../data/mock";

export const MAX_IMPORT_ROWS = 2000;

export const contactFieldLabels = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  jobTitle: "Job title",
  companyName: "Company",
  status: "Status",
  source: "Source",
};

// ---------- parsing ----------

export function parseCsv(text) {
  const input = text.replace(/^\uFEFF/, "");
  const firstLine = input.split(/\r?\n/, 1)[0] || "";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const delimiter = semicolons > commas ? ";" : ",";

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

// Different tools name their columns differently, so we match many spellings.
const headerAliases = {
  firstname: "firstName",
  first: "firstName",
  givenname: "firstName",
  forename: "firstName",
  lastname: "lastName",
  last: "lastName",
  surname: "lastName",
  familyname: "lastName",
  name: "fullName",
  fullname: "fullName",
  contactname: "fullName",
  email: "email",
  emailaddress: "email",
  mail: "email",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  tel: "phone",
  telephone: "phone",
  cell: "phone",
  jobtitle: "jobTitle",
  title: "jobTitle",
  position: "jobTitle",
  role: "jobTitle",
  jobrole: "jobTitle",
  company: "companyName",
  companyname: "companyName",
  organization: "companyName",
  organisation: "companyName",
  employer: "companyName",
  status: "status",
  leadstatus: "status",
  source: "source",
  leadsource: "source",
};

function normalizeHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Turns CSV text into contact objects ready for importContacts().
export function parseContactsCsv(text) {
  const table = parseCsv(text);

  if (table.length < 2) {
    return { rows: [], columns: [], ignoredColumns: [], error: "The file needs a header row and at least one contact." };
  }

  const headerKeys = table[0].map((header) => headerAliases[normalizeHeader(header)] || null);
  const hasName =
    headerKeys.includes("firstName") ||
    headerKeys.includes("lastName") ||
    headerKeys.includes("fullName");

  if (!hasName) {
    return {
      rows: [],
      columns: [],
      ignoredColumns: [],
      error: "Couldn't find a name column. Use \"First name\" and \"Last name\" (or \"Name\").",
    };
  }

  if (table.length - 1 > MAX_IMPORT_ROWS) {
    return {
      rows: [],
      columns: [],
      ignoredColumns: [],
      error: `That file has more than ${MAX_IMPORT_ROWS} rows. Please split it into smaller files.`,
    };
  }

  const rows = table.slice(1).map((cells) => {
    const contact = {};
    headerKeys.forEach((key, index) => {
      if (key && contact[key] === undefined) {
        contact[key] = (cells[index] || "").trim();
      }
    });

    if (!contact.firstName && !contact.lastName && contact.fullName) {
      const parts = contact.fullName.split(/\s+/);
      contact.firstName = parts[0];
      contact.lastName = parts.slice(1).join(" ");
    }
    delete contact.fullName;
    return contact;
  });

  const columns = [];
  headerKeys.forEach((key) => {
    const finalKey = key === "fullName" ? "firstName" : key;
    if (finalKey && !columns.includes(finalKey)) columns.push(finalKey);
    if (key === "fullName" && !columns.includes("lastName")) columns.push("lastName");
  });

  const ignoredColumns = table[0].filter((header, index) => !headerKeys[index] && header.trim());

  return { rows, columns, ignoredColumns, error: null };
}

// ---------- exporting ----------

// Stops spreadsheet apps from running a cell that starts like a formula.
function sanitizeCell(text) {
  if (/^[=@\t\r]/.test(text)) return `'${text}`;
  if (/^[+-]/.test(text) && !/^[+-]?[\d\s().-]+$/.test(text)) return `'${text}`;
  return text;
}

function escapeCell(value) {
  const text = sanitizeCell(String(value === null || value === undefined ? "" : value));
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// columns: [{ header: "Name", key: "name" }, { header: "Value", value: (row) => row.value }]
export function toCsv(rows, columns) {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCell(typeof c.value === "function" ? c.value(row) : row[c.key]))
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

export function downloadCsv(filename, csvText) {
  // The BOM at the start makes Excel read accents and symbols correctly.
  const blob = new Blob(["\uFEFF" + csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

export function exportContactsCsv(contacts) {
  const csv = toCsv(contacts, [
    { header: "First name", key: "firstName" },
    { header: "Last name", key: "lastName" },
    { header: "Email", key: "email" },
    { header: "Phone", key: "phone" },
    { header: "Job title", key: "jobTitle" },
    { header: "Company", key: "companyName" },
    { header: "Status", key: "status" },
    { header: "Source", key: "source" },
    { header: "Owner", key: "ownerName" },
    { header: "Created", key: "createdAt" },
  ]);
  downloadCsv(`contacts-${today()}.csv`, csv);
}

export function exportCompaniesCsv(companies) {
  const csv = toCsv(companies, [
    { header: "Name", key: "name" },
    { header: "Industry", key: "industry" },
    { header: "Website", key: "website" },
    { header: "Employees", key: "employees" },
    { header: "City", key: "city" },
    { header: "Country", key: "country" },
    { header: "Contacts", key: "contactCount" },
    { header: "Open deal value", key: "openDealValue" },
    { header: "Owner", key: "ownerName" },
    { header: "Created", key: "createdAt" },
  ]);
  downloadCsv(`companies-${today()}.csv`, csv);
}

export function exportDealsCsv(deals) {
  const stageLabel = (key) => {
    const found = dealStages.find((s) => s.key === key);
    return found ? found.label : key;
  };
  const csv = toCsv(deals, [
    { header: "Title", key: "title" },
    { header: "Value", key: "value" },
    { header: "Stage", value: (deal) => stageLabel(deal.stage) },
    { header: "Company", key: "companyName" },
    { header: "Contact", key: "contactName" },
    { header: "Owner", key: "ownerName" },
    { header: "Expected close", key: "expectedCloseDate" },
    { header: "Created", key: "createdAt" },
  ]);
  downloadCsv(`deals-${today()}.csv`, csv);
}

export function downloadContactTemplate() {
  const csv = toCsv(
    [
      {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com",
        phone: "+1 555 0100",
        jobTitle: "Operations Manager",
        companyName: "Example Ltd",
        status: "lead",
        source: "Website",
      },
    ],
    Object.keys(contactFieldLabels).map((key) => ({ header: contactFieldLabels[key], key }))
  );
  downloadCsv("contacts-template.csv", csv);
}