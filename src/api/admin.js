const API_URL = import.meta.env.VITE_API_URL || "";

function getAuthHeaders() {
  const token = localStorage.getItem("mangystau_go_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* =========================
   DASHBOARD
========================= */

export async function getAdminDashboard() {
  const response = await fetch(
    `${API_URL}/api/admin/dashboard`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Ошибка загрузки панели"
    );
  }

  return data;
}

/* =========================
   PLACES
========================= */

export async function getAdminPlaces() {
  const response = await fetch(
    `${API_URL}/api/admin/places`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Ошибка загрузки мест"
    );
  }

  return data.places || [];
}

export async function createAdminPlace(place) {
  const response = await fetch(
    `${API_URL}/api/admin/places`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(place),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось создать место"
    );
  }

  return data.place;
}

export async function updateAdminPlace(id, place) {
  const response = await fetch(
    `${API_URL}/api/admin/places/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(place),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось обновить место"
    );
  }

  return data.place;
}

/* =========================
   SAFETY
========================= */

export async function getAdminSafety() {
  const response = await fetch(
    `${API_URL}/api/admin/safety`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Ошибка загрузки предупреждений"
    );
  }

  return data.alerts || [];
}

export async function createAdminSafety(alert) {
  const response = await fetch(
    `${API_URL}/api/admin/safety`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(alert),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось создать предупреждение"
    );
  }

  return data.alert;
}

export async function updateAdminSafety(id, data) {
  const response = await fetch(
    `${API_URL}/api/admin/safety/${id}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Не удалось обновить предупреждение"
    );
  }

  return result.alert;
}

/* =========================
   GROUPS
========================= */

export async function getAdminGroups() {
  const response = await fetch(
    `${API_URL}/api/admin/groups`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Ошибка загрузки групп"
    );
  }

  return data.groups || [];
}

/* =========================
   USERS
========================= */

export async function getAdminUsers() {
  const response = await fetch(
    `${API_URL}/api/admin/users`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Ошибка загрузки пользователей"
    );
  }

  return data.users || [];
}