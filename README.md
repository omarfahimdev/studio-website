# KineticForge (Next.js)

## Build by Fazle Elahi Fahim

Kinetic typography motion studio — Next.js 15 (App Router) + TypeScript + Tailwind 3.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

Layout: `lib/config.ts` (settings, presets, option lists) · `lib/engine.ts` (pure canvas renderer) ·
`hooks/usePlayer.ts` (rAF loop, playback, PNG/WebM export) · `components/Studio.tsx` (UI).
