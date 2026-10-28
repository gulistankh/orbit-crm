// src/hooks/useActivities.js
// Activity log entries, newest first, with the author and contact names attached.

import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { fullName } from "../utils/formatters";

export function useActivities() {
  const { activities, contacts, addActivity, deleteActivity } = useData();
  const { users } = useAuth();

  const enriched = useMemo(
    () =>
      activities
        .map((activity) => {
          const user = users.find((u) => u.id === activity.userId);
          const contact = contacts.find((c) => c.id === activity.contactId);
          return {
            ...activity,
            userName: user ? user.name : "Unknown",
            contactName: contact ? fullName(contact) : "",
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [activities, contacts, users]
  );

  function getContactActivities(contactId) {
    return enriched.filter((a) => a.contactId === contactId);
  }

  function getRecentActivities(limit = 8) {
    return enriched.slice(0, limit);
  }

  return {
    activities: enriched,
    getContactActivities,
    getRecentActivities,
    addActivity,
    deleteActivity,
  };
}
