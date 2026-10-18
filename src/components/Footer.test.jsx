import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer.jsx";

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer", () => {
  it("muestra la marca y el eslogan", () => {
    renderFooter();
    expect(screen.getByRole("heading", { name: "LEVEL-UP" })).toBeInTheDocument();
    expect(screen.getByText("Tu tienda gamer de confianza.")).toBeInTheDocument();
  });

  it("muestra los enlaces de navegación internos con ruta correcta", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Productos" })).toHaveAttribute("href", "/productos");
    expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute("href", "/contacto");
    expect(screen.getAllByRole("link").length).toBeGreaterThanOrEqual(6);
  });

  it("muestra los datos de contacto", () => {
    renderFooter();
    expect(screen.getByText("+56 9 6650 5847")).toBeInTheDocument();
    expect(screen.getByText("contacto@levelup.cl")).toBeInTheDocument();
  });

  it("muestra el copyright", () => {
    renderFooter();
    expect(screen.getByText(/© 2026 Level-Up Gamer/)).toBeInTheDocument();
  });
});
