// src/data/mock.js
// Fake data shaped like the future database tables.
// Relationships use ids: contact.companyId -> company.id, deal.contactId -> contact.id, etc.

export const roles = ["admin", "manager", "sales_rep", "viewer"];

export const dealStages = [
  { key: "lead", label: "Lead" },
  { key: "contacted", label: "Contacted" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

export const contactStatuses = [
  { key: "lead", label: "Lead" },
  { key: "active", label: "Active" },
  { key: "customer", label: "Customer" },
  { key: "inactive", label: "Inactive" },
];

export const contactSources = ["Website", "Referral", "LinkedIn", "Event", "Cold outreach"];

export const industries = [
  "Software",
  "Healthcare",
  "Logistics",
  "Food & Beverage",
  "Construction",
  "Education",
  "Finance",
  "Media",
];

export const activityTypes = [
  { key: "note", label: "Note" },
  { key: "call", label: "Call" },
  { key: "email", label: "Email" },
  { key: "meeting", label: "Meeting" },
];

export const users = [
  { id: "u1", name: "Sara Mitchell", email: "sara@demo.com", role: "admin" },
  { id: "u2", name: "Daniel Okafor", email: "daniel@demo.com", role: "manager" },
  { id: "u3", name: "Lina Haddad", email: "lina@demo.com", role: "sales_rep" },
  { id: "u4", name: "Tom Becker", email: "tom@demo.com", role: "viewer" },
];

export const companies = [
  { id: "c1", name: "Northwind Logistics", industry: "Logistics", website: "northwind-logistics.com", employees: 120, city: "Rotterdam", country: "Netherlands", ownerId: "u2", createdAt: "2026-03-04" },
  { id: "c2", name: "Brightpath Health", industry: "Healthcare", website: "brightpathhealth.com", employees: 45, city: "Leeds", country: "United Kingdom", ownerId: "u3", createdAt: "2026-04-12" },
  { id: "c3", name: "Kestrel Software", industry: "Software", website: "kestrelsoft.io", employees: 30, city: "Berlin", country: "Germany", ownerId: "u3", createdAt: "2026-04-28" },
  { id: "c4", name: "Lumen Foods", industry: "Food & Beverage", website: "lumenfoods.com", employees: 210, city: "Lyon", country: "France", ownerId: "u2", createdAt: "2026-05-09" },
  { id: "c5", name: "Atlas Construction", industry: "Construction", website: "atlasbuild.co", employees: 80, city: "Madrid", country: "Spain", ownerId: "u3", createdAt: "2026-05-21" },
  { id: "c6", name: "Pinecrest Education", industry: "Education", website: "pinecrest.edu", employees: 60, city: "Dublin", country: "Ireland", ownerId: "u2", createdAt: "2026-06-02" },
  { id: "c7", name: "Harbor Financial", industry: "Finance", website: "harborfinancial.com", employees: 150, city: "Zurich", country: "Switzerland", ownerId: "u1", createdAt: "2026-06-18" },
  { id: "c8", name: "Sparkline Media", industry: "Media", website: "sparkline.media", employees: 18, city: "Lisbon", country: "Portugal", ownerId: "u3", createdAt: "2026-07-07" },
];

export const contacts = [
  { id: "ct1", firstName: "Emma", lastName: "Larsson", email: "emma.larsson@northwind-logistics.com", phone: "+31 20 555 0101", jobTitle: "Operations Director", companyId: "c1", status: "customer", source: "Referral", ownerId: "u2", createdAt: "2026-03-06" },
  { id: "ct2", firstName: "Jonas", lastName: "de Vries", email: "jonas.devries@northwind-logistics.com", phone: "+31 20 555 0102", jobTitle: "Procurement Manager", companyId: "c1", status: "active", source: "Referral", ownerId: "u2", createdAt: "2026-03-10" },
  { id: "ct3", firstName: "Priya", lastName: "Nair", email: "priya.nair@brightpathhealth.com", phone: "+44 113 555 0103", jobTitle: "Head of Clinical Ops", companyId: "c2", status: "lead", source: "LinkedIn", ownerId: "u3", createdAt: "2026-04-14" },
  { id: "ct4", firstName: "Marcus", lastName: "Chen", email: "marcus.chen@kestrelsoft.io", phone: "+49 30 555 0104", jobTitle: "CTO", companyId: "c3", status: "active", source: "Website", ownerId: "u3", createdAt: "2026-05-01" },
  { id: "ct5", firstName: "Olivia", lastName: "Brandt", email: "olivia.brandt@kestrelsoft.io", phone: "+49 30 555 0105", jobTitle: "Founder", companyId: "c3", status: "customer", source: "Event", ownerId: "u3", createdAt: "2026-05-03" },
  { id: "ct6", firstName: "Hannah", lastName: "Weiss", email: "hannah.weiss@lumenfoods.com", phone: "+33 4 555 0106", jobTitle: "Supply Chain Lead", companyId: "c4", status: "active", source: "Cold outreach", ownerId: "u2", createdAt: "2026-05-12" },
  { id: "ct7", firstName: "Carlos", lastName: "Mendes", email: "carlos.mendes@atlasbuild.co", phone: "+34 91 555 0107", jobTitle: "Project Director", companyId: "c5", status: "lead", source: "Event", ownerId: "u3", createdAt: "2026-05-25" },
  { id: "ct8", firstName: "Fatima", lastName: "Zahra", email: "fatima.zahra@pinecrest.edu", phone: "+353 1 555 0108", jobTitle: "Program Manager", companyId: "c6", status: "active", source: "Website", ownerId: "u2", createdAt: "2026-06-05" },
  { id: "ct9", firstName: "Ethan", lastName: "Walker", email: "ethan.walker@harborfinancial.com", phone: "+41 44 555 0109", jobTitle: "COO", companyId: "c7", status: "customer", source: "Referral", ownerId: "u1", createdAt: "2026-06-20" },
  { id: "ct10", firstName: "Mei", lastName: "Tanaka", email: "mei.tanaka@harborfinancial.com", phone: "+41 44 555 0110", jobTitle: "Finance Controller", companyId: "c7", status: "inactive", source: "LinkedIn", ownerId: "u1", createdAt: "2026-06-22" },
  { id: "ct11", firstName: "Lucas", lastName: "Romero", email: "lucas.romero@sparkline.media", phone: "+351 21 555 0111", jobTitle: "Creative Director", companyId: "c8", status: "lead", source: "LinkedIn", ownerId: "u3", createdAt: "2026-07-09" },
  { id: "ct12", firstName: "Isabelle", lastName: "Moreau", email: "isabelle.moreau@sparkline.media", phone: "+351 21 555 0112", jobTitle: "Marketing Lead", companyId: "c8", status: "active", source: "Website", ownerId: "u3", createdAt: "2026-07-11" },
  { id: "ct13", firstName: "Noah", lastName: "Fischer", email: "noah.fischer@lumenfoods.com", phone: "+33 4 555 0113", jobTitle: "IT Manager", companyId: "c4", status: "lead", source: "Cold outreach", ownerId: "u2", createdAt: "2026-08-02" },
  { id: "ct14", firstName: "Zoe", lastName: "Campbell", email: "zoe.campbell@brightpathhealth.com", phone: "+44 113 555 0114", jobTitle: "HR Director", companyId: "c2", status: "active", source: "Event", ownerId: "u3", createdAt: "2026-08-15" },
];

export const deals = [
  { id: "d1", title: "Fleet tracking rollout", value: 48000, stage: "negotiation", contactId: "ct1", companyId: "c1", ownerId: "u2", expectedCloseDate: "2026-11-15", createdAt: "2026-08-01" },
  { id: "d2", title: "Warehouse analytics dashboard", value: 22000, stage: "proposal", contactId: "ct2", companyId: "c1", ownerId: "u2", expectedCloseDate: "2026-12-05", createdAt: "2026-09-02" },
  { id: "d3", title: "Patient scheduling portal", value: 36000, stage: "contacted", contactId: "ct3", companyId: "c2", ownerId: "u3", expectedCloseDate: "2027-01-20", createdAt: "2026-09-18" },
  { id: "d4", title: "Platform migration support", value: 54000, stage: "won", contactId: "ct5", companyId: "c3", ownerId: "u3", expectedCloseDate: "2026-09-30", createdAt: "2026-07-14" },
  { id: "d5", title: "API integration package", value: 15000, stage: "proposal", contactId: "ct4", companyId: "c3", ownerId: "u3", expectedCloseDate: "2026-11-28", createdAt: "2026-09-25" },
  { id: "d6", title: "Supplier portal", value: 31000, stage: "contacted", contactId: "ct6", companyId: "c4", ownerId: "u2", expectedCloseDate: "2026-12-18", createdAt: "2026-10-01" },
  { id: "d7", title: "Site management app", value: 42000, stage: "lead", contactId: "ct7", companyId: "c5", ownerId: "u3", expectedCloseDate: "2027-02-10", createdAt: "2026-10-05" },
  { id: "d8", title: "Student onboarding system", value: 27500, stage: "negotiation", contactId: "ct8", companyId: "c6", ownerId: "u2", expectedCloseDate: "2026-11-22", createdAt: "2026-08-20" },
  { id: "d9", title: "Client reporting suite", value: 65000, stage: "won", contactId: "ct9", companyId: "c7", ownerId: "u1", expectedCloseDate: "2026-08-31", createdAt: "2026-06-25" },
  { id: "d10", title: "Compliance tracker", value: 19000, stage: "lost", contactId: "ct10", companyId: "c7", ownerId: "u1", expectedCloseDate: "2026-09-10", createdAt: "2026-07-30" },
  { id: "d11", title: "Campaign asset manager", value: 12500, stage: "lead", contactId: "ct11", companyId: "c8", ownerId: "u3", expectedCloseDate: "2027-01-08", createdAt: "2026-10-12" },
  { id: "d12", title: "Marketing analytics hub", value: 24000, stage: "proposal", contactId: "ct12", companyId: "c8", ownerId: "u3", expectedCloseDate: "2026-12-12", createdAt: "2026-09-30" },
];

export const activities = [
  { id: "a1", contactId: "ct1", userId: "u2", type: "meeting", content: "Kickoff call about fleet tracking requirements. They want live GPS and driver alerts.", createdAt: "2026-08-03T10:00:00" },
  { id: "a2", contactId: "ct1", userId: "u2", type: "email", content: "Sent the proposal draft and pricing options.", createdAt: "2026-09-10T14:30:00" },
  { id: "a3", contactId: "ct1", userId: "u2", type: "note", content: "Emma needs sign-off from finance before the end of the month.", createdAt: "2026-10-14T09:15:00" },
  { id: "a4", contactId: "ct2", userId: "u2", type: "call", content: "Walked through warehouse dashboard scope. Asked for a sample report.", createdAt: "2026-09-05T11:00:00" },
  { id: "a5", contactId: "ct3", userId: "u3", type: "email", content: "Introduced our scheduling portal. Waiting for a reply.", createdAt: "2026-09-20T08:45:00" },
  { id: "a6", contactId: "ct3", userId: "u3", type: "call", content: "Short intro call. Priya is interested but wants a case study first.", createdAt: "2026-10-02T16:00:00" },
  { id: "a7", contactId: "ct4", userId: "u3", type: "meeting", content: "Technical review of API needs with their dev team.", createdAt: "2026-09-27T13:00:00" },
  { id: "a8", contactId: "ct5", userId: "u3", type: "note", content: "Migration completed on schedule. Olivia is happy and open to a follow-up project.", createdAt: "2026-10-01T10:30:00" },
  { id: "a9", contactId: "ct6", userId: "u2", type: "call", content: "Discussed supplier onboarding pain points. Their current process is all spreadsheets.", createdAt: "2026-10-03T15:20:00" },
  { id: "a10", contactId: "ct7", userId: "u3", type: "note", content: "Met at the construction expo. Wants a demo in November.", createdAt: "2026-10-06T12:00:00" },
  { id: "a11", contactId: "ct8", userId: "u2", type: "email", content: "Sent revised terms for the onboarding system.", createdAt: "2026-10-18T09:00:00" },
  { id: "a12", contactId: "ct9", userId: "u1", type: "meeting", content: "Quarterly review. Reporting suite adoption is strong across the team.", createdAt: "2026-09-15T14:00:00" },
  { id: "a13", contactId: "ct10", userId: "u1", type: "note", content: "Deal lost. They chose an in-house build. Revisit in six months.", createdAt: "2026-09-12T10:00:00" },
  { id: "a14", contactId: "ct11", userId: "u3", type: "call", content: "Lucas is exploring options for managing campaign assets.", createdAt: "2026-10-13T11:30:00" },
  { id: "a15", contactId: "ct12", userId: "u3", type: "email", content: "Shared analytics hub mockups for feedback.", createdAt: "2026-10-09T17:10:00" },
  { id: "a16", contactId: "ct14", userId: "u3", type: "note", content: "Zoe asked about role-based access for HR data.", createdAt: "2026-10-20T10:00:00" },
];