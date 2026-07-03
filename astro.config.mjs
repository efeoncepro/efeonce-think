// @ts-check
import { defineConfig, envField } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel'

/**
 * Astro configuration for efeonce-think — el hub público de lead magnets.
 *
 * - `output: 'static'` — casi todo se prerenderiza; las páginas token-gated
 *   (p.ej. `/brand-visibility/r/[token]`) declaran `export const prerender = false`
 *   y se sirven on-demand (SSR) en Vercel. El token viaja server-side: NUNCA se
 *   expone al browser (ADR GREENHOUSE_PUBLIC_REPORT_HEADLESS_RENDER_DECISION_V1).
 * - Adapter Vercel (mismo que efeonce-web, para converger sin fricción).
 * - Tailwind 4 vía el plugin oficial de Vite (config CSS-first en src/styles/global.css).
 * - React islands para interacción (client:visible por defecto).
 *
 * Convención de dominios: producción = think.efeoncepro.com.
 */
export default defineConfig({
  site: 'https://think.efeoncepro.com',

  env: {
    schema: {
      // Base del backend headless de Greenhouse que sirve el modelo del informe por token.
      // Prod: https://greenhouse.efeoncepro.com. Se resuelve server-side (fetch SSR).
      GREENHOUSE_API_BASE: envField.string({
        context: 'server',
        access: 'secret',
        default: 'https://greenhouse.efeoncepro.com',
      }),
    },
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
})
