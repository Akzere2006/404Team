import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Users,
  MapPin,
  CalendarDays,
} from "lucide-react";

import { getAdminGroups } from "../api/admin";

function AdminGroups({ setActiveTab }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminGroups();

        setGroups(data);
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
              Группы
            </h1>

            <p>
              Все туристические группы пользователей
            </p>
          </div>

        </div>

      </div>

      <div className="admin-content">

        {loading ? (
          <div className="admin-empty">
            Загрузка...
          </div>
        ) : groups.length === 0 ? (
          <div className="admin-empty">
            <Users size={36} />

            <h3>
              Групп пока нет
            </h3>

            <p>
              Когда пользователи начнут объединяться
              для поездок, они появятся здесь.
            </p>
          </div>
        ) : (
          <div className="admin-list">

            {groups.map((group) => (
              <div
                className="admin-list-card"
                key={group.id}
              >

                <div className="admin-list-icon">
                  <Users size={22} />
                </div>

                <div className="admin-list-main">

                  <h3>
                    {group.name}
                  </h3>

                  <div className="admin-group-info">

                    <span>
                      <MapPin size={15} />

                      {group.destination}
                    </span>

                    <span>
                      <CalendarDays size={15} />

                      {group.trip_date
                        ? new Date(
                            group.trip_date
                          ).toLocaleDateString("ru-RU")
                        : "Дата не указана"}
                    </span>

                    <span>
                      <Users size={15} />

                      {group.members_count || 0}
                      {" / "}
                      {group.max_members || "—"}
                    </span>

                  </div>

                </div>

                <div className="admin-group-number">
                  #{group.id}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default AdminGroups;