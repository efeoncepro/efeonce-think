# efeonce-think

Hub público de lead magnets de Efeonce — **`think.efeoncepro.com`** (Astro + Vercel).

Primera superficie: el **render del informe del AI Visibility Grader**, que consume a
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

| Ruta | Qué es | Index |
|---|---|---|
| `/` | Landing del hub | sí |
| `/brand-visibility` | Landing de la herramienta (pendiente) | sí |
| `/brand-visibility/r/[token]` | Informe per-lead (SSR, token-gated) | **noindex** |

## Contrato que consume

`GET {GREENHOUSE_API_BASE}/api/public/growth/ai-visibility/report/{token}` →
`{ report, model, modelVersion, header }` (TASK-1280). Render "tonto" del `model`
(variant `publicWeb`) — no re-deriva scoring.

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

Astro (latest) · adapter Vercel · React islands · Tailwind 4 (CSS-first) · TypeScript strict.
Espeja las convenciones de `efeonce-web` para converger sin fricción.
