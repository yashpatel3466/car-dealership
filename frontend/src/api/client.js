const BASE_URL = "/api";

// Module-scoped token store. AuthContext calls setTokens() whenever the
// user logs in / out / refreshes; apiFetch reads from here on every call.
let tokens = { access: null, refresh: null };

export function setTokens(next) {
  tokens = next || { access: null, refresh: null };
}

/**
 * Minimal JSON fetch wrapper. Attaches the JWT access token when present
 * and throws an Error carrying the parsed body on non-2xx responses so
 * callers can surface field-level validation errors from DRF.
 */
export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && tokens.access) {
    headers.Authorization = `Bearer ${tokens.access}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error("Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const AuthAPI = {
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: payload, auth: false }),
};

export const VehicleAPI = {
  list: (page = 1) => apiFetch(`/vehicles/?page=${page}`),
  search: (params) => apiFetch(`/vehicles/search/?${new URLSearchParams(params).toString()}`),
  create: (payload) => apiFetch("/vehicles/", { method: "POST", body: payload }),
  update: (id, payload) => apiFetch(`/vehicles/${id}/`, { method: "PUT", body: payload }),
  remove: (id) => apiFetch(`/vehicles/${id}/`, { method: "DELETE" }),
  purchase: (id, quantity = 1) => apiFetch(`/vehicles/${id}/purchase/`, { method: "POST", body: { quantity } }),
  restock: (id, quantity = 1) => apiFetch(`/vehicles/${id}/restock/`, { method: "POST", body: { quantity } }),
};
