import { api, apiFetch, getToken, setToken } from "./client.js";

function respuesta(body, { status = 200, json = true } = {}) {
  return Promise.resolve(
    new Response(json ? JSON.stringify(body) : body, {
      status,
      headers: { "Content-Type": json ? "application/json" : "text/plain" },
    })
  );
}

describe("cliente API", () => {
  afterEach(() => localStorage.clear());

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
    it("envía Authorization Bearer cuando hay token", async () => {
      setToken("tok123");
      const spy = spyOn(window, "fetch").and.returnValue(respuesta({ ok: true }));
      await apiFetch("http://x", "/api/products");
      const [url, opts] = spy.calls.mostRecent().args;
      expect(url).toBe("http://x/api/products");
      expect(opts.headers.Authorization).toBe("Bearer tok123");
    });

    it("no envía Authorization sin token", async () => {
      const spy = spyOn(window, "fetch").and.returnValue(respuesta([]));
      await apiFetch("http://x", "/api/products");
      expect(spy.calls.mostRecent().args[1].headers.Authorization).toBeUndefined();
    });

    it("lanza Error con message y status si la respuesta no es ok", async () => {
      spyOn(window, "fetch").and.returnValue(respuesta({ message: "Credenciales inválidas" }, { status: 401 }));
      await expectAsync(apiFetch("http://x", "/api/auth/login")).toBeRejectedWith(
        jasmine.objectContaining({ message: "Credenciales inválidas", status: 401 })
      );
    });

    it("usa mensaje genérico 'Error HTTP <status>' cuando no hay JSON", async () => {
      spyOn(window, "fetch").and.returnValue(respuesta("boom", { status: 500, json: false }));
      await expectAsync(apiFetch("http://x", "/y")).toBeRejectedWith(
        jasmine.objectContaining({ message: "Error HTTP 500", status: 500 })
      );
    });
  });

  describe("api", () => {
    it("login hace POST /api/auth/login con email y password", async () => {
      const spy = spyOn(window, "fetch").and.returnValue(respuesta({ token: "t" }));
      await api.login("a@b.cl", "Clave123!");
      const [url, opts] = spy.calls.mostRecent().args;
      expect(url).toContain("/api/auth/login");
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body)).toEqual({ email: "a@b.cl", password: "Clave123!" });
    });

    it("deleteProduct hace DELETE /api/products/:id", async () => {
      const spy = spyOn(window, "fetch").and.returnValue(respuesta({}));
      await api.deleteProduct(7);
      const [url, opts] = spy.calls.mostRecent().args;
      expect(url).toContain("/api/products/7");
      expect(opts.method).toBe("DELETE");
    });

    it("updateUser hace PUT /api/users/:id", async () => {
      const spy = spyOn(window, "fetch").and.returnValue(respuesta({}));
      await api.updateUser(3, { nombre: "Z" });
      const [url, opts] = spy.calls.mostRecent().args;
      expect(url).toContain("/api/users/3");
      expect(opts.method).toBe("PUT");
    });
  });
});
