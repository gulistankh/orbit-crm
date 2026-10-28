/* eslint-disable react-refresh/only-export-components */
// src/context/DataContext.jsx
// Loads contacts, companies, deals and activities from the API and keeps them in sync.
// Every change goes to the server first; the screen updates with what the server returns.

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

// Add new items to a list, replacing any with the same id
function mergeById(current, incoming) {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return [...map.values()];
}

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser ? currentUser.id : null;

  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const dataReady = Boolean(userId) && loadedUserId === userId;

  // ---------- messages ----------
  function notify(message, tone = "error") {
    clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }

  function dismissToast() {
    clearTimeout(toastTimer.current);
    setToast(null);
  }

  // Runs an action; on failure shows the message and returns null instead of crashing.
  async function attempt(action) {
    try {
      return await action();
    } catch (error) {
      notify(error.message);
      return null;
    }
  }

  // ---------- loading ----------
  useEffect(() => {
    if (!userId) {
      setContacts([]);
      setCompanies([]);
      setDeals([]);
      setActivities([]);
      setLoadedUserId(null);
      return undefined;
    }

    let cancelled = false;

    Promise.all([
      api.get("/companies"),
      api.get("/contacts"),
      api.get("/deals"),
      api.get("/activities?limit=100"),
    ])
      .then(([companyList, contactList, dealList, activityList]) => {
        if (cancelled) return;
        setCompanies(companyList);
        setContacts(contactList);
        setDeals(dealList);
        setActivities(activityList);
      })
      .catch((error) => {
        if (!cancelled) notify(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoadedUserId(userId);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ---------- activities ----------
  // Makes sure ALL of a contact's activity is loaded (the first load only has the newest)
  async function loadContactActivities(contactId) {
    try {
      const list = await api.get(`/contacts/${contactId}/activities`);
      setActivities((prev) => mergeById(prev, list));
    } catch {
      // not critical: what is already loaded stays on screen
    }
  }

  function addActivity({ contactId, type, content }) {
    return attempt(async () => {
      const activity = await api.post(`/contacts/${contactId}/activities`, { type, content });
      setActivities((prev) => mergeById(prev, [activity]));
      return activity;
    });
  }

  function deleteActivity(id) {
    return attempt(async () => {
      await api.delete(`/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      return true;
    });
  }

  // ---------- contacts ----------
  function addContact(data) {
    return attempt(async () => {
      const contact = await api.post("/contacts", data);
      setContacts((prev) => [contact, ...prev]);
      return contact;
    });
  }

  function updateContact(id, changes) {
    return attempt(async () => {
      const updated = await api.patch(`/contacts/${id}`, changes);
      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    });
  }

  function deleteContact(id) {
    return attempt(async () => {
      await api.delete(`/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setActivities((prev) => prev.filter((a) => a.contactId !== id));
      setDeals((prev) => prev.map((d) => (d.contactId === id ? { ...d, contactId: null } : d)));
      return true;
    });
  }

  // Sends the parsed CSV rows to the server, then reloads contacts and companies
  function importContacts(rows) {
    return attempt(async () => {
      const result = await api.post("/contacts/import", { rows });
      const [contactList, companyList] = await Promise.all([
        api.get("/contacts"),
        api.get("/companies"),
      ]);
      setContacts(contactList);
      setCompanies(companyList);
      return result;
    });
  }

  // ---------- companies ----------
  function addCompany(data) {
    return attempt(async () => {
      const company = await api.post("/companies", data);
      setCompanies((prev) => [company, ...prev]);
      return company;
    });
  }

  function updateCompany(id, changes) {
    return attempt(async () => {
      const updated = await api.patch(`/companies/${id}`, changes);
      setCompanies((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    });
  }

  function deleteCompany(id) {
    return attempt(async () => {
      await api.delete(`/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setContacts((prev) => prev.map((c) => (c.companyId === id ? { ...c, companyId: null } : c)));
      setDeals((prev) => prev.map((d) => (d.companyId === id ? { ...d, companyId: null } : d)));
      return true;
    });
  }

  // ---------- deals ----------
  function addDeal(data) {
    return attempt(async () => {
      const deal = await api.post("/deals", data);
      setDeals((prev) => [deal, ...prev]);
      return deal;
    });
  }

  function updateDeal(id, changes) {
    return attempt(async () => {
      const before = deals.find((d) => d.id === id);
      const updated = await api.patch(`/deals/${id}`, changes);
      setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)));

      // The server writes a log line when the stage changes, so fetch it
      if (before && updated.stage !== before.stage && updated.contactId) {
        loadContactActivities(updated.contactId);
      }
      return updated;
    });
  }

  function deleteDeal(id) {
    return attempt(async () => {
      await api.delete(`/deals/${id}`);
      setDeals((prev) => prev.filter((d) => d.id !== id));
      return true;
    });
  }

  // Used by the kanban board. Moves the card at once, and puts it back if the server refuses.
  async function moveDeal(id, stage) {
    const deal = deals.find((d) => d.id === id);
    if (!deal || deal.stage === stage) return;

    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage } : d)));

    try {
      const updated = await api.patch(`/deals/${id}/stage`, { stage });
      setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)));
      if (updated.contactId) loadContactActivities(updated.contactId);
    } catch (error) {
      setDeals((prev) => prev.map((d) => (d.id === id ? deal : d)));
      notify(error.message);
    }
  }

  const value = {
    contacts,
    companies,
    deals,
    activities,
    dataReady,
    toast,
    notify,
    dismissToast,
    loadContactActivities,
    addContact,
    updateContact,
    deleteContact,
    importContacts,
    addCompany,
    updateCompany,
    deleteCompany,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDeal,
    addActivity,
    deleteActivity,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}