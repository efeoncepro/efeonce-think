// @ts-check
import { defineConfig, envField } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
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
  trailingSlash: 'never',

  env: {
    schema: {
      // Base del backend headless de Greenhouse que sirve el modelo del informe por token.
      // Prod: https://greenhouse.efeoncepro.com. Se resuelve server-side (fetch SSR).
      GREENHOUSE_API_BASE: envField.string({
        context: 'server',
        access: 'secret',
        default: 'https://greenhouse.efeoncepro.com',
      }),
      // TASK-1340 (greenhouse-eo) — motor Growth CTA: binding de la surface Think +
      // credencial per-surface (autentica el HOST; se setea en Vercel env, nunca en git).
      // Sin embed key configurada, GrowthCtaDock no emite nada (fail-closed).
      GREENHOUSE_CTA_SURFACE_ID: envField.string({
        context: 'server',
        access: 'secret',
        default: 'csur-4170287c-0a81-4baa-8de3-b6050f8173ee',
      }),
      GREENHOUSE_CTA_EMBED_KEY: envField.string({
        context: 'server',
        access: 'secret',
        default: '',
      }),
    },
  },

  integrations: [
    react(),
    sitemap({
      // `/muestras/*` = Radiografía AEO (TASK-1410): muestras de trabajo con la marca de un
      // cliente. Son `noindex` por diseño y NO deben entrar al sitemap: son piezas comerciales
      // que se entregan por enlace, no contenido del hub. Una versión genérica sin marca de
      // cliente sí podría indexarse, pero sería otra ruta.
      filter: (page) => {
        const { pathname } = new URL(page)

        return !pathname.startsWith('/preview/') && !pathname.startsWith('/muestras/')
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
})
