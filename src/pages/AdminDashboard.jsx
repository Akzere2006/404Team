import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  Users,
  UserRound,
  ArrowLeft,
  RefreshCw,
  Plus,
  LogOut,
} from "lucide-react";

import { getAdminDashboard } from "../api/admin";

function AdminDashboard({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const result = await getAdminDashboard();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Не удалось загрузить админ-панель"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          Загрузка панели администратора...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <div className="admin-error">
          {error}
        </div>

        <button
          className="admin-primary-button"
          onClick={loadDashboard}
        >
          Повторить
        </button>
      </main>
    );
  }

  const stats = data?.stats || {};

  return (
    <main className="admin-page">

      <header className="admin-header">

        <div>
          <div className="admin-kicker">
            MANGYSTAU GO · ADMIN
          </div>

          <h1>
            Панель управления
          </h1>

          <p>
            Управление туристическим сервисом
            и данными Мангистау.
          </p>
        </div>

        <div className="admin-header-actions">

          <button
            className="admin-secondary-button"
            onClick={loadDashboard}
          >
            <RefreshCw size={15} />
            Обновить
          </button>

          <button
            className="admin-secondary-button"
            onClick={() => setActiveTab("home")}
          >
            <ArrowLeft size={15} />
            В приложение
          </button>

        </div>

      </header>


      {/* ADMIN NAVIGATION */}

      <section className="admin-nav">

        <button
          className="admin-nav-item active"
          onClick={() =>
            setActiveTab("admin")
          }
        >
          <LayoutDashboard size={18} />
          <span>Обзор</span>
        </button>

        <button
          className="admin-nav-item"
          onClick={() =>
            setActiveTab("admin-places")
          }
        >
          <MapPin size={18} />
          <span>Места</span>
        </button>

        <button
          className="admin-nav-item"
          onClick={() =>
            setActiveTab("admin-safety")
          }
        >
          <ShieldAlert size={18} />
          <span>Безопасность</span>
        </button>

        <button
          className="admin-nav-item"
          onClick={() =>
            setActiveTab("admin-groups")
          }
        >
          <Users size={18} />
          <span>Группы</span>
        </button>

        <button
          className="admin-nav-item"
          onClick={() =>
            setActiveTab("admin-users")
          }
        >
          <UserRound size={18} />
          <span>Пользователи</span>
        </button>

      </section>


      {/* STATISTICS */}

      <section className="admin-stats">

        <div className="admin-stat-card">
          <Users size={20} />
          <span>Пользователи</span>
          <strong>
            {stats.users ?? 0}
          </strong>
        </div>

        <div className="admin-stat-card">
          <MapPin size={20} />
          <span>Места</span>
          <strong>
            {stats.places ?? 0}
          </strong>
        </div>

        <div className="admin-stat-card">
          <LayoutDashboard size={20} />
          <span>Поездки</span>
          <strong>
            {stats.trips ?? 0}
          </strong>
        </div>

        <div className="admin-stat-card">
          <Users size={20} />
          <span>Группы</span>
          <strong>
            {stats.groups ?? 0}
          </strong>
        </div>

        <div className="admin-stat-card">
          <ShieldAlert size={20} />
          <span>Активные предупреждения</span>
          <strong>
            {stats.active_alerts ?? 0}
          </strong>
        </div>

        <div className="admin-stat-card">
          <UserRound size={20} />
          <span>Новые пользователи</span>
          <strong>
            {stats.active_users ?? 0}
          </strong>
        </div>

      </section>


      {/* QUICK ACTIONS */}

      <section className="admin-section">

        <div className="admin-section-header">
          <div>
            <h2>
              Быстрые действия
            </h2>

            <span>
              Управление системой
            </span>
          </div>
        </div>


        <div className="admin-actions-grid">

          <button
            className="admin-action-card"
            onClick={() =>
              setActiveTab("admin-places")
            }
          >
            <div className="admin-action-icon">
              <MapPin size={22} />
            </div>

            <div>
              <strong>
                Управление местами
              </strong>

              <p>
                Добавить место, изменить
                координаты и статус
              </p>
            </div>

            <Plus size={18} />
          </button>


          <button
            className="admin-action-card"
            onClick={() =>
              setActiveTab("admin-safety")
            }
          >
            <div className="admin-action-icon">
              <ShieldAlert size={22} />
            </div>

            <div>
              <strong>
                Предупреждения
              </strong>

              <p>
                Добавить официальное
                предупреждение
              </p>
            </div>

            <Plus size={18} />
          </button>


          <button
            className="admin-action-card"
            onClick={() =>
              setActiveTab("admin-groups")
            }
          >
            <div className="admin-action-icon">
              <Users size={22} />
            </div>

            <div>
              <strong>
                Группы
              </strong>

              <p>
                Просмотр туристических групп
              </p>
            </div>
          </button>


          <button
            className="admin-action-card"
            onClick={() =>
              setActiveTab("admin-users")
            }
          >
            <div className="admin-action-icon">
              <UserRound size={22} />
            </div>

            <div>
              <strong>
                Пользователи
              </strong>

              <p>
                Просмотр зарегистрированных
                пользователей
              </p>
            </div>
          </button>

        </div>

      </section>


      {/* POPULAR PLACES */}

      <section className="admin-section">

        <div className="admin-section-header">
          <div>
            <h2>
              Популярные места
            </h2>

            <span>
              По количеству поездок
            </span>
          </div>
        </div>

        <div className="admin-list">

          {(data?.popular_places || []).map(
            (place, index) => (
              <div
                className="admin-place-row"
                key={place.id}
              >
                <div className="admin-place-main">

                  <div className="admin-place-icon">
                    {index + 1}
                  </div>

                  <div>
                    <strong>
                      {place.name}
                    </strong>

                    <div className="admin-place-meta">
                      {place.trips_count} поездок
                    </div>
                  </div>

                </div>
              </div>
            )
          )}

        </div>

      </section>


      {/* RECENT TRIPS */}

      <section className="admin-section">

        <div className="admin-section-header">
          <div>
            <h2>
              Последние поездки
            </h2>

            <span>
              Последние 10
            </span>
          </div>
        </div>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Место</th>
                <th>Транспорт</th>
                <th>Люди</th>
                <th>Бюджет</th>
              </tr>
            </thead>

            <tbody>

              {(data?.recent_trips || []).map(
                (trip) => (
                  <tr key={trip.id}>

                    <td>
                      {trip.user_name || "—"}
                    </td>

                    <td>
                      {trip.place_name || "—"}
                    </td>

                    <td>
                      {trip.transport || "—"}
                    </td>

                    <td>
                      {trip.people || "—"}
                    </td>

                    <td>
                      {trip.budget
                        ? `${trip.budget} ₸`
                        : "—"}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;