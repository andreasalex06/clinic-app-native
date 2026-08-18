const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5050/api";

export async function apiGet(path: string) {
  const response = await fetch(`${API_URL}${path}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan");
  }

  return data;
}

export async function apiPost(path: string, body: object) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan");
  }

  return data;
}