// Cliente HTTP para microservicios Spring Boot.
// Por defecto usa URLs separadas por servicio; si defines VITE_API_URL se usa como fallback común.
const trim = (u) => (u || "").replace(/\/$/, "");
const FALLBACK = trim(import.meta.env.VITE_API_URL) || "http://localhost:8080";
const AUTH_URL = trim(import.meta.env.VITE_AUTH_API_URL) || FALLBACK;
const PRODUCT_URL = trim(import.meta.env.VITE_PRODUCT_API_URL) || FALLBACK;
const USER_URL = trim(import.meta.env.VITE_USER_API_URL) || FALLBACK;
const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(baseUrl, path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl || FALLBACK}${path}`, { ...options, headers });
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (data && data.errors && Object.values(data.errors).join(". ")) ||
      `Error HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  login: (email, password) => apiFetch(AUTH_URL, "/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload) => apiFetch(AUTH_URL, "/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  getProducts: () => apiFetch(PRODUCT_URL, "/api/products"),
  getProduct: (id) => apiFetch(PRODUCT_URL, `/api/products/${id}`),
  createProduct: (payload) => apiFetch(PRODUCT_URL, "/api/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => apiFetch(PRODUCT_URL, `/api/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id) => apiFetch(PRODUCT_URL, `/api/products/${id}`, { method: "DELETE" }),
  getUsers: () => apiFetch(USER_URL, "/api/users"),
  createUser: (payload) => apiFetch(USER_URL, "/api/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id, payload) => apiFetch(USER_URL, `/api/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteUser: (id) => apiFetch(USER_URL, `/api/users/${id}`, { method: "DELETE" }),
};
