const API_URL = import.meta.env.VITE_API_URL || "";

function getAuthHeaders() {
  const token = localStorage.getItem("mangystau_go_token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getGroups() {
  const response = await fetch(`${API_URL}/api/groups`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось загрузить группы"
    );
  }

  return data.groups || [];
}

export async function createGroup(group) {
  const response = await fetch(`${API_URL}/api/groups`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(group),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось создать группу"
    );
  }

  return data.group;
}

export async function joinGroup(groupId) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/join`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Не удалось присоединиться к группе"
    );
  }

  return data;
}
export async function getMyGroups() {
  const response = await fetch(
    `${API_URL}/api/profile/groups`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Не удалось загрузить мои группы"
    );
  }

  return data.groups || [];
}