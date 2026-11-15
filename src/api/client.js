// Cliente HTTP para la API Spring Boot (variable de entorno VITE_API_URL)
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Error HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  login: (email, password) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload) => apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  getProducts: () => apiFetch("/api/products"),
  getProduct: (id) => apiFetch(`/api/products/${id}`),
  createProduct: (payload) => apiFetch("/api/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => apiFetch(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id) => apiFetch(`/api/products/${id}`, { method: "DELETE" }),
  getUsers: () => apiFetch("/api/users"),
  createUser: (payload) => apiFetch("/api/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id, payload) => apiFetch(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteUser: (id) => apiFetch(`/api/users/${id}`, { method: "DELETE" }),
};
