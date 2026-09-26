import React, { useState } from "react";

import Auth from "./pages/Auth";
import { useAuth } from "./contexts/AuthContext";

import Home from "./pages/Home";
import Places from "./pages/Places";
import Trip from "./pages/Trip";
import Profile from "./pages/Profile";
import Safety from "./pages/Safety";
import Groups from "./pages/Groups";
import Chats from "./pages/Chats";

import AdminDashboard from "./pages/AdminDashboard";
import AdminPlaces from "./pages/AdminPlaces";
import AdminSafety from "./pages/AdminSafety";
import AdminGroups from "./pages/AdminGroups";
import AdminUsers from "./pages/AdminUsers";

import BottomNavigation from "./components/BottomNavigation";
import SOSButton from "./components/SOSButton";

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div
            style={{
              textAlign: "center",
              color: "#ffffff",
              fontSize: "16px",
            }}
          >
            Загрузка MANGYSTAU GO...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const isAdmin = user.role === "admin";

  const isAdminPage = [
    "admin",
    "admin-places",
    "admin-safety",
    "admin-groups",
    "admin-users",
  ].includes(activeTab);

  function renderPage() {
    switch (activeTab) {
      // =========================
      // USER PAGES
      // =========================

      case "home":
        return <Home setActiveTab={setActiveTab} />;

      case "places":
        return <Places />;

      case "trip":
        return <Trip setActiveTab={setActiveTab} />;

      case "safety":
        return <Safety />;

      case "groups":
        return <Groups />;

      case "chats":
        return <Chats />;

      case "profile":
        return <Profile setActiveTab={setActiveTab} />;

      // =========================
      // ADMIN
      // =========================

      case "admin":
        if (!isAdmin) {
          return <Home setActiveTab={setActiveTab} />;
        }

        return <AdminDashboard setActiveTab={setActiveTab} />;

      case "admin-places":
        if (!isAdmin) {
          return <Home setActiveTab={setActiveTab} />;
        }

        return <AdminPlaces setActiveTab={setActiveTab} />;

      case "admin-safety":
        if (!isAdmin) {
          return <Home setActiveTab={setActiveTab} />;
        }

        return <AdminSafety setActiveTab={setActiveTab} />;

      case "admin-groups":
        if (!isAdmin) {
          return <Home setActiveTab={setActiveTab} />;
        }

        return <AdminGroups setActiveTab={setActiveTab} />;

      case "admin-users":
        if (!isAdmin) {
          return <Home setActiveTab={setActiveTab} />;
        }

        return <AdminUsers setActiveTab={setActiveTab} />;

      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  }

  return (
    <div className={`app ${isAdminPage ? "admin-mode" : ""}`}>
      {renderPage()}

      {/* Кнопка входа в админку */}
      {isAdmin && !isAdminPage && (
        <button
          onClick={() => setActiveTab("admin")}
          style={{
            position: "fixed",
            top: "18px",
            right: "18px",
            zIndex: 1000,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(25,25,25,0.92)",
            color: "#ffffff",
            borderRadius: "12px",
            padding: "9px 13px",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Admin
        </button>
      )}

      {/* SOS только в пользовательской части */}
      {!isAdminPage && <SOSButton />}

      {/* Нижняя навигация только в пользовательской части */}
      {!isAdminPage && (
        <BottomNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

export default App;