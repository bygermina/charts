# Charts — Real-Time Data Visualization

Interactive gallery of performance-critical chart implementations built with React 19, TypeScript, and D3.js.

**Live demo:** https://bzgermina.github.io/charts

## Charts

- **D3 Multi-Line Chart** — discrete 1s data updates rendered as continuous motion via `transform: translate` and frame-synchronized animations.
- **Canvas 1000 pts/sec** — high-frequency real-time stream backed by a fixed-size ring buffer (`Float32Array` / `Float64Array`).
- **D3 Bar Chart** — interactive bars with hover-driven value inspection, gradient fills, clip paths.
- **SVG Gauge & IoT Sensors** — input-driven SVG visuals with controlled UI state.
- **D3 Network Graph** — force simulation with node drag, background pan, scroll zoom.
- **SVG Flow Diagram** — animated data flow between nodes via custom SVG and CSS keyframes.

## Stack

- React 19 + TypeScript (strict)
- Vite 7
- D3 7
- Sass (modular design tokens, CSS variables)
- ESLint 9 (flat config) + Prettier
- Feature-Sliced Design architecture

## Scripts

```bash
npm run dev       # start dev server on :8080
npm run build     # type-check + production build
npm run preview   # preview production build
npm run lint      # eslint
npm run format    # prettier --write .
npm run deploy    # publish dist/ to gh-pages
```
