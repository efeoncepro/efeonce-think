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

/**
 * `src: image()` es lo que mete la foto al pipeline de Astro: de ahí salen `width`/`height`
 * (sin ellos hay CLS garantizado), el `srcset` (sin él un teléfono se traga los 527 KB del
 * hero) y AVIF/WebP (2-3× más liviano). Vivían en `public/`, que SALTA todo eso — y una
 * pieza que argumenta rigor técnico no puede reprobar su propio PageSpeed.
 * El helper solo existe dentro de `schema: ({ image }) => …`.
 */
type ImageFn = Parameters<Parameters<typeof defineCollection>[0]['schema'] & object>[0]['image']

const blockUnion = (image: ImageFn) =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.enum(['image', 'hero-image']),
      coupleId: z.string().min(1),
      src: image(),
      // Un alt vacío en una muestra que EXHIBE los alts sería una broma cruel.
      alt: z.string().min(10, 'El alt es contenido de la muestra: describe la imagen de verdad.'),
      caption: z.string().optional(),
      credit,
    }),
    z.object({ type: z.literal('h1'), coupleId: z.string(), text: z.string() }),
    z.object({
      type: z.literal('h2'),
      coupleId: z.string(),
      text: z.string(),
      /* El ancla del índice. Va en el H2 y NO en el ToC: el índice se DERIVA de los H2,
         no se declara aparte. Un índice declarado a mano se desincroniza el día que
         alguien renombra un título — y nadie se entera, porque no falla nada. */
      anchor: z.string().regex(/^[a-z0-9-]+$/, 'El ancla es un slug: minúsculas, números y guiones.'),
      /* La etiqueta corta del índice. El H2 es una PREGUNTA (así lo recupera el motor);
         el índice es un MAPA (así lo escanea el humano). No son el mismo texto. */
      short: z.string().min(3),
    }),
    z.object({ type: z.literal('answer-capsule'), coupleId: z.string(), text: z.string() }),
    /* El ToC no lleva items: se construye leyendo los H2 del propio artículo. */
    z.object({ type: z.literal('toc'), coupleId: z.string(), title: z.string().min(3) }),
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
      /** La cita destacada. Es DATO: el pasaje que un motor puede extraer entero y atribuir. */
      type: z.literal('pull-quote'),
      coupleId: z.string(),
      text: z.string().min(40),
    }),
    z.object({
      type: z.literal('sources'),
      coupleId: z.string(),
      title: z.string(),
      items: z.array(z.object({ text: z.string(), href: z.string().url() })),
    }),
    ])


/**
 * El rango del nodo. Sin esto, `og:title` se ve igual que `FAQPage` y la jerarquía no existe.
 *  1 — mueve un número del diagnóstico (el argumento). Stat grande, expandido.
 *  2 — estructura (encabezados, alts, cluster). Prosa visible.
 *  3 — descriptivo (canónica, og:*). Prueba de completitud, NO argumento. Callado y colapsado.
 */
const tier = z.union([z.literal(1), z.literal(2), z.literal(3)])
/** El número que el comité recuerda. Va grande: la prosa es su nota al pie, no al revés. */
const stat = { stat: z.string().optional(), statNote: z.string().optional() }

