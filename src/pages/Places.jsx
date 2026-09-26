import React, { useEffect, useState } from "react";

import {
  MapPin,
  ShieldCheck,
  CloudSun,
  Thermometer,
  Wind,
  Navigation,
  Waves,
  Droplets,
  AlertTriangle,
  CircleCheck,
  CircleAlert,
  Compass,
  X,
} from "lucide-react";

import { getPlaces } from "../api/places";
import { getWeatherByPlace } from "../api/safety";
import Map from "../components/Map";

function Places() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedWeather, setSelectedWeather] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [weatherError, setWeatherError] =
    useState("");

  useEffect(() => {
    async function loadPlaces() {
      try {
        const data = await getPlaces();
        setPlaces(data);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить места");
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, []);

  async function handleSelectPlace(place) {
    setSelectedPlace(place);
    setSelectedWeather(null);
    setWeatherError("");
    setWeatherLoading(true);

    try {
      const weather =
        await getWeatherByPlace(place.id);

      setSelectedWeather(weather);
    } catch (err) {
      console.error(
        "WEATHER ERROR:",
        err
      );

      setWeatherError(
        "Данные о погоде для этого места пока недоступны."
      );
    } finally {
      setWeatherLoading(false);
    }
  }

  function getRiskInfo(level) {
    switch (level) {
      case "low":
        return {
          icon: CircleCheck,
          title: "НИЗКИЙ РИСК",
          text:
            "По доступным данным существенных погодных ограничений не выявлено.",
        };

      case "attention":
        return {
          icon: CircleAlert,
          title: "ВНИМАНИЕ",
          text:
            "Перед поездкой рекомендуется проверить актуальный прогноз.",
        };

      case "elevated":
        return {
          icon: AlertTriangle,
          title: "ПОВЫШЕННЫЙ РИСК",
          text:
            "Погодные условия требуют повышенной осторожности.",
        };

      case "high":
        return {
          icon: AlertTriangle,
          title: "ВЫСОКИЙ РИСК",
          text:
            "Перед поездкой необходимо проверить официальные предупреждения.",
        };

      default:
        return {
          icon: CircleAlert,
          title: "НЕТ ДАННЫХ",
          text:
            "Актуальная информация о рисках пока недоступна.",
        };
    }
  }

  return (
    <main className="page">

      <div className="location-label">
        <span></span>
        EXPLORE · МАНГИСТАУ
      </div>

      <h1>
        Интересные
        <br />
        <em>места</em>
      </h1>

      <p
        style={{
          color: "#91a5b5",
          marginBottom: "20px",
          lineHeight: "1.5",
        }}
      >
        Исследуйте туристические места Мангистау
        и проверяйте условия перед поездкой.
      </p>

      {loading && (
        <section className="safety-card">
          <h2>
            Загрузка...
          </h2>

          <p
            style={{
              color: "#91a5b5",
            }}
          >
            Получаем данные из базы
            MANGYSTAU GO.
          </p>
        </section>
      )}

      {error && (
        <section className="warning-card">
          <AlertTriangle
            size={18}
            style={{
              verticalAlign: "middle",
              marginRight: "6px",
            }}
          />

          {error}
        </section>
      )}

      {!loading && !error && (
        <>

          {/* MAP */}

          <section className="places-map-section">

            <div className="section-heading-row">

              <div>

                <div className="section-kicker">
                  MANGYSTAU MAP
                </div>

                <h2>
                  Найдите своё
                  <br />
                  <em>место</em>
                </h2>

              </div>

              <div className="places-count">

                <strong>
                  {places.length}
                </strong>

                <span>
                  мест
                </span>

              </div>

            </div>

            <Map
              places={places}
              selectedPlace={selectedPlace}
              onSelectPlace={handleSelectPlace}
            />

          </section>

          {/* PLACES */}

          <section className="places-list-section">

            <div className="section-heading-row">

              <div>

                <div className="section-kicker">
                  EXPLORE
                </div>

                <h2>
                  Популярные
                  <br />
                  <em>направления</em>
                </h2>

              </div>

            </div>

            <div className="places">

              {places.map((place) => (
                <button
                  key={place.id}
                  className="place-card"
                  onClick={() =>
                    handleSelectPlace(place)
                  }
                >

                  <div className="place-photo">
                    <MapPin
                      size={28}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="place-info">

                    <strong>
                      {place.name}
                    </strong>

                    <span>
                      {place.category}
                    </span>

                    <small>
                      {place.distance}
                    </small>

                  </div>

                  <span className="place-arrow">
                    →
                  </span>

                </button>
              ))}

            </div>

          </section>

        </>
      )}

      {/* MODAL */}

      {selectedPlace && (
        <div
          className="place-modal-overlay"
          onClick={() => {
            setSelectedPlace(null);
            setSelectedWeather(null);
          }}
        >

          <div
            className="place-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="place-modal-handle" />

            <div className="place-modal-emoji">
              <MapPin
                size={34}
                strokeWidth={1.8}
              />
            </div>

            <div className="place-modal-category">
              {selectedPlace.category?.toUpperCase()}
            </div>

            <h2>
              {selectedPlace.name}
            </h2>

            {selectedPlace.distance && (
              <div className="place-modal-distance">

                <MapPin size={15} />

                {selectedPlace.distance}

              </div>
            )}

            <p>
              {selectedPlace.description}
            </p>

            {/* SAFETY */}

            {selectedPlace.safety_info && (
              <div className="place-safety-box">

                <strong>

                  <ShieldCheck size={18} />

                  Безопасность

                </strong>

                <span>
                  {selectedPlace.safety_info}
                </span>

              </div>
            )}

            {/* WEATHER */}

            <div className="place-weather-section">

              <div className="place-weather-header">

                <div>

                  <div className="place-weather-kicker">
                    CASPIAN WATCH
                  </div>

                  <h3>
                    Условия
                    <br />
                    <em>для поездки</em>
                  </h3>

                </div>

                <div className="place-weather-icon">
                  <CloudSun
                    size={30}
                    strokeWidth={1.8}
                  />
                </div>

              </div>

              {weatherLoading && (
                <div className="place-weather-loading">

                  <CloudSun size={24} />

                  <div>

                    <strong>
                      Проверяем условия...
                    </strong>

                    <small>
                      Получаем данные для{" "}
                      {selectedPlace.name}
                    </small>

                  </div>

                </div>
              )}

              {!weatherLoading &&
                weatherError && (
                  <div className="place-weather-error">

                    <AlertTriangle size={18} />

                    {weatherError}

                  </div>
                )}

              {!weatherLoading &&
                !weatherError &&
                selectedWeather && (
                  <>

                    <div className="place-weather-grid">

                      <div className="place-weather-item">

                        <span>
                          <Thermometer size={15} />
                          Температура
                        </span>

                        <strong>
                          {selectedWeather.temperature ??
                            "—"}

                          <small>
                            °C
                          </small>
                        </strong>

                      </div>

                      <div className="place-weather-item">

                        <span>
                          <Wind size={15} />
                          Ветер
                        </span>

                        <strong>
                          {selectedWeather.wind_speed ??
                            "—"}

                          <small>
                            {" "}м/с
                          </small>
                        </strong>

                      </div>

                      <div className="place-weather-item">

                        <span>
                          <Wind size={15} />
                          Порывы
                        </span>

                        <strong>
                          {selectedWeather.wind_gust ??
                            "—"}

                          <small>
                            {" "}м/с
                          </small>
                        </strong>

                      </div>

                      <div className="place-weather-item">

                        <span>
                          <Navigation size={15} />
                          Направление
                        </span>

                        <strong className="weather-small-value">
                          {selectedWeather.wind_direction ||
                            "—"}
                        </strong>

                      </div>

                    </div>

                    <div className="place-weather-condition">

                      <span>
                        {selectedWeather.weather_condition ||
                          "Погодные условия не указаны"}
                      </span>

                      {selectedWeather.precipitation !==
                        null &&
                        selectedWeather.precipitation !==
                          undefined && (
                          <span>
                            <Droplets size={14} />

                            {selectedWeather.precipitation}
                            %
                          </span>
                        )}

                    </div>

                    {selectedWeather.wave_condition && (
                      <div className="place-wave-box">

                        <Waves size={24} />

                        <div>

                          <strong>
                            Волнение Каспийского моря
                          </strong>

                          <small>
                            {selectedWeather.wave_condition}
                          </small>

                        </div>

                      </div>
                    )}

                    {(() => {

                      const risk =
                        getRiskInfo(
                          selectedWeather.risk_level
                        );

                      const RiskIcon =
                        risk.icon;

                      return (
                        <div
                          className={`place-risk-box ${selectedWeather.risk_level}`}
                        >

                          <div className="place-risk-icon">
                            <RiskIcon
                              size={23}
                            />
                          </div>

                          <div>

                            <strong>
                              {risk.title}
                            </strong>

                            <span>
                              {risk.text}
                            </span>

                          </div>

                        </div>
                      );

                    })()}

                    <div className="place-weather-source">

                      <span>
                        Источник
                      </span>

                      <strong>
                        {selectedWeather.source ||
                          "Не указан"}
                      </strong>

                    </div>

                  </>
                )}

            </div>

            <button
              className="full-button primary"
              onClick={() => {
                setSelectedPlace(null);
                setSelectedWeather(null);
              }}
            >
              <Compass
                size={18}
              />

              Построить поездку →
            </button>

            <button
              className="full-button dark"
              onClick={() => {
                setSelectedPlace(null);
                setSelectedWeather(null);
              }}
              style={{
                marginTop: "10px",
              }}
            >
              <X size={18} />
              Закрыть
            </button>

          </div>

        </div>
      )}

    </main>
  );
}

export default Places;