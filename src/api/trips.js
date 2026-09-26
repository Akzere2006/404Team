const API_URL = import.meta.env.VITE_API_URL || "";

function getAuthHeaders() {
  const token = localStorage.getItem("mangystau_go_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createTrip(trip) {
  const response = await fetch(`${API_URL}/api/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(trip),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось создать поездку"
    );
  }

  return data.trip;
}