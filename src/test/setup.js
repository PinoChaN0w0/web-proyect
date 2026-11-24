import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom no implementa scrollTo (emite "Not implemented"); lo stubbiamos globalmente.
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true, configurable: true });

beforeEach(() => {
  window.scrollTo.mockClear();
  // jsdom tampoco implementa alert(); lo silenciamos.
  window.alert = vi.fn();
});

// Estado limpio entre pruebas: el estado real vive en localStorage/sessionStorage.
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});