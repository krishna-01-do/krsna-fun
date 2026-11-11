# KRSNA.FUN

The internet's playground: build an impossible planet, enter it and explore it as a real-time 3D game.

## 3D game controls

- `WASD` — move
- `Shift` — run
- `Space` — jump
- `E` — interact
- Mouse drag — rotate camera
- Mouse wheel — zoom
- Double-click the world — lock camera
- `Escape` — release camera

Touch devices receive an on-screen joystick and action buttons.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deploying to Vercel

Import this repository into Vercel. The included `vercel.json` configures the Vite build and SPA fallback.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none required

## 3D asset licenses

Bundled model provenance and licensing are documented in [`public/models/ATTRIBUTIONS.md`](public/models/ATTRIBUTIONS.md).
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
