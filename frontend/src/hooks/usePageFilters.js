// src/hooks/usePageFilters.js
// The search text and filters of the current list page, kept in the address bar
// (for example ?q=kes&status=lead). The top bar changes them and the page reads them.
// Because they live in the URL, a refresh keeps them and the Back button works.

import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { contactStatuses, dealStages, industries } from "../data/mock";

export function usePageFilters() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { companies } = useData();
  const { users } = useAuth();

  // Which filters exist depends on the page
  const definitions = useMemo(() => {
    const companyOptions = [...companies]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ value: c.id, label: c.name }));
    const ownerOptions = users.map((u) => ({ value: u.id, label: u.name }));

    const company = { key: "companyId", label: "Company", options: companyOptions };
    const owner = { key: "ownerId", label: "Owner", options: ownerOptions };

    if (pathname === "/contacts") {
      return [
        {
          key: "status",
          label: "Status",
          options: contactStatuses.map((s) => ({ value: s.key, label: s.label })),
        },
        company,
        owner,
      ];
    }

    if (pathname === "/companies") {
      return [
        {
          key: "industry",
          label: "Industry",
          options: industries.map((name) => ({ value: name, label: name })),
        },
        owner,
      ];
    }

    if (pathname === "/deals") {
      return [
        company,
        owner,
        {
          key: "stage",
          label: "Stage",
          options: dealStages.map((s) => ({ value: s.key, label: s.label })),
        },
      ];
    }

    return [];
  }, [pathname, companies, users]);

  const values = {};
  definitions.forEach((definition) => {
    values[definition.key] = searchParams.get(definition.key) || "";
  });

  const count = definitions.filter((definition) => values[definition.key]).length;
  const search = searchParams.get("q") || "";

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams);
    definitions.forEach((definition) => next.delete(definition.key));
    setSearchParams(next, { replace: true });
  }

  return { search, values, definitions, count, setFilter, clearFilters };
}