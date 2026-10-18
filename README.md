# Level-Up Gamer (React)

Migración del sitio estático a React + Vite + React Router.

Grupo 2: Diego Castillo, Cristian Ayala, Diego Reyes.

## Uso

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # genera /dist
npm run preview  # sirve /dist localmente
```

## Estructura

```
src/
  components/   Layout, Header, Footer, ProductCard, ProductImage
  context/      CartContext (carrito), AuthContext (login/registro/sesión)
  data/         productos.js (catálogo único)
  pages/        Home, Productos, ProductoDetalle, Carrito, Login, Registro
  styles/       Styles.css (original) + react-overrides.css
  utils/        format.js, validators.js
public/ASSETS/  imágenes de productos
```

## Despliegue

Es una SPA con rutas del lado del cliente: el hosting debe redirigir cualquier
ruta a `index.html` (Netlify/Vercel lo hacen con una regla de rewrite; en
GitHub Pages hay que usar HashRouter o un `404.html`).



@@ -0,0 +1,174 @@
# Pruebas unitarias – Level-Up Gamer

Este documento describe **solo las pruebas unitarias** del proyecto: cómo están
hechas, cómo ejecutarlas y qué cubren.

- **175 pruebas** repartidas en **19 archivos**.
- **Cobertura total:** 100 % de líneas, sentencias y funciones; 97,18 % de ramas
  (el mínimo exigido es **60 %**).
- Las pruebas se generaron con apoyo de [OpenCode](https://opencode.ai) y fueron
  revisadas y ejecutadas con medición de cobertura.

## Tecnologías

| Herramienta | Uso |
| --- | --- |
| [Vitest](https://vitest.dev) 3 | Ejecutor de pruebas (v3 porque el proyecto usa Vite 5) |
| [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) | Renderizar componentes y consultar el DOM como lo haría un usuario |
| @testing-library/jest-dom | Aserciones del DOM (`toBeInTheDocument`, `toHaveValue`, etc.) |
| @testing-library/user-event | Simular interacciones del usuario (escribir, hacer clic) |
| jsdom | Entorno de navegador simulado |
| @vitest/coverage-v8 | Medición de cobertura |

## Cómo ejecutar las pruebas

```bash
npm install             # instala también las dependencias de prueba
npm test                # ejecuta todas las pruebas una vez
npm run test:watch      # modo observador: re-ejecuta al guardar cambios
npm run test:coverage   # pruebas + reporte de cobertura
```

`npm run test:coverage` imprime una tabla en la terminal y genera un reporte HTML
en `coverage/`. Abre `coverage/index.html` en el navegador para ver, línea por
línea, qué código está cubierto (verde) y cuál no (rojo).

Si `npm test` no existe en tu `package.json`, agrega estos scripts y
dependencias de desarrollo:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
},
"devDependencies": {
  "@testing-library/dom": "^10.4.2",
  "@testing-library/jest-dom": "^7.0.1",
  "@testing-library/react": "^16.3.3",
  "@testing-library/user-event": "^14.6.8",
  "@vitest/coverage-v8": "^3.2.7",
  "jsdom": "^30.1.3",
  "vitest": "^3.2.7"
}
```

y el bloque `test` dentro de `vite.config.js`:

```js
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: "./src/test/setup.js",
  include: ["src/**/*.test.{js,jsx}"],
  coverage: {
    provider: "v8",
    include: ["src/**/*.{js,jsx}"],
    exclude: ["src/main.jsx"], // solo arranque de ReactDOM, sin lógica testeable
    reporter: ["text", "html"],
    thresholds: { statements: 60, branches: 60, functions: 60, lines: 60 },
  },
},
```

Con los `thresholds` en 60 %, si la cobertura baja de ese valor el comando
`npm run test:coverage` falla.

## Organización

Las pruebas están **junto al código** que prueban (`Archivo.jsx` →
`Archivo.test.jsx`), más una carpeta de apoyo:

```
src/
  test/
    setup.js        Configuración global de las pruebas
    helpers.jsx     Funciones de ayuda reutilizables
  components/       Header, Footer, Layout, ProductCard, ProductImage  (+ .test.jsx)
  context/          AuthContext, CartContext                            (+ .test.jsx)
  data/             productos.js                                        (+ .test.js)
  pages/            Home, Productos, ProductoDetalle, Carrito, Login,
                    Registro, Proximamente, Admin                       (+ .test.jsx)
  utils/            format.js, validators.js                            (+ .test.js)
  App.test.jsx      Pruebas de enrutado
```

### `src/test/setup.js`

Se ejecuta antes de cada prueba:

- Carga los matchers de `jest-dom`.
- Reemplaza `window.scrollTo` por un mock (jsdom no lo implementa).
- Después de **cada** prueba limpia `localStorage` y `sessionStorage`, restaura los
  mocks y los temporizadores, para que las pruebas sean independientes entre sí.

### `src/test/helpers.jsx`

| Helper | Qué hace |
| --- | --- |
| `renderPagina(elemento, { ruta, path })` | Renderiza un componente con los providers reales (`AuthProvider` + `CartProvider`) y un `MemoryRouter` |
| `seedCart(items)` | Deja un carrito inicial en `localStorage` (clave `carrito`) |
| `seedAuth({ nombre, email, descuento })` | Deja una sesión iniciada en `localStorage` |
| `productoDePrueba` | Producto de ejemplo con todos los campos del catálogo |

