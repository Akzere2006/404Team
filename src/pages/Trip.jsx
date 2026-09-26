import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapPin,
  BusFront,
  CarFront,
  TentTree,
  WalletCards,
  Utensils,
  BedDouble,
  Compass,
  Users,
  Save,
  UserPlus,
  AlertTriangle,
  ShieldCheck,
  Wind,
  Waves,
  Route,
} from "lucide-react";

import { getPlaces } from "../api/places";
import { createTrip } from "../api/trips";
import {
  getSafetyAlerts,
  getWeatherByPlace,
} from "../api/safety";

function Trip({ setActiveTab }) {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] =
    useState(null);

  const [days, setDays] = useState(1);
  const [budget, setBudget] =
    useState("medium");

  const [transport, setTransport] =
    useState("car");

  const [people, setPeople] =
    useState(2);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // ДАННЫЕ БЕЗОПАСНОСТИ
  // ==========================================

  const [selectedWeather, setSelectedWeather] =
    useState(null);

  const [safetyAlerts, setSafetyAlerts] =
    useState([]);

  const [safetyLoading, setSafetyLoading] =
    useState(false);

  // ==========================================
  // ЗАГРУЗКА МЕСТ
  // ==========================================

  useEffect(() => {
    async function loadPlaces() {
      try {
        const data = await getPlaces();

        setPlaces(data);

        if (data.length > 0) {
          setSelectedPlace(data[0]);
        }
      } catch (err) {
        console.error(err);

        setError(
          "Не удалось загрузить туристические места"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, []);

  // ==========================================
  // ЗАГРУЗКА ПОГОДЫ И ПРЕДУПРЕЖДЕНИЙ
  // ==========================================

  async function loadSafetyData(place) {
    if (!place) return;

    setSafetyLoading(true);

    try {
      // Погода по выбранному месту
      try {
        const weather =
          await getWeatherByPlace(place.id);

        setSelectedWeather(weather || null);
      } catch (weatherError) {
        console.error(
          "Weather error:",
          weatherError
        );

        setSelectedWeather(null);
      }

      // Предупреждения администратора
      try {
        const alerts =
          await getSafetyAlerts();

        const placeAlerts =
          (alerts || []).filter(
            (alert) =>
              !alert.place_name ||
              alert.place_name === place.name
          );

        setSafetyAlerts(placeAlerts);
      } catch (alertError) {
        console.error(
          "Safety alerts error:",
          alertError
        );

        setSafetyAlerts([]);
      }
    } finally {
      setSafetyLoading(false);
    }
  }

  // ==========================================
  // ЗАГРУЖАЕМ БЕЗОПАСНОСТЬ ПРИ ВЫБОРЕ МЕСТА
  // ==========================================

  useEffect(() => {
    if (!selectedPlace) return;

    loadSafetyData(selectedPlace);
  }, [selectedPlace]);

  // ==========================================
  // РАСЧЁТ СТОИМОСТИ
  // ==========================================

  const calculation =
    useMemo(() => {
      let baseCost = 0;

      if (transport === "bus") {
        baseCost = 7000;
      }

      if (transport === "car") {
        baseCost = 15000;
      }

      if (transport === "tour") {
        baseCost = 25000;
      }

      const foodPerPerson =
        5000 * days;

      let accommodation = 0;

      if (days > 1) {
        accommodation =
          12000 * (days - 1);
      }

      const transportTotal =
        baseCost;

      const foodTotal =
        foodPerPerson * people;

      const accommodationTotal =
        accommodation * people;

      let total =
        transportTotal +
        foodTotal +
        accommodationTotal;

      if (budget === "low") {
        total = Math.round(
          total * 0.75
        );
      }

      if (budget === "high") {
        total = Math.round(
          total * 1.35
        );
      }

      return {
        total,

        perPerson:
          Math.round(
            total / people
          ),

        transport:
          transportTotal,

        food:
          foodTotal,

        accommodation:
          accommodationTotal,
      };
    }, [
      days,
      budget,
      transport,
      people,
    ]);

  // ==========================================
  // СОХРАНЕНИЕ ПОЕЗДКИ
  // ==========================================

  async function handleCreateTrip() {
    if (!selectedPlace) {
      setError(
        "Выберите туристическое место"
      );

      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createTrip({
        place_id:
          selectedPlace.id,

        destination:
          selectedPlace.name,

        days:
          Number(days),

        budget:
          calculation.total,

        transport,

        people:
          Number(people),
      });

      // Сохраняем параметры
      // для поиска группы
      localStorage.setItem(
        "mangystau_go_group_place",
        JSON.stringify({
          id:
            selectedPlace.id,

          name:
            selectedPlace.name,

          transport,

          people,

          days,

          budget:
            calculation.total,
        })
      );

      // Обновляем погоду
      // и предупреждения после сохранения
      await loadSafetyData(
        selectedPlace
      );

      setMessage(
        "Поездка сохранена"
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Не удалось сохранить поездку"
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // ПЕРЕХОД К ГРУППАМ
  // ==========================================

  function handleFindGroups() {
    localStorage.setItem(
      "mangystau_go_group_place",
      JSON.stringify({
        id:
          selectedPlace?.id,

        name:
          selectedPlace?.name,

        transport,

        people,

        days,

        budget:
          calculation.total,
      })
    );

    if (setActiveTab) {
      setActiveTab("groups");
    }
  }

  // ==========================================
  // ПРОВЕРКА БЕЗОПАСНОСТИ
  // ==========================================

  function handleSafety() {
    loadSafetyData(
      selectedPlace
    );
  }

  // ==========================================
  // МАРШРУТ
  // ==========================================

  function handleRoute() {
    if (!selectedPlace) return;

    if (selectedPlace.latitude &&
        selectedPlace.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`,
        "_blank"
      );
    } else {
      setActiveTab?.("places");
    }
  }

  // ==========================================
  // НАЗВАНИЕ ТРАНСПОРТА
  // ==========================================

  function transportName(value) {
    switch (value) {
      case "bus":
        return "Автобус";

      case "tour":
        return "Туроператор";

      default:
        return "Автомобиль";
    }
  }

  // ==========================================
  // УРОВЕНЬ РИСКА
  // ==========================================

  function riskLabel(level) {
    if (!level) return null;

    const value =
      String(level).toLowerCase();

    if (
      value.includes("high") ||
      value.includes("выс")
    ) {
      return "Высокий";
    }

    if (
      value.includes("medium") ||
      value.includes("сред")
    ) {
      return "Средний";
    }

    if (
      value.includes("low") ||
      value.includes("низ")
    ) {
      return "Низкий";
    }

    return level;
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="page">
        <div className="location-label">
          <span></span>
          SMART TRIP
        </div>

        <h1>
          Планируем
          <br />
          <em>поездку</em>
        </h1>

        <section className="safety-card">
          Загрузка туристических мест...
        </section>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="page">

      {/* HEADER */}

      <div className="location-label">
        <span></span>
        SMART TRIP · MANGYSTAU
      </div>

      <h1>
        Соберите
        <br />
        <em>свою поездку</em>
      </h1>

      <p
        style={{
          color: "#938F86",
          lineHeight: "1.5",
          marginBottom: "24px",
        }}
      >
        Выберите направление, транспорт,
        количество дней и бюджет.
        MANGYSTAU GO рассчитает примерную
        стоимость поездки и проверит
        актуальные предупреждения.
      </p>

      {/* =====================================
          01 DESTINATION
      ====================================== */}

      <section className="smart-trip-card">

        <div className="smart-trip-kicker">
          01 · НАПРАВЛЕНИЕ
        </div>

        <h2>
          Куда едем?
        </h2>

        <div className="trip-destination-list">

          {places.map((place) => (

            <button
              key={place.id}
              className={`trip-destination ${
                selectedPlace?.id ===
                place.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedPlace(place)
              }
            >

              <span className="trip-destination-icon">
                <MapPin
                  size={22}
                  strokeWidth={2}
                />
              </span>

              <span className="trip-destination-info">

                <strong>
                  {place.name}
                </strong>

                <small>
                  {place.category}
                </small>

              </span>

              <span className="trip-check">
                {selectedPlace?.id ===
                place.id
                  ? "✓"
                  : "○"}
              </span>

            </button>

          ))}

        </div>

      </section>

      {/* =====================================
          02 DAYS
      ====================================== */}

      <section className="smart-trip-card">

        <div className="smart-trip-kicker">
          02 · ПРОДОЛЖИТЕЛЬНОСТЬ
        </div>

        <h2>
          Сколько дней?
        </h2>

        <div className="trip-number-control">

          <button
            onClick={() =>
              setDays(
                Math.max(
                  1,
                  days - 1
                )
              )
            }
          >
            −
          </button>

          <div>
            <strong>
              {days}
            </strong>

            <span>
              {days === 1
                ? "день"
                : "дня"}
            </span>
          </div>

          <button
            onClick={() =>
              setDays(
                Math.min(
                  7,
                  days + 1
                )
              )
            }
          >
            +
          </button>

        </div>

      </section>

      {/* =====================================
          03 PEOPLE
      ====================================== */}

      <section className="smart-trip-card">

        <div className="smart-trip-kicker">
          03 · КОМПАНИЯ
        </div>

        <h2>
          Сколько человек?
        </h2>

        <div className="trip-number-control">

          <button
            onClick={() =>
              setPeople(
                Math.max(
                  1,
                  people - 1
                )
              )
            }
          >
            −
          </button>

          <div>

            <strong>
              {people}
            </strong>

            <span>
              {people === 1
                ? "человек"
                : "человека"}
            </span>

          </div>

          <button
            onClick={() =>
              setPeople(
                Math.min(
                  20,
                  people + 1
                )
              )
            }
          >
            +
          </button>

        </div>

      </section>

      {/* =====================================
          04 TRANSPORT
      ====================================== */}

      <section className="smart-trip-card">

        <div className="smart-trip-kicker">
          04 · ТРАНСПОРТ
        </div>

        <h2>
          Как добираемся?
        </h2>

        <div className="trip-options">

          <button
            className={
              transport === "bus"
                ? "trip-option active"
                : "trip-option"
            }
            onClick={() =>
              setTransport("bus")
            }
          >

            <BusFront size={25} />

            <strong>
              Автобус
            </strong>

            <small>
              Эконом
            </small>

          </button>

          <button
            className={
              transport === "car"
                ? "trip-option active"
                : "trip-option"
            }
            onClick={() =>
              setTransport("car")
            }
          >

            <CarFront size={25} />

            <strong>
              Автомобиль
            </strong>

            <small>
              Гибко
            </small>

          </button>

          <button
            className={
              transport === "tour"
                ? "trip-option active"
                : "trip-option"
            }
            onClick={() =>
              setTransport("tour")
            }
          >

            <TentTree size={25} />

            <strong>
              Тур
            </strong>

            <small>
              Готовый
            </small>

          </button>

        </div>

      </section>

      {/* =====================================
          05 BUDGET
      ====================================== */}

      <section className="smart-trip-card">

        <div className="smart-trip-kicker">
          05 · БЮДЖЕТ
        </div>

        <h2>
          Какой бюджет?
        </h2>

        <div className="trip-budget-options">

          <button
            className={
              budget === "low"
                ? "active"
                : ""
            }
            onClick={() =>
              setBudget("low")
            }
          >

            <WalletCards size={22} />

            <span>
              Эконом
            </span>

          </button>

          <button
            className={
              budget === "medium"
                ? "active"
                : ""
            }
            onClick={() =>
              setBudget("medium")
            }
          >

            <WalletCards size={22} />

            <span>
              Средний
            </span>

          </button>

          <button
            className={
              budget === "high"
                ? "active"
                : ""
            }
            onClick={() =>
              setBudget("high")
            }
          >

            <WalletCards size={22} />

            <span>
              Комфорт
            </span>

          </button>

        </div>

      </section>

      {/* =====================================
          RESULT
      ====================================== */}

      <section className="smart-trip-result">

        <div className="smart-trip-result-top">

          <div>

            <div className="smart-trip-kicker">
              MANGYSTAU GO · CALCULATOR
            </div>

            <h2>
              Ваша поездка
            </h2>

          </div>

          <div className="trip-result-icon">
            <Compass size={28} />
          </div>

        </div>

        <div className="trip-result-place">

          <MapPin size={16} />

          {selectedPlace?.name}

        </div>

        <div className="trip-price">

          <strong>
            {calculation.total.toLocaleString(
              "ru-RU"
            )}
            ₸
          </strong>

          <span>
            ≈{" "}
            {calculation.perPerson.toLocaleString(
              "ru-RU"
            )}
            ₸ / человек
          </span>

        </div>

        <div className="trip-breakdown">

          <div>

            <span>
              <CarFront size={16} />
              Транспорт
            </span>

            <strong>
              {calculation.transport.toLocaleString(
                "ru-RU"
              )}{" "}
              ₸
            </strong>

          </div>

          <div>

            <span>
              <Utensils size={16} />
              Питание
            </span>

            <strong>
              {calculation.food.toLocaleString(
                "ru-RU"
              )}{" "}
              ₸
            </strong>

          </div>

          <div>

            <span>
              <BedDouble size={16} />
              Проживание
            </span>

            <strong>
              {calculation.accommodation.toLocaleString(
                "ru-RU"
              )}{" "}
              ₸
            </strong>

          </div>

        </div>

        <div className="trip-summary">

          <span>
            {days} дн. · {people} чел. ·{" "}
            {transportName(transport)}
          </span>

        </div>

        {/* =====================================
            SAFETY PREVIEW
        ====================================== */}

        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "18px",
            background: "#181817",
            border:
              "1px solid rgba(241,239,233,0.08)",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              color: "#F1EFE9",
              fontWeight: 600,
            }}
          >

            <ShieldCheck
              size={19}
            />

            Безопасность поездки

          </div>

          {safetyLoading ? (

            <div
              style={{
                color: "#938F86",
                fontSize: "13px",
              }}
            >
              Проверяем актуальные данные...
            </div>

          ) : selectedWeather ? (

            <>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "8px",
                }}
              >

                <div
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    background: "#222220",
                  }}
                >
                  <div
                    style={{
                      color: "#938F86",
                      fontSize: "11px",
                      marginBottom: "4px",
                    }}
                  >
                    Температура
                  </div>

                  <strong>
                    {selectedWeather.temperature ??
                      "—"}
                    °C
                  </strong>
                </div>

                <div
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    background: "#222220",
                  }}
                >
                  <div
                    style={{
                      color: "#938F86",
                      fontSize: "11px",
                      marginBottom: "4px",
                    }}
                  >
                    Ветер
                  </div>

                  <strong
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Wind size={14} />

                    {selectedWeather.wind_speed ??
                      "—"}{" "}
                    м/с
                  </strong>
                </div>

                <div
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    background: "#222220",
                  }}
                >
                  <div
                    style={{
                      color: "#938F86",
                      fontSize: "11px",
                      marginBottom: "4px",
                    }}
                  >
                    Порывы
                  </div>

                  <strong>
                    {selectedWeather.wind_gust ??
                      "—"}{" "}
                    м/с
                  </strong>
                </div>

                <div
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    background: "#222220",
                  }}
                >
                  <div
                    style={{
                      color: "#938F86",
                      fontSize: "11px",
                      marginBottom: "4px",
                    }}
                  >
                    Волны
                  </div>

                  <strong
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Waves size={14} />

                    {selectedWeather.wave_condition ||
                      "Нет данных"}
                  </strong>
                </div>

              </div>

              {selectedWeather.risk_level && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background:
                      "rgba(201,131,90,0.12)",
                    border:
                      "1px solid rgba(201,131,90,0.25)",
                    color: "#C9835A",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Уровень риска:{" "}
                  {riskLabel(
                    selectedWeather.risk_level
                  )}
                </div>
              )}

              {selectedWeather.source && (
                <div
                  style={{
                    marginTop: "9px",
                    color: "#938F86",
                    fontSize: "11px",
                  }}
                >
                  Источник:{" "}
                  {selectedWeather.source}
                </div>
              )}

            </>

          ) : (

            <div
              style={{
                color: "#938F86",
                fontSize: "13px",
              }}
            >
              Данные о погоде пока недоступны.
            </div>

          )}

        </div>

        {/* =====================================
            ADMIN ALERTS
        ====================================== */}

        {safetyAlerts.length > 0 && (

          <div
            style={{
              marginTop: "12px",
              padding: "16px",
              borderRadius: "18px",
              background:
                "rgba(201,131,90,0.10)",
              border:
                "1px solid rgba(201,131,90,0.25)",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#C9835A",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >

              <AlertTriangle size={19} />

              Важное замечание

            </div>

            {safetyAlerts.map(
              (alert) => (

                <div
                  key={alert.id}
                  style={{
                    marginBottom: "10px",
                  }}
                >

                  <strong
                    style={{
                      color: "#F1EFE9",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    {alert.title}
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "#D8D4CC",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    {alert.message}
                  </p>

                  {alert.source && (
                    <small
                      style={{
                        display: "block",
                        marginTop: "6px",
                        color: "#938F86",
                      }}
                    >
                      Источник:{" "}
                      {alert.source}
                    </small>
                  )}

                </div>

              )
            )}

          </div>

        )}

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (

          <div className="trip-error">

            <AlertTriangle
              size={17}
            />

            {error}

          </div>

        )}

        {/* =====================================
            SAVED TRIP CARD
        ====================================== */}

        {message && (

          <div
            style={{
              marginTop: "16px",
              padding: "18px",
              borderRadius: "20px",
              background: "#1B1B1A",
              border:
                "1px solid rgba(241,239,233,0.10)",
              boxShadow:
                "0 18px 40px rgba(8,6,3,0.25)",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >

              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(124,138,114,0.16)",
                  color: "#7C8A72",
                }}
              >
                <ShieldCheck size={20} />
              </div>

              <div>

                <strong
                  style={{
                    color: "#F1EFE9",
                    display: "block",
                  }}
                >
                  Поездка сохранена
                </strong>

                <span
                  style={{
                    color: "#938F86",
                    fontSize: "12px",
                  }}
                >
                  План готов к следующему шагу
                </span>

              </div>

            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "15px",
                background: "#222220",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  color: "#F1EFE9",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >

                <MapPin size={17} />

                {selectedPlace?.name}

              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "8px",
                  color: "#BDB9B0",
                  fontSize: "12px",
                }}
              >

                <span>
                  📅 {days} дн.
                </span>

                <span>
                  👥 {people} чел.
                </span>

                <span>
                  🚗{" "}
                  {transportName(
                    transport
                  )}
                </span>

                <span>
                  💰{" "}
                  {calculation.total.toLocaleString(
                    "ru-RU"
                  )}{" "}
                  ₸
                </span>

              </div>

            </div>

            {/* ACTIONS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "8px",
                marginTop: "12px",
              }}
            >

              <button
                className="full-button secondary"
                onClick={
                  handleFindGroups
                }
                style={{
                  margin: 0,
                  minHeight: "46px",
                }}
              >
                <UserPlus size={17} />

                Попутчики
              </button>

              <button
                className="full-button secondary"
                onClick={
                  handleSafety
                }
                style={{
                  margin: 0,
                  minHeight: "46px",
                }}
              >
                <ShieldCheck size={17} />

                Безопасность
              </button>

            </div>

            <button
              className="full-button primary"
              onClick={
                handleRoute
              }
              style={{
                marginTop: "8px",
              }}
            >

              <Route size={18} />

              Открыть маршрут →

            </button>

          </div>

        )}

        {/* =====================================
            SAVE BUTTON
        ====================================== */}

        <button
          className="full-button primary"
          onClick={
            handleCreateTrip
          }
          disabled={saving}
          style={{
            marginTop: "12px",
          }}
        >

          <Save size={18} />

          {saving
            ? "Сохраняем..."
            : "Сохранить поездку →"}

        </button>

      </section>

      {/* =====================================
          GROUP BANNER
      ====================================== */}

      <section className="trip-group-banner">

        <div className="trip-group-icon">

          <Users size={27} />

        </div>

        <div>

          <strong>
            Нет автомобиля?
          </strong>

          <p>
            Найдите попутчиков и разделите
            стоимость поездки.
          </p>

        </div>

      </section>

    </main>
  );
}

export default Trip;