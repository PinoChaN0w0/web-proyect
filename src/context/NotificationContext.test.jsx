import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NotificationProvider, useNotificaciones } from "./NotificationContext.jsx";

// Componente de prueba que expone las acciones del contexto con botones.
function Panel({ onAceptar = () => {}, opciones }) {
  const { notificar, confirmar } = useNotificaciones();
  return (
    <div>
      <button onClick={() => notificar("Mensaje 1")}>n1</button>
      <button onClick={() => notificar("Mensaje 2")}>n2</button>
      <button onClick={() => notificar("Mensaje 3")}>n3</button>
      <button onClick={() => notificar("Mensaje 4")}>n4</button>
      <button onClick={() => notificar("Falló algo", "error")}>nerror</button>
      <button onClick={() => confirmar("¿Seguro?", onAceptar, opciones)}>confirmar</button>
    </div>
  );
}

function conProvider(props) {
  return render(
    <NotificationProvider>
      <Panel {...props} />
    </NotificationProvider>
  );
}

const click = (nombre) => fireEvent.click(screen.getByRole("button", { name: nombre }));

describe("useNotificaciones – sin provider (respaldo nativo)", () => {
  it("notificar usa window.alert", () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<Panel />);
    click("n1");
    expect(window.alert).toHaveBeenCalledWith("Mensaje 1");
  });

  it("confirmar ejecuta la acción si el usuario acepta", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onAceptar = vi.fn();
    render(<Panel onAceptar={onAceptar} />);
    click("confirmar");
    expect(window.confirm).toHaveBeenCalledWith("¿Seguro?");
    expect(onAceptar).toHaveBeenCalledTimes(1);
  });

  it("confirmar no ejecuta la acción si el usuario cancela", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onAceptar = vi.fn();
    render(<Panel onAceptar={onAceptar} />);
    click("confirmar");
    expect(onAceptar).not.toHaveBeenCalled();
  });
});

describe("NotificationProvider – toasts", () => {
  it("muestra el mensaje con el tipo 'success' por defecto", () => {
    conProvider();
    click("n1");
    const toast = screen.getByText("Mensaje 1").closest(".toast-lu");
    expect(toast).toHaveClass("toast-lu--success");
  });

  it("aplica el tipo indicado (error)", () => {
    conProvider();
    click("nerror");
    expect(screen.getByText("Falló algo").closest(".toast-lu")).toHaveClass("toast-lu--error");
  });

  it("se cierra solo a los 3 segundos", () => {
    vi.useFakeTimers();
    conProvider();
    click("n1");
    expect(screen.getByText("Mensaje 1")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2999));
    expect(screen.getByText("Mensaje 1")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Mensaje 1")).not.toBeInTheDocument();
  });

  it("se puede cerrar con el botón ×", () => {
    conProvider();
    click("n1");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar mensaje" }));
    expect(screen.queryByText("Mensaje 1")).not.toBeInTheDocument();
  });

  it("muestra como máximo 3 toasts a la vez (descarta el más antiguo)", () => {
    conProvider();
    for (const n of ["n1", "n2", "n3", "n4"]) click(n);
    expect(screen.queryByText("Mensaje 1")).not.toBeInTheDocument();
    for (const m of ["Mensaje 2", "Mensaje 3", "Mensaje 4"]) {
      expect(screen.getByText(m)).toBeInTheDocument();
    }
  });
});

describe("NotificationProvider – diálogo de confirmación", () => {
  it("no hay diálogo hasta que se pide confirmar", () => {
    conProvider();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("muestra título, mensaje y textos por defecto", () => {
    conProvider();
    click("confirmar");
    const dialogo = screen.getByRole("dialog", { name: "Confirmar" });
    expect(dialogo).toBeInTheDocument();
    expect(screen.getByText("¿Seguro?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aceptar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("usa los textos personalizados de 'opciones'", () => {
    conProvider({ opciones: { titulo: "Vaciar carrito", textoAceptar: "Vaciar", textoCancelar: "No" } });
    click("confirmar");
    expect(screen.getByRole("dialog", { name: "Vaciar carrito" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vaciar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });

  it("Aceptar ejecuta la acción y cierra el diálogo", () => {
    const onAceptar = vi.fn();
    conProvider({ onAceptar });
    click("confirmar");
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(onAceptar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Cancelar cierra el diálogo sin ejecutar la acción", () => {
    const onAceptar = vi.fn();
    conProvider({ onAceptar });
    click("confirmar");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onAceptar).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("la tecla Escape cierra el diálogo sin ejecutar la acción", () => {
    const onAceptar = vi.fn();
    conProvider({ onAceptar });
    click("confirmar");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onAceptar).not.toHaveBeenCalled();
  });

  it("otras teclas no cierran el diálogo", () => {
    conProvider();
    click("confirmar");
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("clic en el fondo oscuro cierra el diálogo", () => {
    const { container } = conProvider();
    click("confirmar");
    fireEvent.click(container.ownerDocument.querySelector(".confirm-overlay"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clic dentro de la caja no cierra el diálogo", () => {
    conProvider();
    click("confirmar");
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
