const API_URL = import.meta.env.VITE_API_URL || "";


function getAuthHeaders() {
  const token =
    localStorage.getItem(
      "mangystau_go_token"
    );

  return {
    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,
  };
}


/* =========================
   GET MESSAGES
========================= */

export async function getGroupMessages(
  groupId
) {
  const response =
    await fetch(
      `${API_URL}/api/groups/${groupId}/messages`,
      {
        method: "GET",
        headers:
          getAuthHeaders(),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Ошибка загрузки чата"
    );
  }

  return data.messages || [];
}


/* =========================
   SEND MESSAGE
========================= */

export async function sendGroupMessage(
  groupId,
  message
) {
  const response =
    await fetch(
      `${API_URL}/api/groups/${groupId}/messages`,
      {
        method: "POST",

        headers:
          getAuthHeaders(),

        body: JSON.stringify({
          message,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Ошибка отправки сообщения"
    );
  }

  return data.message;
}