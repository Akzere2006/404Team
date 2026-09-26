const API_URL = import.meta.env.VITE_API_URL || "";

export async function getSafetyAlerts() {
  const response = await fetch(`${API_URL}/api/safety`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось загрузить предупреждения"
    );
  }

  return data.alerts || [];
}

export async function getWeather() {
  const response = await fetch(`${API_URL}/api/weather`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось загрузить погоду"
    );
  }

  return data.weather || [];
}

export async function getWeatherByPlace(placeId) {
  const response = await fetch(
    `${API_URL}/api/weather/place/${placeId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Не удалось получить погоду для места"
    );
  }

  return data.weather;
}