import React, { useEffect, useState } from "react";
import {
  getAdminPlaces,
  createAdminPlace,
  updateAdminPlace,
} from "../api/admin";

export default function AdminPlaces({ setActiveTab }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    category: "",
    distance: "",
    description: "",
    emoji: "📍",
    safety_info: "",
    latitude: "",
    longitude: "",
    access_status: "open",
    status_reason: "",
    status_source: "",
    status_source_url: "",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadPlaces() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminPlaces();
      setPlaces(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlaces();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(place) {
    setEditingId(place.id);

    setForm({
      name: place.name || "",
      category: place.category || "",
      distance: place.distance || "",
      description: place.description || "",
      emoji: place.emoji || "📍",
      safety_info: place.safety_info || "",
      latitude: place.latitude ?? "",
      longitude: place.longitude ?? "",
      access_status: place.access_status || "open",
      status_reason: place.status_reason || "",
      status_source: place.status_source || "",
      status_source_url: place.status_source_url || "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");

      if (!form.name.trim()) {
        setError("Введите название места");
        return;
      }

      if (editingId) {
        await updateAdminPlace(editingId, form);
      } else {
        await createAdminPlace(form);
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadPlaces();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-page">

      <div className="admin-header">
        <div>
          <button
            className="admin-back-button"
            onClick={() => setActiveTab("admin")}
          >
            ← Админ-панель
          </button>

          <h1>Туристические места</h1>

          <p>
            Управление объектами Mangystau GO
          </p>
        </div>

        <button
          className="admin-primary-button"
          onClick={startCreate}
        >
          + Добавить место
        </button>
      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <div className="admin-content-grid">

        {/* ФОРМА */}

        <div className="admin-list-card">

          <h2>
            {editingId
              ? "Редактирование места"
              : "Новое место"}
          </h2>

          <form
            className="admin-form"
            onSubmit={handleSubmit}
          >

            <label>
              Название
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Например: Бозжыра"
              />
            </label>

            <label>
              Категория
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Каньон"
              />
            </label>

            <label>
              Расстояние
              <input
                name="distance"
                value={form.distance}
                onChange={handleChange}
                placeholder="300 км от Актау"
              />
            </label>

            <label>
              Описание
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Описание туристического объекта"
                rows="4"
              />
            </label>

            <label>
              Иконка
              <input
                name="emoji"
                value={form.emoji}
                onChange={handleChange}
                placeholder="📍"
              />
            </label>

            <label>
              Информация по безопасности
              <textarea
                name="safety_info"
                value={form.safety_info}
                onChange={handleChange}
                placeholder="Что нужно учитывать туристу"
                rows="3"
              />
            </label>

            <div className="admin-form-row">

              <label>
                Latitude
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="43.4247"
                />
              </label>

              <label>
                Longitude
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="54.7580"
                />
              </label>

            </div>

            <label>
              Статус доступа

              <select
                name="access_status"
                value={form.access_status}
                onChange={handleChange}
              >
                <option value="open">
                  🟢 Открыто
                </option>

                <option value="attention">
                  🟡 Требует внимания
                </option>

                <option value="restricted">
                  🟠 Ограничено
                </option>

                <option value="closed">
                  🔴 Закрыто
                </option>
              </select>
            </label>

            <label>
              Причина статуса

              <input
                name="status_reason"
                value={form.status_reason}
                onChange={handleChange}
                placeholder="Например: сильный ветер"
              />
            </label>

            <label>
              Источник

              <input
                name="status_source"
                value={form.status_source}
                onChange={handleChange}
                placeholder="Казгидромет"
              />
            </label>

            <label>
              Ссылка на источник

              <input
                name="status_source_url"
                value={form.status_source_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <div className="admin-form-actions">

              <button
                type="submit"
                className="admin-primary-button"
              >
                {editingId
                  ? "Сохранить изменения"
                  : "Добавить место"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={startCreate}
                >
                  Отмена
                </button>
              )}

            </div>

          </form>
        </div>

        {/* СПИСОК */}

        <div>

          <div className="admin-section-title">
            <h2>Все места</h2>

            <span>
              {places.length} объектов
            </span>
          </div>

          {loading ? (
            <div className="admin-list-card">
              Загрузка...
            </div>
          ) : places.length === 0 ? (
            <div className="admin-list-card">
              Мест пока нет.
            </div>
          ) : (
            <div className="admin-items">

              {places.map((place) => (

                <div
                  className="admin-list-card"
                  key={place.id}
                >

                  <div className="admin-place-header">

                    <div>
                      <div className="admin-place-title">
                        {place.emoji || "📍"}{" "}
                        {place.name}
                      </div>

                      <div className="admin-place-meta">
                        {place.category || "Без категории"}
                      </div>
                    </div>

                    <button
                      className="admin-secondary-button"
                      onClick={() =>
                        startEdit(place)
                      }
                    >
                      Изменить
                    </button>

                  </div>

                  {place.description && (
                    <p className="admin-place-description">
                      {place.description}
                    </p>
                  )}

                  <div className="admin-place-info">

                    <span>
                      📍{" "}
                      {place.latitude &&
                      place.longitude
                        ? `${place.latitude}, ${place.longitude}`
                        : "Координаты не указаны"}
                    </span>

                    <span>
                      Статус:{" "}
                      {place.access_status ||
                        "open"}
                    </span>

                  </div>

                  {place.status_reason && (
                    <div className="admin-place-warning">
                      {place.status_reason}
                    </div>
                  )}

                </div>

              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}