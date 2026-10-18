import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Proximamente from "./Proximamente.jsx";

describe("Proximamente", () => {
  it("muestra el título recibido por props", () => {
    render(
      <MemoryRouter>
        <Proximamente titulo="Nosotros" />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Nosotros" })).toBeInTheDocument();
  });

  it("muestra el mensaje de sección pendiente", () => {
    render(
      <MemoryRouter>
        <Proximamente titulo="Blogs" />
      </MemoryRouter>
    );
    expect(screen.getByText("Esta sección estará disponible próximamente.")).toBeInTheDocument();
  });

  it("el botón de volver enlaza al inicio", () => {
    render(
      <MemoryRouter>
        <Proximamente titulo="Contacto" />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });
});
