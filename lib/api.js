// small helper to call our backend api
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    // for image upload, the browser sets the content type itself
    payload = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "something went wrong");
  }
  return data;
}