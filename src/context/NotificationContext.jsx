import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// Mensajes propios de la página (toasts y diálogo de confirmación) en lugar de alert()/confirm() del navegador.
// Sin el provider, usa los cuadros nativos como respaldo (así los componentes siguen funcionando en pruebas aisladas).
const NotificationContext = createContext({
  notificar: (mensaje) => window.alert(mensaje),
  confirmar: (mensaje, onAceptar) => {
    if (window.confirm(mensaje)) onAceptar();
  },
});

const DURACION_TOAST_MS = 3000;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialogo, setDialogo] = useState(null);
  const siguienteId = useRef(0);

  const cerrarToast = useCallback((id) => {
    setToasts((lista) => lista.filter((t) => t.id !== id));
  }, []);

  // tipo: "success" | "error" | "info"
  const notificar = useCallback(
    (mensaje, tipo = "success") => {
      const id = ++siguienteId.current;
      setToasts((lista) => [...lista.slice(-2), { id, mensaje, tipo }]); // máximo 3 visibles
      setTimeout(() => cerrarToast(id), DURACION_TOAST_MS);
    },
    [cerrarToast]
  );

  const confirmar = useCallback((mensaje, onAceptar, opciones = {}) => {
    setDialogo({
      mensaje,
      onAceptar,
      titulo: opciones.titulo ?? "Confirmar",
      textoAceptar: opciones.textoAceptar ?? "Aceptar",
      textoCancelar: opciones.textoCancelar ?? "Cancelar",
    });
  }, []);

  const cerrarDialogo = () => setDialogo(null);
  const aceptar = () => {
    const accion = dialogo?.onAceptar;
    setDialogo(null);
    if (accion) accion();
  };

  useEffect(() => {
    if (!dialogo) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setDialogo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogo]);

  return (
    <NotificationContext.Provider value={{ notificar, confirmar }}>
      {children}

      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-lu toast-lu--${t.tipo}`}>
            <span>{t.mensaje}</span>
            <button type="button" className="toast-lu__close" aria-label="Cerrar mensaje" onClick={() => cerrarToast(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      {dialogo && (
        <div className="confirm-overlay" onClick={cerrarDialogo}>
          <div
            className="confirm-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-titulo">{dialogo.titulo}</h3>
            <p>{dialogo.mensaje}</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-outline-light" onClick={cerrarDialogo} autoFocus>
                {dialogo.textoCancelar}
              </button>
              <button type="button" className="btn btn-neon" onClick={aceptar}>
                {dialogo.textoAceptar}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotificaciones() {
  return useContext(NotificationContext);
}
