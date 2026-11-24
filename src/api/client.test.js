import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, apiFetch, getToken, setToken } from "./client.js";

// Respuesta falsa de fetch (no depende de que Response exista en el entorno de pruebas).
function respuesta(body, { status = 200, json = true, jsonRoto = false } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (k) => (k.toLowerCase() === "content-type" ? (json ? "application/json" : "text/plain") : null),
    },
    json: async () => {
      if (jsonRoto) throw new Error("JSON inválido");
      return body;
    },
    text: async () => String(body),
  };
}

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(respuesta({ ok: true }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const ultimaLlamada = () => fetchMock.mock.calls.at(-1);

describe("token", () => {
  it("setToken guarda y getToken lee", () => {
    setToken("abc");
    expect(getToken()).toBe("abc");
  });

  it("setToken(null) elimina el token", () => {
    setToken("abc");
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe("apiFetch", () => {
  it("arma la URL con la base y la ruta, y envía Content-Type JSON", async () => {
    await apiFetch("http://x", "/api/products");
    const [url, opts] = ultimaLlamada();
    expect(url).toBe("http://x/api/products");
    expect(opts.headers["Content-Type"]).toBe("application/json");
  });

  it("usa la URL por defecto si no se indica base", async () => {
    await apiFetch(undefined, "/api/products");
    expect(ultimaLlamada()[0]).toMatch(/^https?:\/\/.+\/api\/products$/);
  });

  it("envía Authorization Bearer cuando hay token", async () => {
    setToken("tok123");
    await apiFetch("http://x", "/api/products");
    expect(ultimaLlamada()[1].headers.Authorization).toBe("Bearer tok123");
  });

  it("no envía Authorization sin token", async () => {
    await apiFetch("http://x", "/api/products");
    expect(ultimaLlamada()[1].headers.Authorization).toBeUndefined();
  });

  it("respeta headers extra que pase quien llama", async () => {
    await apiFetch("http://x", "/y", { headers: { "X-Test": "1" } });
    expect(ultimaLlamada()[1].headers["X-Test"]).toBe("1");
  });

  it("devuelve el JSON cuando la respuesta es ok", async () => {
    fetchMock.mockResolvedValue(respuesta([{ id: 1 }]));
    await expect(apiFetch("http://x", "/y")).resolves.toEqual([{ id: 1 }]);
  });

  it("devuelve texto cuando la respuesta no es JSON", async () => {
    fetchMock.mockResolvedValue(respuesta("hola", { json: false }));
    await expect(apiFetch("http://x", "/y")).resolves.toBe("hola");
  });

  it("devuelve null si el JSON de una respuesta ok viene roto", async () => {
    fetchMock.mockResolvedValue(respuesta(null, { jsonRoto: true }));
    await expect(apiFetch("http://x", "/y")).resolves.toBeNull();
  });
});

describe("apiFetch – errores", () => {
  it("lanza Error con message y status si la respuesta no es ok", async () => {
    fetchMock.mockResolvedValue(respuesta({ message: "Credenciales inválidas" }, { status: 401 }));
    await expect(apiFetch("http://x", "/api/auth/login")).rejects.toMatchObject({
      message: "Credenciales inválidas",
      status: 401,
    });
  });

  it("usa el campo 'error' si no hay 'message'", async () => {
    fetchMock.mockResolvedValue(respuesta({ error: "Prohibido" }, { status: 403 }));
    await expect(apiFetch("http://x", "/y")).rejects.toMatchObject({ message: "Prohibido", status: 403 });
  });

  it("une los mensajes de 'errors' (validaciones por campo)", async () => {
    fetchMock.mockResolvedValue(
      respuesta({ errors: { email: "Correo inválido", password: "Muy corta" } }, { status: 400 })
    );
    await expect(apiFetch("http://x", "/y")).rejects.toMatchObject({
      message: "Correo inválido. Muy corta",
      status: 400,
    });
  });

  it("usa 'Error HTTP <status>' cuando no hay JSON", async () => {
    fetchMock.mockResolvedValue(respuesta("boom", { status: 500, json: false }));
    await expect(apiFetch("http://x", "/y")).rejects.toMatchObject({ message: "Error HTTP 500", status: 500 });
  });

  it("usa 'Error HTTP <status>' si el JSON de error viene roto", async () => {
    fetchMock.mockResolvedValue(respuesta(null, { status: 502, jsonRoto: true }));
    await expect(apiFetch("http://x", "/y")).rejects.toMatchObject({ message: "Error HTTP 502" });
  });

  it("guarda el cuerpo del error en error.data", async () => {
    fetchMock.mockResolvedValue(respuesta({ message: "No existe" }, { status: 404 }));
    const error = await apiFetch("http://x", "/y").catch((e) => e);
    expect(error.data).toEqual({ message: "No existe" });
  });
});

describe("api – endpoints", () => {
  // [método de api, argumentos, verbo HTTP, ruta esperada, body esperado]
  const casos = [
    ["login", ["a@b.cl", "Clave123!"], "POST", "/api/auth/login", { email: "a@b.cl", password: "Clave123!" }],
    ["register", [{ nombre: "N" }], "POST", "/api/auth/register", { nombre: "N" }],
    ["getProducts", [], undefined, "/api/products", undefined],
    ["getProduct", [5], undefined, "/api/products/5", undefined],
    ["createProduct", [{ nombre: "P" }], "POST", "/api/products", { nombre: "P" }],
    ["updateProduct", [7, { nombre: "P2" }], "PUT", "/api/products/7", { nombre: "P2" }],
    ["deleteProduct", [7], "DELETE", "/api/products/7", undefined],
    ["getUsers", [], undefined, "/api/users", undefined],
    ["createUser", [{ nombre: "U" }], "POST", "/api/users", { nombre: "U" }],
    ["updateUser", [3, { nombre: "U2" }], "PUT", "/api/users/3", { nombre: "U2" }],
    ["deleteUser", [3], "DELETE", "/api/users/3", undefined],
  ];

  it.each(casos)("%s llama al endpoint correcto", async (metodo, args, verbo, ruta, body) => {
    await api[metodo](...args);
    const [url, opts] = ultimaLlamada();
    expect(url.endsWith(ruta)).toBe(true);
    expect(opts.method).toBe(verbo);
    if (body === undefined) expect(opts.body).toBeUndefined();
    else expect(JSON.parse(opts.body)).toEqual(body);
  });
});
