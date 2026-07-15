# shulgin.is-a.dev — personal portfolio

Source for my portfolio: React 19 + TypeScript + Vite SPA, bilingual (RU/EN), brutalist design. Deployed on GitHub Pages via Actions.

## Stack

React 19, TypeScript, Vite, CSS Modules (no UI framework), [Motion](https://motion.dev) for animation, Lenis for smooth scroll.

## Notable bits

- Two custom rendering engines built without libraries: a living ghost mascot on Canvas 2D (`src/lib/ghostEngine.ts`) and an ASCII/CRT WebGL scene (Phosphor, in progress)
- Bilingual content with a single source of truth — UI strings in `src/i18n/dict.ts`, page content in `src/data/*`, both `{ru, en}`
- Machine-readable mirror at [`/llms.txt`](public/llms.txt) and [`/llms-full.txt`](public/llms-full.txt) for AI agents/crawlers, alongside the human-facing SPA

## Run locally

```bash
npm install
npm run dev      # localhost:5173
npm run build    # tsc -b && vite build
npm run preview
```

## Deploy

GitHub Actions builds and publishes to Pages on push to `main` (`.github/workflows/deploy.yml`).

## Contact

sanexxx777@gmail.com · [Telegram](https://t.me/Aleksandr_NFA) · [LinkedIn](https://www.linkedin.com/in/aleksandr-shulgin)
