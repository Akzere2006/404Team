import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  UserRound,
  Shield,
} from "lucide-react";

import { getAdminUsers } from "../api/admin";

function AdminUsers({ setActiveTab }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminUsers();

        setUsers(data);
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="admin-page">

      <div className="admin-header">

        <div className="admin-header-left">

          <button
            className="admin-back"
            onClick={() => setActiveTab("admin")}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="admin-eyebrow">
              MANGYSTAU GO / ADMIN
            </div>

            <h1>
              Пользователи
            </h1>

            <p>
              Зарегистрированные пользователи платформы
            </p>
          </div>

        </div>

      </div>

      <div className="admin-content">

        <div className="admin-users-count">
          Всего пользователей:{" "}
          <strong>
            {users.length}
          </strong>
        </div>

        {loading ? (
          <div className="admin-empty">
            Загрузка...
          </div>
        ) : (
          <div className="admin-list">

            {users.map((user) => (
              <div
                className="admin-list-card"
                key={user.id}
              >

                <div className="admin-list-icon">
                  {user.role === "admin" ? (
                    <Shield size={22} />
                  ) : (
                    <UserRound size={22} />
                  )}
                </div>

                <div className="admin-list-main">

                  <div className="admin-list-top">

                    <div>
                      <h3>
                        {user.name}
                      </h3>

                      <span
                        className={
                          user.role === "admin"
                            ? "role-admin"
                            : "role-user"
                        }
                      >
                        {user.role === "admin"
                          ? "Администратор"
                          : "Пользователь"}
                      </span>
                    </div>

                    <span className="admin-user-id">
                      ID #{user.id}
                    </span>

                  </div>

                  <div className="admin-user-data">

                    <span>
                      {user.email}
                    </span>

                    <span>
                      {user.phone || "Телефон не указан"}
                    </span>

                  </div>

                  <div className="admin-meta">
                    Зарегистрирован:{" "}
                    {user.created_at
                      ? new Date(
                          user.created_at
                        ).toLocaleDateString("ru-RU")
                      : "—"}
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default AdminUsers;