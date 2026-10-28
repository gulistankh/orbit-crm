// src/App.jsx
// All routes. Providers wrap everything: Auth first, then Data (data needs to know who's logged in).

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { usePermissions } from "./hooks/usePermissions";
import AppLayout from "./components/layout/AppLayout";
import EmptyState from "./components/ui/EmptyState";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Deals from "./pages/Deals";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import { card } from "./styles/theme";

// Blocks a page when the current role doesn't have the permission.
// (Hiding the sidebar link isn't enough, someone can type the address.)
function RequirePermission({ permission, children }) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return (
      <div style={card}>
        <EmptyState
          title="You don't have access to this page"
          message="Ask an admin if you think you should."
        />
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/deals" element={<Deals />} />
            <Route
              path="/users"
              element={
                <RequirePermission permission="users:view">
                  <Users />
                </RequirePermission>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}