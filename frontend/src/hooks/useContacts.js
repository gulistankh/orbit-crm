// src/hooks/useContacts.js
// Contacts with company and owner names already attached,
// so tables can search and sort by them.

import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { fullName } from "../utils/formatters";

export function useContacts() {
  const { contacts, companies, addContact, updateContact, deleteContact, importContacts } =
    useData();
  const { users } = useAuth();

  const enriched = useMemo(
    () =>
      contacts.map((contact) => {
        const company = companies.find((c) => c.id === contact.companyId);
        const owner = users.find((u) => u.id === contact.ownerId);
        return {
          ...contact,
          name: fullName(contact),
          companyName: company ? company.name : "",
          ownerName: owner ? owner.name : "",
        };
      }),
    [contacts, companies, users]
  );

  function getContactById(id) {
    return enriched.find((c) => c.id === id) || null;
  }

  function getContactsByCompany(companyId) {
    return enriched.filter((c) => c.companyId === companyId);
  }

  return {
    contacts: enriched,
    getContactById,
    getContactsByCompany,
    addContact,
    updateContact,
    deleteContact,
    importContacts,
  };
}