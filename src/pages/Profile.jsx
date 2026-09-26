import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Compass,
  Users,
  UserRoundPlus,
  LogOut,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { getProfileStats } from "../api/profile";

function Profile() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    trips: 0,
    created_groups: 0,
    joined_groups: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getProfileStats();
        setStats(data);
      } catch (error) {
        console.error("PROFILE STATS:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <main className="page profile-page">

      {/* HEADER */}

      <div className="location-label profile-kicker">
        <span></span>
        MANGYSTAU GO
      </div>

      <h1 className="profile-title">
        Мой
        <br />
        <em>профиль</em>
      </h1>

      {/* USER CARD */}

      <section className="profile-user-card">

        <div className="profile-user">

          <div className="profile-avatar">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="profile-user-info">

            <h2>
              {user.name}
            </h2>

            <p>
              Участник MANGYSTAU GO
            </p>

          </div>

        </div>

      </section>

      {/* PERSONAL DATA */}

      <section className="profile-card">

        <div className="profile-card-header">

          <span className="section-kicker">
            ACCOUNT
          </span>

          <h2>
            Личные данные
          </h2>

        </div>

        <div className="profile-info-list">

          {/* EMAIL */}

          <div className="profile-info-row">

            <div className="profile-info-icon">
              <Mail
                size={20}
                strokeWidth={2}
              />
            </div>

            <div className="profile-info-content">

              <div className="profile-info-label">
                Email
              </div>

              <div className="profile-info-value">
                {user.email}
              </div>

            </div>

          </div>

          {/* PHONE */}

          <div className="profile-info-row">

            <div className="profile-info-icon">
              <Phone
                size={20}
                strokeWidth={2}
              />
            </div>

            <div className="profile-info-content">

              <div className="profile-info-label">
                Телефон
              </div>

              <div className="profile-info-value">
                {user.phone || "Не указан"}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* STATISTICS */}

      <section className="profile-card">

        <div className="profile-card-header">

          <span className="section-kicker">
            ACTIVITY
          </span>

          <h2>
            Моя активность
          </h2>

        </div>

        <div className="profile-stat-grid">

          {/* TRIPS */}

          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              <Compass
                size={22}
                strokeWidth={2}
              />
            </div>

            <div className="profile-stat-number">
              {loading ? "..." : stats.trips}
            </div>

            <div className="profile-stat-title">
              Мои поездки
            </div>

          </div>

          {/* CREATED GROUPS */}

          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              <Users
                size={22}
                strokeWidth={2}
              />
            </div>

            <div className="profile-stat-number">
              {loading
                ? "..."
                : stats.created_groups}
            </div>

            <div className="profile-stat-title">
              Мои группы
            </div>

          </div>

          {/* JOINED GROUPS */}

          <div className="profile-stat-card profile-stat-wide">

            <div className="profile-stat-icon">
              <UserRoundPlus
                size={22}
                strokeWidth={2}
              />
            </div>

            <div className="profile-stat-number">
              {loading
                ? "..."
                : stats.joined_groups}
            </div>

            <div className="profile-stat-title">
              Группы, в которых участвую
            </div>

          </div>

        </div>

      </section>

      {/* LOGOUT */}

      <button
        type="button"
        onClick={logout}
        className="profile-logout"
      >
        <LogOut
          size={20}
          strokeWidth={2}
        />

        Выйти из аккаунта
      </button>

    </main>
  );
}

export default Profile;