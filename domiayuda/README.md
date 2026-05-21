# DomiAyuda 🛵

App de finanzas personales para domiciliarios. Hecha con React + Vite. Funciona como PWA (se instala en el celular).

## Cómo correrla localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en modo desarrollo
npm run dev
```

Luego abre `http://localhost:5173` en tu celular (conectado a la misma wifi) o en el navegador.

## Cómo subirla a GitHub Pages (gratis)

```bash
# 1. Instalar gh-pages
npm install --save-dev gh-pages

# 2. Agregar al package.json en "scripts":
#    "deploy": "gh-pages -d dist"
# Y agregar: "homepage": "https://TU_USUARIO.github.io/domiayuda"

# 3. Construir y desplegar
npm run build
npm run deploy
```

## Cómo instalarla en el celular

1. Abre la app en Chrome (Android) o Safari (iPhone)
2. En Chrome: menú ⋮ → "Instalar aplicación"
3. En Safari: compartir → "Agregar a pantalla de inicio"

## Estructura del proyecto

```
src/
  context/   → Estado global con localStorage (datos persisten)
  pages/     → Inicio, Domis, Finanzas, Metas, Moto
  index.css  → Estilos globales
```

## Personalización

- Cambia la meta mensual en `src/context/AppContext.jsx` → `metaMensual`
- Cambia el precio por domi → `precioDomi`
- Cambia el capital inicial → `capitalInicial`
- Agrega o quita gastos fijos desde la app directamente
