import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * Colección `aeoXray` — las muestras de trabajo "artículo + su capa de máquina".
 * TASK-1410 (greenhouse-eo).
 *
 * El motor de render NUNCA conoce a un cliente: la frontera es este payload.
 * Un cliente nuevo = un archivo JSON nuevo, cero código.
 *
 * El schema no es decoración. Es el gate de calidad del motor reutilizable:
 * obliga `alt` + autoría/licencia en cada imagen y `source` + `asOf` en cada
 * cifra. Un payload al que le falte cualquiera de esas cosas ROMPE EL BUILD,
 * en vez de publicar una muestra que promete rigor y no lo tiene.
 */

const credit = z.object({
  author: z.string().min(1),
  license: z.string().min(1),
  url: z.string().url(),
})

const imageBlock = z.object({
  type: z.enum(['image', 'hero-image']),
  coupleId: z.string().min(1),
  src: z.string().min(1),
  // Un alt vacío en una muestra que EXHIBE los alts sería una broma cruel.
  alt: z.string().min(10, 'El alt es contenido de la muestra: describe la imagen de verdad.'),
  caption: z.string().optional(),
  credit,
})

const block = z.discriminatedUnion('type', [
  imageBlock,
  z.object({ type: z.literal('h1'), coupleId: z.string(), text: z.string() }),
  z.object({ type: z.literal('h2'), coupleId: z.string(), text: z.string() }),
  z.object({ type: z.literal('answer-capsule'), coupleId: z.string(), text: z.string() }),
  z.object({ type: z.literal('paragraph'), text: z.string() }),
  z.object({
    type: z.literal('table'),
    coupleId: z.string(),
    caption: z.string(),
    headers: z.array(z.string()).min(2),
    rows: z.array(z.array(z.string())).min(1),
  }),
  z.object({
    type: z.literal('ordered-list'),
    coupleId: z.string(),
    title: z.string(),
    items: z.array(z.string()).min(2),
  }),
  z.object({
    type: z.literal('faq'),
    coupleId: z.string(),
    title: z.string(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
  }),
  z.object({
    type: z.literal('internal-links'),
    coupleId: z.string(),
    title: z.string(),
    items: z.array(z.object({ text: z.string(), href: z.string().url(), note: z.string().optional() })),
  }),
  z.object({
    type: z.literal('sources'),
    title: z.string(),
    items: z.array(z.object({ text: z.string(), href: z.string().url() })),
  }),
])

const aeoXray = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/aeo-xray' }),
  schema: z.object({
    client: z.object({
      name: z.string(),
      legalName: z.string(),
      site: z.string(),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }),
    meta: z.object({
      sampleTitle: z.string(),
      kicker: z.string(),
      preparedAt: z.string(),
      preparedBy: z.string(),
    }),
    thesis: z.string().min(40),

    article: z.object({
      proposedUrl: z.string().url(),
      category: z.string(),
      author: z.string(),
      publishedAt: z.string(),
      blocks: z.array(block).min(3),
    }),

    machine: z.object({
      seo: z.array(
        z.object({
          id: z.string(),
          coupleId: z.string(),
          label: z.string(),
          value: z.string(),
          detail: z.string().optional(),
          // El "para qué" es obligatorio: sin él la muestra exhibe técnica y no argumenta nada.
          why: z.string().min(30, 'Cada técnica declara para qué sirve, o no entra.'),
        }),
      ),
      og: z.array(z.object({ id: z.string(), coupleId: z.string(), label: z.string(), value: z.string() })),
      headings: z.object({
        coupleId: z.string(),
        why: z.string().min(30),
        tree: z.array(z.object({ level: z.number(), text: z.string(), coupleId: z.string() })),
      }),
      alts: z.array(
        z.object({ coupleId: z.string(), alt: z.string().min(10), why: z.string().min(30) }),
      ),
      jsonld: z.array(
        z.object({
          id: z.string(),
          coupleId: z.string(),
          type: z.string(),
          /** El número del diagnóstico que este nodo arregla. Es lo que convierte el schema en argumento. */
          metric: z.string(),
          why: z.string().min(30),
          code: z.record(z.string(), z.unknown()),
        }),
      ),
      craft: z.array(
        z.object({
          coupleId: z.string(),
          label: z.string(),
          detail: z.string(),
          why: z.string().min(30),
        }),
      ),
    }),

    evidence: z.object({
      intro: z.string(),
      facts: z.array(
        z.object({
          coupleId: z.string(),
          label: z.string(),
          value: z.string(),
          note: z.string(),
          // Sin fuente y sin fecha, una cifra es una opinión con números.
          source: z.string().min(3, 'Toda cifra lleva fuente.'),
          asOf: z.string().min(4, 'Toda cifra lleva as-of.'),
        }),
      ),
      fanOut: z.object({
        title: z.string(),
        note: z.string(),
        items: z.array(
          z.object({ q: z.string(), coveredBy: z.string(), covered: z.boolean() }),
        ),
      }),
      honesty: z.string().min(40),
    }),

    ui: z.object({
      disclaimerLabel: z.string(),
      disclaimerBody: z.string(),
      paneArticleTitle: z.string(),
      paneArticleSubtitle: z.string(),
      paneMachineTab: z.string(),
      paneEvidenceTab: z.string(),
      hintDesktop: z.string(),
      hintMobile: z.string(),
      whyLabel: z.string(),
      schemaNote: z.string(),
      sourceLabel: z.string(),
      thesisLabel: z.string(),
      licenseTitle: z.string(),
      backToArticle: z.string(),
    }),
  }),
})

export const collections = { aeoXray }
