# AGENTS.md

Single-package Vite + React 18 SPA ("Level-Up Gamer", Chilean gamer e-commerce, school project) using React Router v6. UI strings, error messages, and code comments are in Spanish — keep new ones in Spanish.

## Commands

- `npm install`
- `npm run dev` — dev server at http://localhost:5173
- `npm run build` — outputs `/dist`
- `npm run preview` — serves `/dist`
- `npm test` — runs the unit test suite once (`npm run test:watch` for watch mode)
- `npm run test:coverage` — same + coverage report (v8); thresholds enforced at 60% in `vite.config.js`
- No lint, formatter, typecheck, or CI exist — don't add tooling for them unless asked.

## Testing

- Stack: Vitest 3 (pinned to v3 because the project uses Vite 5) + @testing-library/react + jsdom. Config lives in `vite.config.js` under `test`.
- Tests are colocated as `src/**/*.test.{js,jsx}`; shared helpers (`renderPagina`, `seedCart`, `seedAuth`) live in `src/test/helpers.jsx` and global setup in `src/test/setup.js` (clears localStorage/sessionStorage and mocks `scrollTo` after each test).
- Direct context calls in tests (e.g. `useCart().agregar(...)`) must be wrapped in `act()` or state won't flush before assertions.
- Submit forms with `fireEvent.submit(form)`, not click: jsdom enforces HTML5 validation (`required`, `type=email`, `min`), which would block the submit event before app-level validation runs.
- `Admin.jsx` mutates the imported catalog module (`src/data/productos.js`) via splice; `Admin.test.jsx` snapshots and restores it in `afterEach` — any new test touching the admin must do the same.
- For `input[type=number]`, jest-dom's `toHaveValue` compares numbers (`null` when empty), not strings.

## Structure

- Entry chain: root `index.html` → `src/main.jsx` → `src/App.jsx` (routes) → `src/pages/*` wrapped in `src/components/Layout.jsx`.
- `src/data/productos.js` is the single product catalog. Image paths there are relative to `/public` (e.g. `ASSETS/Productos/catan.jpg`; filenames contain spaces) and `imagen: null` falls back to the `emoji` field.
- State is localStorage only (no backend). Keys are intentionally shared with the old static site — keep the exact names: `carrito`, `usuarios`, `usuarioLogueado`, `usuarioActual`, `correoUsuario`, `descuentoActivo`, `productosTienda`.
- Styling: `src/styles/Styles.css` (original site CSS, loaded first) + `src/styles/react-overrides.css` (small deltas). The `#root` flex rules in the overrides file must stay — React moved the layout container from `body` to `#root`, and removing them breaks the sticky footer. Bootstrap 5, FontAwesome, and Google Fonts are CDN `<link>`s in root `index.html`, not npm packages.
- Format prices with `formatearPrecio` (`src/utils/format.js`, locale `es-CL`, suffix "CLP").

## Gotchas

- `/admin` (hardcoded creds `admin@levelup.cl` / `admin123`, gate in `sessionStorage.adminOk`) mutates the imported catalog module in place and writes `productosTienda` to localStorage — but nothing reads that key on boot, so admin edits vanish on reload. If asked to persist them, hydrate `src/data/productos.js` from `productosTienda` at startup.
- Auth stores passwords in plain text in localStorage; this is a deliberate no-backend constraint, not an oversight to "fix" unprompted.
- Duoc student discount: emails ending in `@duocuc.cl` or `@duoc.cl` get 20% off in `Carrito.jsx` (`esCorreoDuoc` in `src/utils/validators.js`).
- `Registro.jsx` requires users to be 18+ (`esMayorDeEdad`).

## Legacy static site — do not touch for new work

`carrito.html`, `registro.html`, root `ASSETS/`, and `Backend/` are leftovers of the pre-React site. `Backend/` is **not** a server — it's vanilla JS for those pages, which also reference `CSS/Styles.css` and sibling `.html` pages that no longer exist (already broken). The real app assets live in `public/ASSETS/`; root `ASSETS/` is a stale duplicate. New code goes in `src/` only.

## Deploy

SPA with client-side routes: hosting must rewrite all paths to `index.html` (see README). For subdirectory hosting (e.g. GitHub Pages `/web-proyect/`), change `base` in `vite.config.js`; `BrowserRouter` already uses `basename={import.meta.env.BASE_URL}`.
