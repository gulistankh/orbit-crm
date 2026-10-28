// src/hooks/useCompanies.js
// Companies with owner name, contact count and open deal value attached.

import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export function useCompanies() {
  const { companies, contacts, deals, addCompany, updateCompany, deleteCompany } = useData();
  const { users } = useAuth();

  const enriched = useMemo(
    () =>
      companies.map((company) => {
        const owner = users.find((u) => u.id === company.ownerId);
        const companyDeals = deals.filter((d) => d.companyId === company.id);
        const openDealValue = companyDeals
          .filter((d) => d.stage !== "won" && d.stage !== "lost")
          .reduce((sum, d) => sum + d.value, 0);

        return {
          ...company,
          ownerName: owner ? owner.name : "",
          contactCount: contacts.filter((c) => c.companyId === company.id).length,
          dealCount: companyDeals.length,
          openDealValue,
        };
      }),
    [companies, contacts, deals, users]
  );

  function getCompanyById(id) {
    return enriched.find((c) => c.id === id) || null;
  }

  return {
    companies: enriched,
    getCompanyById,
    addCompany,
    updateCompany,
    deleteCompany,
  };
}
