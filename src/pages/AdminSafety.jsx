import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShieldAlert,
  Plus,
  Power,
  X,
} from "lucide-react";

import {
  getAdminSafety,
  createAdminSafety,
  updateAdminSafety,
} from "../api/admin";

function AdminSafety({ setActiveTab }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    level: "attention",
    title: "",
    message: "",
    source: "",
    place_id: "",
  });

  async function loadAlerts() {
    try {
      setLoading(true);

      const data = await getAdminSafety();

      setAlerts(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  function changeField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleCreate(event) {
    event.preventDefault();

    if (!form.title || !form.message) {
      alert("Заполни заголовок и текст предупреждения");
      return;
    }

    try {
      setSaving(true);

      await createAdminSafety({
        ...form,
        place_id: form.place_id
          ? Number(form.place_id)
          : null,
      });

      setForm({
        level: "attention",
        title: "",
        message: "",
        source: "",
        place_id: "",
      });

      setShowForm(false);

      await loadAlerts();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAlert(alert) {
    try {
      await updateAdminSafety(alert.id, {
        is_active: !alert.is_active,
      });

      await loadAlerts();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  function levelName(level) {
    switch (level) {
      case "high":
        return "Высокий";

      case "elevated":
        return "Повышенный";

      case "attention":
        return "Внимание";

      case "low":
        return "Низкий";

      default:
        return level;
    }
  }

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
              Безопасность
            </h1>

            <p>
              Управление предупреждениями Caspian Watch
            </p>
          </div>

        </div>

        <button
          className="admin-primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Добавить предупреждение
        </button>
      </div>

      {showForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">

            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">
                  CASPIAN WATCH
                </span>

                <h2>
                  Новое предупреждение
                </h2>
              </div>

              <button
                className="admin-close"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>

              <label>
                Уровень риска
              </label>

              <select
                name="level"
                value={form.level}
                onChange={changeField}
              >
                <option value="low">
                  Низкий
                </option>

                <option value="attention">
                  Внимание
                </option>

                <option value="elevated">
                  Повышенный
                </option>

                <option value="high">
                  Высокий
                </option>
              </select>

              <label>
                Заголовок
              </label>

              <input
                name="title"
                value={form.title}
                onChange={changeField}
                placeholder="Например: Сильный ветер"
              />

              <label>
                Сообщение
              </label>

              <textarea
                name="message"
                value={form.message}
                onChange={changeField}
                placeholder="Описание опасности..."
                rows={5}
              />

              <label>
                Источник
              </label>

              <input
                name="source"
                value={form.source}
                onChange={changeField}
                placeholder="Казгидромет"
              />

              <label>
                ID места
              </label>

              <input
                name="place_id"
                value={form.place_id}
                onChange={changeField}
                placeholder="Например: 1"
                type="number"
              />

              <button
                className="admin-primary-button admin-submit"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Сохранение..."
                  : "Создать предупреждение"}
              </button>

            </form>
          </div>
        </div>
      )}

      <div className="admin-content">

        {loading ? (
          <div className="admin-empty">
            Загрузка...
          </div>
        ) : alerts.length === 0 ? (
          <div className="admin-empty">
            <ShieldAlert size={36} />
            <h3>
              Предупреждений нет
            </h3>
            <p>
              Создай первое предупреждение.
            </p>
          </div>
        ) : (
          <div className="admin-list">

            {alerts.map((alert) => (
              <div
                className="admin-list-card"
                key={alert.id}
              >

                <div className="admin-list-icon">
                  <ShieldAlert size={22} />
                </div>

                <div className="admin-list-main">

                  <div className="admin-list-top">

                    <div>
                      <h3>
                        {alert.title}
                      </h3>

                      <span className={`risk-badge ${alert.level}`}>
                        {levelName(alert.level)}
                      </span>
                    </div>

                    <span
                      className={
                        alert.is_active
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {alert.is_active
                        ? "Активно"
                        : "Отключено"}
                    </span>

                  </div>

                  <p>
                    {alert.message}
                  </p>

                  <div className="admin-meta">
                    <span>
                      Источник:{" "}
                      {alert.source || "—"}
                    </span>

                    <span>
                      Место:{" "}
                      {alert.place_name || "Все места"}
                    </span>
                  </div>

                </div>

                <button
                  className="admin-icon-button"
                  onClick={() => toggleAlert(alert)}
                  title={
                    alert.is_active
                      ? "Отключить"
                      : "Активировать"
                  }
                >
                  <Power size={18} />
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default AdminSafety;