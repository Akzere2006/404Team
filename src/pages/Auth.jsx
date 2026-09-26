import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Auth() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }
    } catch (error) {
      setError(error.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at 80% 10%, rgba(35,174,190,.16), transparent 30%), #071218",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          boxSizing: "border-box",
          padding: "32px",
          borderRadius: "26px",
          background: "#101e25",
          border: "1px solid rgba(255,255,255,.08)",
          boxShadow: "0 25px 80px rgba(0,0,0,.45)",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#164651",
              fontSize: "25px",
            }}
          >
            🌊
          </div>

          <div>
            <div
              style={{
                color: "#fff",
                fontSize: "18px",
                fontWeight: "800",
                letterSpacing: "1px",
              }}
            >
              MANGYSTAU GO
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#789198",
                fontSize: "12px",
              }}
            >
              Explore. Travel. Stay safe.
            </div>
          </div>
        </div>

        {/* TABS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
            padding: "4px",
            marginBottom: "28px",
            borderRadius: "14px",
            background: "#09151a",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              cursor: "pointer",
              background:
                mode === "login" ? "#1d8290" : "transparent",
              color:
                mode === "login" ? "#fff" : "#71868d",
              fontSize: "14px",
              fontWeight: "700",
            }}
          >
            Войти
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              cursor: "pointer",
              background:
                mode === "register" ? "#1d8290" : "transparent",
              color:
                mode === "register" ? "#fff" : "#71868d",
              fontSize: "14px",
              fontWeight: "700",
            }}
          >
            Регистрация
          </button>
        </div>

        {/* TITLE */}
        <h1
          style={{
            margin: "0 0 8px",
            color: "#fff",
            fontSize: "27px",
            lineHeight: "1.2",
          }}
        >
          {mode === "login"
            ? "С возвращением!"
            : "Создайте аккаунт"}
        </h1>

        <p
          style={{
            margin: "0 0 25px",
            color: "#82969d",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          {mode === "login"
            ? "Войдите, чтобы продолжить путешествие по Мангистау."
            : "Создайте аккаунт и планируйте поездки вместе."}
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#c6d3d7",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Имя
              </label>

              <input
                type="text"
                name="name"
                placeholder="Ваше имя"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#c6d3d7",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Телефон
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="+7 700 123 45 67"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle}
              />
            </>
          )}

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#c6d3d7",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="example@mail.com"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#c6d3d7",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Пароль
          </label>

          <input
            type="password"
            name="password"
            placeholder="Минимум 6 символов"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
            style={inputStyle}
          />

          {error && (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(214,69,69,.12)",
                border: "1px solid rgba(214,69,69,.25)",
                color: "#ff9b9b",
                fontSize: "13px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "13px",
              padding: "15px",
              marginTop: "5px",
              background: loading ? "#37656b" : "#1d8997",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading
              ? "Подождите..."
              : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
          </button>
        </form>

        {/* FOOTER */}
        <div
          style={{
            marginTop: "22px",
            textAlign: "center",
            color: "#71868c",
            fontSize: "13px",
          }}
        >
          {mode === "login" ? (
            <>
              Нет аккаунта?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                style={linkStyle}
              >
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                style={linkStyle}
              >
                Войти
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 15px",
  marginBottom: "17px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,.09)",
  outline: "none",
  background: "#09151a",
  color: "#fff",
  fontSize: "14px",
};

const linkStyle = {
  border: "none",
  background: "transparent",
  color: "#40b6c5",
  cursor: "pointer",
  fontWeight: "700",
  padding: "0",
};