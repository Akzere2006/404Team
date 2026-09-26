import React, { useEffect, useState } from "react";
import {
  MessageCircle,
  Users,
  MapPin,
  CalendarDays,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { getMyGroups } from "../api/groups";
import GroupChat from "../components/GroupChat";

export default function Chats() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatGroup, setChatGroup] = useState(null);

  async function loadChats() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyGroups();

      setGroups(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error("CHATS ERROR:", err);

      setError(
        err.message ||
          "Не удалось загрузить чаты"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChats();
  }, []);

  function openChat(group) {
    setChatGroup(group);
  }

  function closeChat() {
    setChatGroup(null);
    loadChats();
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "ru-RU",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );
  }

  if (chatGroup) {
    return (
      <GroupChat
        group={chatGroup}
        onClose={closeChat}
      />
    );
  }

  return (
    <main className="page chats-page">

      <div className="location-label">
        <span></span>
        МАНГИСТАУ · ЧАТЫ
      </div>

      <div className="chats-header">
        <div>
          <small>GO TOGETHER</small>

          <h1>
            Ваши
            <br />
            <em>чаты</em>
          </h1>

          <p>
            Общайтесь с попутчиками
            и координируйте поездки.
          </p>
        </div>

        <button
          type="button"
          className="chats-refresh"
          onClick={loadChats}
          disabled={loading}
          aria-label="Обновить"
        >
          <RefreshCw
            size={19}
            className={
              loading
                ? "chats-spin"
                : ""
            }
          />
        </button>
      </div>

      {error && (
        <div className="warning-card chats-error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        groups.length === 0 && (
          <section className="chats-empty">
            <div className="chats-empty-icon">
              <MessageCircle size={30} />
            </div>

            <h2>
              Пока нет чатов
            </h2>

            <p>
              Вступите в группу,
              чтобы здесь появился
              ваш чат.
            </p>
          </section>
        )}

      {loading && (
        <section className="chats-loading">
          <div className="chats-loading-icon">
            <MessageCircle size={22} />
          </div>

          <span>
            Загружаем ваши группы...
          </span>
        </section>
      )}

      {!loading &&
        groups.length > 0 && (
          <section className="chats-list">

            <div className="chats-section-title">
              <span>
                МОИ ГРУППЫ
              </span>

              <strong>
                {groups.length}
              </strong>
            </div>

            {groups.map((group) => (
              <button
                type="button"
                className="chat-list-card"
                key={group.id}
                onClick={() =>
                  openChat(group)
                }
              >
                <div className="chat-list-avatar">
                  <MessageCircle
                    size={21}
                  />
                </div>

                <div className="chat-list-content">

                  <div className="chat-list-top">
                    <h3>
                      {group.name ||
                        "Группа поездки"}
                    </h3>

                    <span>
                      {formatDate(
                        group.created_at
                      )}
                    </span>
                  </div>

                  <div className="chat-list-destination">
                    <MapPin size={13} />

                    <span>
                      {group.destination ||
                        "Место не указано"}
                    </span>
                  </div>

                  <div className="chat-list-bottom">

                    <span>
                      <Users size={13} />
                      {group.members_count ||
                        0}{" "}
                      участников
                    </span>

                    {group.trip_date && (
                      <span>
                        <CalendarDays
                          size={13}
                        />
                        {formatDate(
                          group.trip_date
                        )}
                      </span>
                    )}

                  </div>

                </div>

                <ChevronRight
                  className="chat-list-arrow"
                  size={19}
                />
              </button>
            ))}

          </section>
        )}

    </main>
  );
}
