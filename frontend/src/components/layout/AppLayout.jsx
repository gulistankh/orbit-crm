// src/components/layout/AppLayout.jsx
// The page frame: sidebar + top bar + the current page (<Outlet />).
// Anyone not logged in is sent to /login.

import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Toast from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { colors, layout, spacing } from "../../styles/theme";

const MOBILE_QUERY = "(max-width: 900px)";

function LoadingScreen({ text }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        color: colors.textSecondary,
        fontSize: 15,
      }}
    >
      {text}
    </div>
  );
}

export default function AppLayout() {
  const { isAuthenticated, authLoading } = useAuth();
  const { dataReady, toast, dismissToast } = useData();
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);

    function handleChange(event) {
      setIsMobile(event.matches);
      if (!event.matches) setSidebarOpen(false);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  if (authLoading) return <LoadingScreen text="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!dataReady) return <LoadingScreen text="Loading your workspace..." />;

  const styles = {
    main: {
      marginLeft: isMobile ? 0 : layout.sidebarWidth,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    },
    content: {
      width: "100%",
      maxWidth: layout.contentMaxWidth,
      margin: "0 auto",
      padding: isMobile ? spacing.lg : spacing.xxl,
    },
    overlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(28, 25, 23, 0.45)",
      zIndex: 800,
    },
  };

  return (
    <div style={{ backgroundColor: colors.background, minHeight: "100vh" }}>
      <Sidebar
        isMobile={isMobile}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {isMobile && sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div style={styles.main}>
        <Topbar isMobile={isMobile} onMenuClick={() => setSidebarOpen(true)} />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={dismissToast} />}
    </div>
  );
}