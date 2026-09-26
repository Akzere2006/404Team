import React from "react";
import {
  Search,
  MapPin,
  Compass,
  Users,
  ShieldCheck,
  Wind,
  Waves,
} from "lucide-react";

function Home({ setActiveTab }) {
  return (
    <main className="page">

      <div className="location-label">
        <span></span>
        АКТАУ · МАНГИСТАУ
      </div>

      <h1>
        Куда поедем
        <br />
        <em>сегодня?</em>
      </h1>

      <div className="search">
        <Search size={19} strokeWidth={2} />

        <input
          type="text"
          placeholder="Найти место или маршрут"
        />
      </div>

      <div className="quick-actions">

        <button
          className="quick-button"
          onClick={() => setActiveTab("places")}
        >
          <MapPin size={25} strokeWidth={2} />

          <strong>Места</strong>
          <span>Что посмотреть</span>
        </button>

        <button
          className="quick-button"
          onClick={() => setActiveTab("trip")}
        >
          <Compass size={25} strokeWidth={2} />

          <strong>Поездка</strong>
          <span>Собрать маршрут</span>
        </button>

        <button
          className="quick-button"
          onClick={() => setActiveTab("groups")}
        >
          <Users size={25} strokeWidth={2} />

          <strong>Группы</strong>
          <span>Найти попутчиков</span>
        </button>

        <button
          className="quick-button"
          onClick={() => setActiveTab("safety")}
        >
          <ShieldCheck size={25} strokeWidth={2} />

          <strong>Safety</strong>
          <span>Проверить условия</span>
        </button>

      </div>

      <section className="safety-card">

        <small>CASPIAN WATCH</small>

        <h2>
          Обстановка сейчас
        </h2>

        <div className="weather">

          <div className="weather-item">
            <Wind size={23} strokeWidth={2} />

            <div>
              <strong>14 м/с</strong>
              <span>Ветер</span>
            </div>
          </div>

          <div className="weather-item">
            <Waves size={23} strokeWidth={2} />

            <div>
              <strong>Повышенное</strong>
              <span>Волнение</span>
            </div>
          </div>

        </div>

        <button
          className="full-button dark"
          onClick={() => setActiveTab("safety")}
        >
          Открыть Caspian Watch →
        </button>

      </section>

      <section className="smart-trip">

        <small>SMART TRIP</small>

        <h2>
          Собери поездку
          <br />
          под себя
        </h2>

        <p>
          Бюджет, транспорт, время и
          безопасность — в одном маршруте.
        </p>

        <button
          className="full-button primary"
          onClick={() => setActiveTab("trip")}
        >
          Собрать поездку →
        </button>

      </section>

    </main>
  );
}

export default Home;