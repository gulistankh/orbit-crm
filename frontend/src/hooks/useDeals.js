// src/hooks/useDeals.js
// Deals with names attached, grouped by stage for the kanban board,
// plus pipeline numbers for the dashboard.

import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { dealStages } from "../data/mock";
import { fullName } from "../utils/formatters";

export function useDeals() {
  const { deals, contacts, companies, addDeal, updateDeal, deleteDeal, moveDeal } = useData();
  const { users } = useAuth();

  const enriched = useMemo(
    () =>
      deals.map((deal) => {
        const contact = contacts.find((c) => c.id === deal.contactId);
        const company = companies.find((c) => c.id === deal.companyId);
        const owner = users.find((u) => u.id === deal.ownerId);
        return {
          ...deal,
          contactName: contact ? fullName(contact) : "",
          companyName: company ? company.name : "",
          ownerName: owner ? owner.name : "",
        };
      }),
    [deals, contacts, companies, users]
  );

  const dealsByStage = useMemo(() => {
    const grouped = {};
    dealStages.forEach((stage) => {
      grouped[stage.key] = enriched.filter((d) => d.stage === stage.key);
    });
    return grouped;
  }, [enriched]);

  const stats = useMemo(() => {
    const open = enriched.filter((d) => d.stage !== "won" && d.stage !== "lost");
    const won = enriched.filter((d) => d.stage === "won");
    const lost = enriched.filter((d) => d.stage === "lost");
    const closed = won.length + lost.length;

    return {
      openCount: open.length,
      openValue: open.reduce((sum, d) => sum + d.value, 0),
      wonCount: won.length,
      wonValue: won.reduce((sum, d) => sum + d.value, 0),
      lostCount: lost.length,
      winRate: closed ? Math.round((won.length / closed) * 100) : 0,
    };
  }, [enriched]);

  function getDealById(id) {
    return enriched.find((d) => d.id === id) || null;
  }

  function getDealsByCompany(companyId) {
    return enriched.filter((d) => d.companyId === companyId);
  }

  function getDealsByContact(contactId) {
    return enriched.filter((d) => d.contactId === contactId);
  }

  return {
    deals: enriched,
    dealsByStage,
    stats,
    getDealById,
    getDealsByCompany,
    getDealsByContact,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDeal,
  };
}