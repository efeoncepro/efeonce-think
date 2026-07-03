# efeonce-think

Hub público de lead magnets de Efeonce — **`think.efeoncepro.com`** (Astro + Vercel).

Primera superficie **viva**: el **render del informe del AI Visibility Grader**, que consume a
Greenhouse **headless** (fetch server-side por token, sin CORS, sin exponer el token al
browser). El scoring y el modelo del informe viven en Greenhouse (backend); este hub sólo
renderiza el modelo que el backend entrega.

## Contexto / decisiones

- **Repo dedicado** al hub de lead magnets (NO `efeonce-web`). Decisión operador 2026-07-03.
  **Converge en `efeonce-web` más adelante** → mismo stack (Astro), marca compartida, URL final.
- Task madre en `greenhouse-eo`: **TASK-1325** (levantar el hub) → desbloquea **TASK-1324**
  (repuntar el enlace de los correos, hoy 404).
- ADR: `GREENHOUSE_PUBLIC_REPORT_HEADLESS_RENDER_DECISION_V1.md` (render headless).

## Rutas

| Ruta | Qué es | Estado | Index |
|---|---|---|---|
| `/` | Landing del hub | pendiente | sí |
| `/brand-visibility` | Landing de la herramienta + embed del form (TASK-1327) | pendiente | sí |
| `/brand-visibility/r/[token]` | Informe per-lead (SSR, token-gated) | **live, enterprise** | **noindex** |

## Contrato que consume

`GET {GREENHOUSE_API_BASE}/api/public/growth/ai-visibility/report/{token}` →
`{ report, model, modelVersion, header }` (TASK-1280). Render "tonto" del `model`
(variant `publicWeb`) — no re-deriva scoring. `404` = token inexistente/expirado (honesto),
`429` = rate-limit. No-leak por construcción de tipo (`engineSnapshot` sí — es headline público).

## Estructura del informe

`src/pages/brand-visibility/r/[token].astro` — narrativa de arriba a abajo: hero (gauge navy +
veredicto) → evidencia por motor → benchmark competitivo → **la escalera de madurez** → brecha +
qué hacer → detalle por dimensión + radar → CTA. Motion GSAP que "se arma" al hacer scroll
(count-up, gauge draw, barras, reveals), robusto: `prefers-reduced-motion` + fail-safe (nunca
deja contenido en blanco si el JS falla).

### Primitivas canónicas — `src/components/primitives/`

Componentes reutilizables, gobernados, con contrato tipado (`src/lib/primitives/*.ts`).
Un primitive = **una fuente de verdad, muchos consumers**. Ver `src/components/primitives/README.md`.

- **`MaturityLadder`** (la "escalera") — N peldaños de madurez; presentación pura + self-contained
  (estilos + motion propios), desacoplada del modelo del grader vía adapter. Contrato:
  `@lib/primitives/ladder` (`LadderRung`).

## Marca

Los tokens AXIS se **copian** al hub en `src/lib/report-tokens.ts` (`axis` + `severityMeta`) —
duplicación temporal documentada (decisión práctica del ADR). Al converger en `efeonce-web` se
formaliza un paquete compartido. **No** hardcodear HEX en componentes: siempre desde `axis.*`.

## Verificación visual (GVC)

`scripts/capture.mjs <url> <label> [selector]` — Playwright captura desktop + mobile a
`.captures/` (gitignored). Con selector clipea por elemento (scrollIntoView); sin selector, full
page con scroll-through para disparar los reveals. Toda mejora visual se **mira** en el frame real
antes de dar por bueno (no confiar en aserciones que no "ven").

## Desarrollo

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build
pnpm type-check
```

### Variables de entorno

| Var | Contexto | Default | Descripción |
|---|---|---|---|
| `GREENHOUSE_API_BASE` | server | `https://greenhouse.efeoncepro.com` | Base del backend headless de Greenhouse. |

## Stack

Astro 7 · adapter Vercel 11 · React islands · Tailwind 4 (CSS-first) · GSAP · ECharts (radar,
tree-shaken) · Geist + Poppins · TypeScript strict. Espeja las convenciones de `efeonce-web`
para converger sin fricción.

## Deploy

Auto-deploy en cada push a `main` (Vercel, team `efeonce-7670142f` — **NUNCA** scope personal).
Proyecto `efeonce-think` (`prj_F4gvS8jmWjvdJ8cTwM6k60R1XydV`). Gobernable desde Greenhouse vía
`greenhouse.repo.json` (cableado del control plane multi-repo = TASK-1326).
