import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ShieldCheck,
  Wind,
  Waves,
  Thermometer,
  AlertTriangle,
  CircleCheck,
  CircleAlert,
  Siren,
  PhoneCall,
  MapPin,
} from "lucide-react";

import {
  getSafetyAlerts,
  getWeather,
} from "../api/safety";

function Safety() {
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadSafety() {
      try {
        const [
          alertsData,
          weatherData,
        ] = await Promise.all([
          getSafetyAlerts(),
          getWeather(),
        ]);

        setAlerts(alertsData);
        setWeather(weatherData);

      } catch (err) {
        console.error(
          "SAFETY LOAD ERROR:",
          err
        );

        setError(
          "Не удалось загрузить данные безопасности"
        );

      } finally {
        setLoading(false);
      }
    }

    loadSafety();
  }, []);

  const currentWeather =
    useMemo(() => {

      if (!weather.length) {
        return null;
      }

      return weather[0];

    }, [weather]);

  const risk = useMemo(() => {

    if (!currentWeather) {
      return {
        level: "unknown",
        title: "Нет данных",
        icon: CircleAlert,
        description:
          "Данные о погодных условиях пока недоступны.",
      };
    }

    const wind =
      Number(
        currentWeather.wind_speed || 0
      );

    const gust =
      Number(
        currentWeather.wind_gust || 0
      );

    if (
      wind >= 20 ||
      gust >= 25
    ) {
      return {
        level: "high",
        title: "ВЫСОКИЙ РИСК",
        icon: AlertTriangle,
        description:
          "Сильный ветер. Перед поездкой необходимо проверить официальные предупреждения.",
      };
    }

    if (
      wind >= 15 ||
      gust >= 20
    ) {
      return {
        level: "elevated",
        title: "ПОВЫШЕННЫЙ РИСК",
        icon: AlertTriangle,
        description:
          "Погодные условия требуют повышенной осторожности.",
      };
    }

    if (
      wind >= 10 ||
      gust >= 15
    ) {
      return {
        level: "attention",
        title: "ВНИМАНИЕ",
        icon: CircleAlert,
        description:
          "Перед поездкой рекомендуется проверить актуальный прогноз.",
      };
    }

    return {
      level: "low",
      title: "НИЗКИЙ РИСК",
      icon: CircleCheck,
      description:
        "По доступным данным существенных погодных ограничений не выявлено.",
    };

  }, [currentWeather]);

  function formatDate(date) {

    if (!date) {
      return "Нет данных";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Нет данных";
    }

    return parsed.toLocaleString(
      "ru-RU",
      {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  const RiskIcon = risk.icon;

  return (
    <main className="page">

      {/* HEADER */}

      <div className="location-label">
        <span></span>
        CASPIAN WATCH · БЕЗОПАСНОСТЬ
      </div>

      <h1>
        Безопасность
        <br />
        <em>перед поездкой</em>
      </h1>

      <p
        style={{
          color: "#91a5b5",
          lineHeight: "1.55",
          marginBottom: "20px",
        }}
      >
        MANGYSTAU GO анализирует погодные
        условия и предупреждения перед
        поездкой.
      </p>

      {/* LOADING */}

      {loading && (
        <section
          style={{
            padding: "25px",
            borderRadius: "22px",
            background: "#101b24",
            color: "#ffffff",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "7px",
            }}
          >
            <ShieldCheck
              size={21}
            />

            Проверяем безопасность...
          </div>

          <div
            style={{
              color: "#91a5b5",
              fontSize: "13px",
            }}
          >
            Получаем данные из базы
            MANGYSTAU GO.
          </div>

        </section>
      )}

      {/* ERROR */}

      {error && (
        <section
          style={{
            padding: "16px",
            borderRadius: "16px",
            background: "#351c20",
            border: "1px solid #7d343c",
            color: "#ffb5bc",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertTriangle size={18} />
          {error}
        </section>
      )}

      {!loading && !error && (
        <>

          {/* RISK */}

          <section
            className={`caspian-risk-card ${risk.level}`}
          >

            <div className="caspian-risk-top">

              <div>

                <div className="caspian-kicker">
                  CASPIAN WATCH
                </div>

                <div className="caspian-risk-title">

                  <RiskIcon
                    size={20}
                  />

                  {risk.title}

                </div>

              </div>

              <div className="caspian-shield">

                <ShieldCheck
                  size={30}
                  strokeWidth={1.8}
                />

              </div>

            </div>

            <p className="caspian-risk-description">
              {risk.description}
            </p>

          </section>

          {/* WEATHER */}

          <section className="caspian-section">

            <div className="caspian-section-header">

              <div>

                <div className="caspian-kicker">
                  CURRENT CONDITIONS
                </div>

                <h2>
                  Погодные
                  <br />
                  <em>условия</em>
                </h2>

              </div>

            </div>

            {currentWeather ? (

              <div className="weather-grid">

                <div className="weather-card">

                  <span className="weather-icon">
                    <Wind size={23} />
                  </span>

                  <span className="weather-label">
                    Ветер
                  </span>

                  <strong>
                    {currentWeather.wind_speed ??
                      "—"}

                    <small>
                      {" "}м/с
                    </small>
                  </strong>

                </div>

                <div className="weather-card">

                  <span className="weather-icon">
                    <Wind size={23} />
                  </span>

                  <span className="weather-label">
                    Порывы
                  </span>

                  <strong>
                    {currentWeather.wind_gust ??
                      "—"}

                    <small>
                      {" "}м/с
                    </small>
                  </strong>

                </div>

                <div className="weather-card">

                  <span className="weather-icon">
                    <Waves size={23} />
                  </span>

                  <span className="weather-label">
                    Каспий
                  </span>

                  <strong
                    style={{
                      fontSize: "15px",
                    }}
                  >
                    {currentWeather.wave_condition ||
                      "Нет данных"}
                  </strong>

                </div>

                <div className="weather-card">

                  <span className="weather-icon">
                    <Thermometer size={23} />
                  </span>

                  <span className="weather-label">
                    Температура
                  </span>

                  <strong>
                    {currentWeather.temperature ??
                      "—"}

                    <small>
                      °C
                    </small>
                  </strong>

                </div>

              </div>

            ) : (

              <div className="caspian-empty">
                Пока нет данных о погоде.
              </div>

            )}

          </section>

          {/* ALERTS */}

          <section className="caspian-section">

            <div className="caspian-section-header">

              <div>

                <div className="caspian-kicker">
                  ALERTS
                </div>

                <h2>
                  Актуальные
                  <br />
                  <em>предупреждения</em>
                </h2>

              </div>

              <div className="alert-count">
                {alerts.length}
              </div>

            </div>

            {alerts.length === 0 ? (

              <div className="caspian-empty">

                <CircleCheck
                  size={22}
                />

                <div>

                  <strong>
                    Активных предупреждений нет
                  </strong>

                  <small>
                    Проверьте официальные источники
                    перед дальней поездкой.
                  </small>

                </div>

              </div>

            ) : (

              <div className="alerts-list">

                {alerts.map((alert) => {

                  const AlertIcon =
                    alert.level === "high"
                      ? AlertTriangle
                      : alert.level === "elevated"
                      ? AlertTriangle
                      : CircleAlert;

                  return (
                    <div
                      key={alert.id}
                      className={`caspian-alert ${
                        alert.level ||
                        "attention"
                      }`}
                    >

                      <div className="alert-icon">

                        <AlertIcon
                          size={21}
                        />

                      </div>

                      <div className="alert-content">

                        <strong>
                          {alert.title}
                        </strong>

                        <p>
                          {alert.message}
                        </p>

                        <small>

                          {alert.place_name && (
                            <>
                              <MapPin
                                size={12}
                              />

                              {alert.place_name}
                              {" · "}
                            </>
                          )}

                          {alert.source
                            ? `Источник: ${alert.source}`
                            : ""}

                        </small>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </section>

          {/* SOURCE */}

          {currentWeather && (
            <section className="caspian-source">

              <div>

                <span>
                  Источник данных
                </span>

                <strong>
                  {currentWeather.source ||
                    "Источник не указан"}
                </strong>

              </div>

              <div>

                <span>
                  Последнее обновление
                </span>

                <strong>
                  {formatDate(
                    currentWeather.recorded_at
                  )}
                </strong>

              </div>

            </section>
          )}

          {/* SOS */}

          <section className="caspian-sos">

            <div className="caspian-sos-icon">
              <Siren
                size={27}
                strokeWidth={2}
              />
            </div>

            <div>

              <strong>
                Экстренная помощь
              </strong>

              <p>
                При непосредственной угрозе
                жизни звоните по номеру 112.
              </p>

            </div>

            <a href="tel:112">
              <PhoneCall
                size={16}
              />

              112
            </a>

          </section>

          <div className="caspian-disclaimer">
            Данные Caspian Watch являются
            информационным инструментом.
            Перед поездкой проверяйте актуальные
            официальные предупреждения.
          </div>

        </>
      )}

    </main>
  );
}

export default Safety;