## Qué se prueba

| Archivo de prueba | Pruebas | Qué verifica |
| --- | :---: | --- |
| `src/utils/validators.test.js` | 20 | `esMayorDeEdad` (casos límite de 18 años, fecha inválida), `esEmailValido`, `esCorreoDuoc` (dominios válidos, sufijos falsos, mayúsculas) |
| `src/utils/format.test.js` | 5 | `formatearPrecio`: separador de miles `es-CL`, precio 0, millones, sufijo `CLP` |
| `src/data/productos.test.js` | 8 | Integridad del catálogo: ids únicos, precios enteros positivos, campos no vacíos, rutas de imagen, productos destacados, categorías sin duplicados |
| `src/context/AuthContext.test.jsx` | 22 | Registro (validaciones y duplicados), login, descuento Duoc, restauración de sesión, JSON corrupto, logout, uso fuera del provider |
| `src/context/CartContext.test.jsx` | 14 | Agregar, sumar, restar, eliminar, vaciar, persistencia en `localStorage`, JSON corrupto, uso fuera del provider |
| `src/components/Header.test.jsx` | 9 | Logo, enlaces, estado con y sin sesión, logout, contador del carrito, ruta activa |
| `src/components/Footer.test.jsx` | 4 | Marca, enlaces internos, contacto, copyright |
| `src/components/Layout.test.jsx` | 3 | Header + contenido + footer, `scrollTo` al montar y al cambiar de ruta |
| `src/components/ProductCard.test.jsx` | 7 | Datos del producto, enlace al detalle, modo normal vs. compacto, agregar al carrito |
| `src/components/ProductImage.test.jsx` | 7 | Imagen con `BASE_URL`, respaldo a emoji (`null`, vacío, `onError`), variantes `thumb` y `card` |
| `src/pages/Home.test.jsx` | 5 | Hero, botón a `/productos`, 3 productos destacados, sección About |
| `src/pages/Productos.test.jsx` | 9 | Listado, búsqueda (sin distinguir mayúsculas), filtro por categoría, combinación de filtros, mensaje sin resultados |
| `src/pages/ProductoDetalle.test.jsx` | 6 | Datos e imagen del producto, agregar al carrito, id inexistente o no numérico |
| `src/pages/Carrito.test.jsx` | 14 | Carrito vacío, cambios de cantidad, eliminar, vaciar con confirmación, descuento Duoc del 20 % y su redondeo |
| `src/pages/Login.test.jsx` | 6 | Formulario, errores de credenciales, login correcto con redirección a los 2 s, descuento Duoc |
| `src/pages/Registro.test.jsx` | 9 | Campos, registro válido, rechazo por edad / correo / contraseña / duplicado, campo de referido opcional |
| `src/pages/Admin.test.jsx` | 15 | Control de acceso, listado, alta con validaciones, edición, cancelación, eliminación con confirmación |
| `src/pages/Proximamente.test.jsx` | 3 | Título por props, mensaje de sección pendiente, botón de volver |
| `src/App.test.jsx` | 9 | Enrutado: cada ruta muestra la página correcta, rutas inexistentes y páginas "próximamente" |
| **Total** | **175** | |

Las pruebas cubren casos normales, **casos borde** (cadenas vacías, `null`, límites
como exactamente 18 años o precio 0) y **casos de error** (JSON corrupto en
`localStorage`, ids inexistentes, uso de hooks fuera de su provider).

## Cobertura

Resultado de `npm run test:coverage`:

| Métrica | Resultado | Detalle |
| --- | :---: | :---: |
| Sentencias | **100 %** | 1025 / 1025 |
| Líneas | **100 %** | 1025 / 1025 |
| Funciones | **100 %** | 57 / 57 |
| Ramas | **97,18 %** | 207 / 213 |

Archivos con ramas sin cubrir al 100 %: `Carrito.jsx` (91,66 %), `Admin.jsx`
(93,47 %) y `CartContext.jsx` (94,11 %). El resto de los archivos está al 100 % en
las cuatro métricas.

## Convenciones y cosas a tener en cuenta

- **Estado real en `localStorage`:** la app guarda todo ahí (`carrito`, `usuarios`,
  `usuarioLogueado`, etc.), por eso las pruebas lo siembran con `seedCart` /
  `seedAuth` y `setup.js` lo limpia después de cada prueba.
- **Llamadas directas a un contexto** (por ejemplo `useCart().agregar(...)`) deben ir
  envueltas en `act()`; si no, el estado no se actualiza antes de las aserciones.
- **Formularios:** se envían con `fireEvent.submit(form)` y no con un clic, porque
  jsdom aplica la validación HTML5 (`required`, `type=email`, `min`) y bloquearía
  el evento antes de llegar a la validación propia de la app.
- **`Admin.jsx` modifica el catálogo importado** (`src/data/productos.js`) con
  `splice`. `Admin.test.jsx` guarda una copia y la restaura en `afterEach`; cualquier
  prueba nueva que toque el admin debe hacer lo mismo.
- En `input[type=number]`, `toHaveValue` compara números (`null` si está vacío), no
  cadenas.
- Los textos de las pruebas están en español, igual que la interfaz.
- `src/main.jsx` se excluye de la cobertura porque solo arranca ReactDOM.
