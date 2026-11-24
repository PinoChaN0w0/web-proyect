import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import AdminUsuarios from "./AdminUsuarios.jsx";
import { api } from "../api/client.js";

// La pantalla lista y modifica usuarios a través del backend (api.*User*).
vi.mock("../api/client.js", () => ({
  api: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

const usuarios = [
  { id: 1, nombre: "Ana", email: "ana@x.cl", role: "ADMIN", fechaNacimiento: "1990-01-01" },
  { id: 2, nombre: "Beto", email: "beto@x.cl", role: "CLIENTE" }, // sin fecha de nacimiento
];

// Renderiza y espera a que la tabla termine de cargar.
async function renderPantalla() {
  render(<AdminUsuarios />);
  await screen.findByRole("row", { name: /ana@x\.cl/ });
}

const filaAna = () => screen.getByRole("row", { name: /ana@x\.cl/ });
const filaBeto = () => screen.getByRole("row", { name: /beto@x\.cl/ });

function llenar({ nombre = "", email = "", password = "", fecha = "", role } = {}) {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: nombre } });
  fireEvent.change(screen.getByLabelText("Correo"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: password } });
  if (fecha) fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), { target: { value: fecha } });
  if (role) fireEvent.change(screen.getByLabelText("Rol"), { target: { value: role } });
}

// submit directo: evita que la validación HTML bloquee el evento y probamos la de la app.
function enviar(boton = "GUARDAR") {
  fireEvent.submit(screen.getByRole("button", { name: boton }).closest("form"));
}

beforeEach(() => {
  api.getUsers.mockReset().mockResolvedValue(usuarios);
  api.createUser.mockReset().mockResolvedValue({});
  api.updateUser.mockReset().mockResolvedValue({});
  api.deleteUser.mockReset().mockResolvedValue({});
});

describe("AdminUsuarios – listado", () => {
  it("muestra 'Cargando usuarios...' y luego la tabla con los usuarios", async () => {
    render(<AdminUsuarios />);
    expect(screen.getByText("Cargando usuarios...")).toBeInTheDocument();
    await screen.findByRole("row", { name: /ana@x\.cl/ });
    expect(screen.getAllByRole("row").slice(1)).toHaveLength(2);
    expect(within(filaAna()).getByText("ADMIN")).toBeInTheDocument();
    expect(within(filaBeto()).getByText("CLIENTE")).toBeInTheDocument();
  });

  it("muestra el error del backend si falla la carga", async () => {
    api.getUsers.mockRejectedValue(new Error("Error HTTP 403"));
    render(<AdminUsuarios />);
    expect(await screen.findByText("Error HTTP 403")).toBeInTheDocument();
  });

  it("usa un mensaje genérico si el error no trae texto", async () => {
    api.getUsers.mockRejectedValue(new Error(""));
    render(<AdminUsuarios />);
    expect(await screen.findByText("No se pudieron cargar los usuarios.")).toBeInTheDocument();
  });

  it("si el backend no devuelve un arreglo, muestra la tabla vacía", async () => {
    api.getUsers.mockResolvedValue(null);
    render(<AdminUsuarios />);
    await screen.findByRole("table");
    expect(screen.getAllByRole("row")).toHaveLength(1); // solo el encabezado
  });
});

describe("AdminUsuarios – crear", () => {
  it("valida que nombre y correo sean obligatorios", async () => {
    await renderPantalla();
    llenar({ nombre: "  ", email: "", password: "secreto123" });
    enviar();
    expect(await screen.findByText("Error: nombre y correo son obligatorios.")).toBeInTheDocument();
    expect(api.createUser).not.toHaveBeenCalled();
  });

  it("exige contraseña de al menos 6 caracteres al crear", async () => {
    await renderPantalla();
    llenar({ nombre: "Nuevo", email: "n@x.cl", password: "123" });
    enviar();
    expect(await screen.findByText("Error: la contraseña debe tener al menos 6 caracteres.")).toBeInTheDocument();
    expect(api.createUser).not.toHaveBeenCalled();
  });

  it("exige contraseña si se deja vacía al crear", async () => {
    await renderPantalla();
    llenar({ nombre: "Nuevo", email: "n@x.cl", password: "" });
    enviar();
    expect(await screen.findByText("Error: la contraseña debe tener al menos 6 caracteres.")).toBeInTheDocument();
  });

  it("crea el usuario normalizando el correo y recarga la lista", async () => {
    await renderPantalla();
    llenar({ nombre: "  Nuevo  ", email: "  NUEVO@X.CL ", password: "secreto123", fecha: "2000-05-10", role: "ADMIN" });
    enviar();

    expect(await screen.findByText("Usuario creado correctamente.")).toBeInTheDocument();
    expect(api.createUser).toHaveBeenCalledWith({
      nombre: "Nuevo",
      email: "nuevo@x.cl",
      password: "secreto123",
      fechaNacimiento: "2000-05-10",
      role: "ADMIN",
    });
    expect(api.getUsers).toHaveBeenCalledTimes(2); // carga inicial + recarga
  });

  it("envía fechaNacimiento null si no se indica y rol CLIENTE por defecto", async () => {
    await renderPantalla();
    llenar({ nombre: "Sin Fecha", email: "sf@x.cl", password: "secreto123" });
    enviar();
    await screen.findByText("Usuario creado correctamente.");
    expect(api.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ fechaNacimiento: null, role: "CLIENTE" })
    );
  });

  it("limpia el formulario tras guardar", async () => {
    await renderPantalla();
    llenar({ nombre: "Nuevo", email: "n@x.cl", password: "secreto123" });
    enviar();
    await screen.findByText("Usuario creado correctamente.");
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(screen.getByLabelText("Correo")).toHaveValue("");
  });

  it("muestra el error del backend si falla la creación", async () => {
    api.createUser.mockRejectedValue(new Error("Error: Este correo ya está registrado."));
    await renderPantalla();
    llenar({ nombre: "Dup", email: "ana@x.cl", password: "secreto123" });
    enviar();
    expect(await screen.findByText("Error: Este correo ya está registrado.")).toBeInTheDocument();
  });

  it("usa un mensaje genérico si el error al guardar no trae texto", async () => {
    api.createUser.mockRejectedValue(new Error(""));
    await renderPantalla();
    llenar({ nombre: "X", email: "x@x.cl", password: "secreto123" });
    enviar();
    expect(await screen.findByText("Error al guardar el usuario.")).toBeInTheDocument();
  });
});

