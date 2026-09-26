const API_URL = import.meta.env.VITE_API_URL || "";

export async function getProfileStats() {
  const token = localStorage.getItem("mangystau_go_token");

  const response = await fetch(
    `${API_URL}/api/profile/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось загрузить статистику"
    );
  }

  return data.stats;
}