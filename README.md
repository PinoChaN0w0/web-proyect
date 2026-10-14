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