describe("AdminUsuarios – editar", () => {
  it("precarga el formulario con los datos del usuario", async () => {
    await renderPantalla();
    fireEvent.click(within(filaAna()).getByRole("button", { name: "Editar" }));

    expect(screen.getByText("Editar usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByLabelText("Correo")).toHaveValue("ana@x.cl");
    expect(screen.getByLabelText(/Contraseña/)).toHaveValue("");
    expect(screen.getByLabelText("Fecha de nacimiento")).toHaveValue("1990-01-01");
    expect(screen.getByLabelText("Rol")).toHaveValue("ADMIN");
    expect(screen.getByText(/dejar vacío para no cambiar/)).toBeInTheDocument();
  });

  it("usa valores por defecto si el usuario no tiene fecha de nacimiento", async () => {
    await renderPantalla();
    fireEvent.click(within(filaBeto()).getByRole("button", { name: "Editar" }));
    expect(screen.getByLabelText("Fecha de nacimiento")).toHaveValue("");
    expect(screen.getByLabelText("Rol")).toHaveValue("CLIENTE");
  });

  it("actualiza sin exigir contraseña", async () => {
    await renderPantalla();
    fireEvent.click(within(filaAna()).getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana Editada" } });
    enviar("ACTUALIZAR");

    expect(await screen.findByText("Usuario actualizado correctamente.")).toBeInTheDocument();
    expect(api.updateUser).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ nombre: "Ana Editada", email: "ana@x.cl", password: "" })
    );
    expect(api.createUser).not.toHaveBeenCalled();
  });

  it("'Cancelar' sale del modo edición sin guardar", async () => {
    await renderPantalla();
    fireEvent.click(within(filaAna()).getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "No Guardar" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByText("Agregar usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(api.updateUser).not.toHaveBeenCalled();
  });
});

describe("AdminUsuarios – eliminar", () => {
  it("pide confirmación y elimina el usuario vía API", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderPantalla();
    fireEvent.click(within(filaBeto()).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(api.deleteUser).toHaveBeenCalledWith(2));
    expect(await screen.findByText("Usuario eliminado.")).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar al usuario "beto@x.cl"?');
  });

  it("cancelar la confirmación conserva al usuario", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    await renderPantalla();
    fireEvent.click(within(filaBeto()).getByRole("button", { name: "Eliminar" }));
    expect(api.deleteUser).not.toHaveBeenCalled();
    expect(filaBeto()).toBeInTheDocument();
  });

  it("muestra el error del backend si falla el borrado", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.deleteUser.mockRejectedValue(new Error("Error HTTP 403"));
    await renderPantalla();
    fireEvent.click(within(filaBeto()).getByRole("button", { name: "Eliminar" }));
    expect(await screen.findByText("Error HTTP 403")).toBeInTheDocument();
  });

  it("usa un mensaje genérico si el error al eliminar no trae texto", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.deleteUser.mockRejectedValue(new Error(""));
    await renderPantalla();
    fireEvent.click(within(filaBeto()).getByRole("button", { name: "Eliminar" }));
    expect(await screen.findByText("Error al eliminar el usuario.")).toBeInTheDocument();
  });

  it("si se elimina el usuario que se está editando, el formulario se limpia", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderPantalla();
    fireEvent.click(within(filaAna()).getByRole("button", { name: "Editar" }));
    expect(screen.getByText("Editar usuario")).toBeInTheDocument();

    fireEvent.click(within(filaAna()).getByRole("button", { name: "Eliminar" }));
    await screen.findByText("Usuario eliminado.");
    expect(screen.getByText("Agregar usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
  });
});
