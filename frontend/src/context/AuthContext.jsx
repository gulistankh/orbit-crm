/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.jsx
// Who is logged in. The login itself is checked by the server.

import { createContext, useContext, useEffect, useState } from "react";
import { api, setUnauthorizedHandler } from "../api/client";

export const DEMO_PASSWORD = "demo1234";

export const AuthContext = createContext(null);

function fetchUsers() {
  return api.get("/users").catch(() => []);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  // On first load, ask the server whether there is a valid session
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { user } = await api.get("/auth/me");
        const list = await fetchUsers();
        if (!cancelled) {
          setUsers(list);
          setCurrentUser(user);
        }
      } catch {
        // no valid session, so the login page is shown
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // If any request comes back 401 (expired session), sign out here too
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setCurrentUser(null);
      setUsers([]);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  async function login(email, password) {
    try {
      const { user } = await api.post("/auth/login", { email, password });
      const list = await fetchUsers();
      setUsers(list);
      setCurrentUser(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // even if this fails, sign out on this device
    }
    setCurrentUser(null);
    setUsers([]);
  }

  async function updateUserRole(userId, role) {
    try {
      const updated = await api.patch(`/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  const value = {
    users,
    currentUser,
    isAuthenticated: Boolean(currentUser),
    authLoading,
    login,
    logout,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}