const aeoXray = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/aeo-xray' }),
  schema: ({ image }) =>
    z.object({
    client: z.object({
      name: z.string(),
      legalName: z.string(),
      site: z.string(),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }),
    /**
     * Token de la URL: `/muestras/<slug>-<token>`.
     *
     * La muestra lleva la marca de un cliente y se entrega por enlace. Sin token, la URL
     * es ADIVINABLE: quien recibe `/muestras/sky-…` puede probar `/muestras/jetsmart-…`.
     * Hoy no encontraría nada; el día que le hagamos una muestra a un competidor directo
     * de un cliente vigente, sí — y esa es una conversación que no queremos tener.
     *
     * 🔴 Se DECLARA acá, nunca se genera en el build: un token aleatorio por build
     * cambiaría la URL en cada deploy, y esta URL va a una lámina y a una propuesta.
     * Generar uno nuevo: `openssl rand -hex 6`.
     *
     * ⚠️ Es oscuridad, no seguridad: no hay auth. Quien tenga el enlace, entra.
     * Para una muestra de trabajo eso es exactamente lo que queremos.
     */
    token: z
      .string()
      .regex(/^[a-f0-9]{12}$/, 'Token de 12 hex. Genéralo con `openssl rand -hex 6`; nunca a mano.'),

    meta: z.object({
      /** El nombre del INSTRUMENTO («Radiografía AEO»). Es el h1 de la página. */
      instrument: z.string(),
      sampleFor: z.string(),
      /** El título del ARTÍCULO. Vive SOLO dentro de su panel: si además fuera el h1 de la
       *  página, la muestra dejaría de llamarse por lo que es y se haría pasar por el artículo. */
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
      blocks: z.array(blockUnion(image)).min(3),
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
          tier,
          ...stat,
        }),
      ),
      og: z.array(
        z.object({ id: z.string(), coupleId: z.string(), label: z.string(), value: z.string(), tier }),
      ),
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
          tier,
          ...stat,
        }),
      ),
      craft: z.array(
        z.object({
          coupleId: z.string(),
          label: z.string(),
          detail: z.string(),
          why: z.string().min(30),
          tier,
          ...stat,
        }),
      ),
    }),

    /** El FLOW: cuatro pantallas, cada una con UN trabajo. Es dato: el motor no hardcodea rutas. */
    flow: z
      .array(z.object({ step: z.string(), label: z.string(), next: z.string() }))
      .min(2),

    /** ① El hueco. El SERP real. Hoy vivía comprimido en una cajita; es la portada y es el golpe. */
    gap: z.object({
      kicker: z.string(),
      headline: z.string(),
      serpTitle: z.string(),
      serpNote: z.string(),
      serp: z.array(z.object({ pos: z.number(), domain: z.string(), kind: z.string() })).min(5),
      punch: z.string(),
      punchNote: z.string(),
      aside: z.string(),
    }),

    /** ④ Los átomos. Cada uno es una SUPERFICIE MÁS donde el motor puede encontrar al cliente. */
    atomsIntro: z.string().min(40),
    atoms: z
      .array(
        z.object({
          id: z.string(),
          /** La línea de sangre: de qué bloque del artículo nació. Se acopla de vuelta. */
          coupleId: z.string(),
          kind: z.string(),
          bornFrom: z.string(),
          stat: z.string(),
          statNote: z.string(),
          why: z.string().min(40),
          /** Lo que la muestra NO puede fingir. Decirlo suma; simularlo destruye la pieza. */
          honesty: z.string().min(20),
          deliverable: z.array(z.object({ k: z.string(), v: z.string() })).min(2),
          code: z.record(z.string(), z.unknown()).optional(),
          post: z.object({ hook: z.string(), body: z.string(), cta: z.string() }).optional(),
        }),
      )
      .min(2),

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
          /** Los de titular abren el instrumento: la evidencia es el argumento, no el apéndice. */
          headline: z.boolean(),
          big: z.string().optional(),
          bigUnit: z.string().optional(),
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
      /* La nota de licencia es COPY, no una constante del componente: cambia con el cliente
         y con el proveedor de imágenes. Vivía hardcodeada en Article.astro. */
      licenseNote: z.string().min(20),
      backToArticle: z.string(),
      bylineBy: z.string(),
      readTime: z.string(),
      instrumentTitle: z.string(),
      specimenChip: z.string(),
      producesLabel: z.string(),
      producesLabelOne: z.string(),
      flowNext: z.string(),
      flowOf: z.string(),
      srProduces: z.string(),
      closing: z.string(),
    }),
  }),
})

export const collections = { aeoXray }
