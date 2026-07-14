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
      /** El FAQ es una SECCIÓN, no un apéndice: el árbol de encabezados lo declara como H2 y
          cubre dos preguntas del fan-out. Por eso `anchor` y `short` son OBLIGATORIOS — sin
          ellos renderizaba como párrafo suelto, sin ancla y fuera del índice, mientras la capa
          de máquina lo declaraba como encabezado. La capa de máquina solo puede declarar lo
          que la página realmente tiene. */
      type: z.literal('faq'),
      coupleId: z.string(),
      title: z.string(),
      anchor: z.string(),
      short: z.string(),
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
/** El número que el comité recuerda. Va grande: la prosa es su nota al pie, no al revés.
 *
 *  🔴 `source` + `asOf` son OBLIGATORIOS en cuanto existe un `stat` — lo fuerza el `superRefine`
 *  de la raíz, no este objeto (así ningún bloque nuevo puede escaparse por olvido).
 *
 *  El invariante 7 dice «cero cifras sin fuente y sin as-of», y el schema lo obligaba en
 *  `evidence.facts` y en los átomos… pero NO acá, que es donde viven los números GRANDES del
 *  instrumento. Resultado: la ③ —la pantalla del rigor— era la única donde las cifras flotaban.
 *  Una auditoría externa (2026-07-14) encontró que de las 6 cifras de la pieza, 3 no resistían
 *  verificación: el 2,3× era una razón de PREVALENCIA vendida como lift, el 72,4% iba sin citar,
 *  y la fuente del 16% no existía con el nombre publicado. Sin fuente y sin fecha, una cifra es
 *  una opinión con números — y en esta pieza eso es lo único que no se puede permitir. */
const stat = {
  stat: z.string().optional(),
  statNote: z.string().optional(),
  source: z.string().min(8).optional(),
  asOf: z.string().min(4).optional(),
}

/** Recorre CUALQUIER nodo del payload y exige la cita en cuanto vea una cifra. */
const requireSourceForStats = (data: unknown, ctx: z.RefinementCtx, path: (string | number)[] = []) => {
  if (Array.isArray(data)) {
    data.forEach((v, i) => requireSourceForStats(v, ctx, [...path, i]))

    return
  }
  if (!data || typeof data !== 'object') return

  const node = data as Record<string, unknown>

  if (typeof node.stat === 'string' && node.stat.length > 0) {
    for (const k of ['source', 'asOf'] as const) {
      if (typeof node[k] !== 'string' || (node[k] as string).length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...path, k],
          message: `«${node.stat}» es una cifra sin ${k}. Sin fuente y sin fecha, un número es una opinión con dígitos — y esta pieza vive de no exagerar.`,
        })
      }
    }
  }

  for (const [k, v] of Object.entries(node)) requireSourceForStats(v, ctx, [...path, k])
}


/**
 * 🔴 EL CONTRATO DEL ACOPLAMIENTO, EN EL BUILD — no solo en el gate de Playwright.
 *
 * Los asserts 40-41 cazan huérfanos y fantasmas… pero corren DESPUÉS del build, en un navegador.
 * O sea: el build de un payload con un bloque huérfano PASABA, y la promesa del doc —«un payload
 * incompleto ROMPE EL BUILD, no publica una muestra a medias»— era falsa para el invariante más
 * load-bearing de la pieza. La misma regla aplica a los átomos: si su línea de sangre apunta a un
 * bloque que ya no existe, la ④ cierra con una genealogía falsa.
 *
 * · HUÉRFANO — bloque acoplable sin contraparte: se ilumina contra la nada. Peor que no acoplarlo.
 * · FANTASMA — nodo que apunta a un bloque que ya no existe (pasa al renombrar un `coupleId`).
 */
const checkCoupling = (d: any, ctx: z.RefinementCtx) => {
  const artIds = new Set<string>(d.article.blocks.filter((b: any) => b.coupleId).map((b: any) => b.coupleId))
  const instIds = new Set<string>([
    ...['seo', 'og', 'craft', 'jsonld', 'alts'].flatMap((k: string) => d.machine[k].map((x: any) => x.coupleId)),
    d.machine.headings.coupleId,
    ...d.machine.headings.tree.map((x: any) => x.coupleId),
    ...d.evidence.facts.map((x: any) => x.coupleId),
    ...d.evidence.fanOut.items.map((x: any) => x.coveredBy),
  ])

  for (const id of artIds) {
    if (!instIds.has(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['article', 'blocks'],
        message: `«${id}» es un bloque HUÉRFANO: es acoplable (se ilumina, invita a pasar el cursor) y NADA en el instrumento lo referencia. Se iluminaría contra la nada — es peor que no acoplarlo.`,
      })
    }
  }
  for (const id of instIds) {
    if (!artIds.has(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['machine'],
        message: `«${id}» es un nodo FANTASMA: el instrumento lo referencia y el artículo NO tiene ese bloque. Pasa al renombrar un coupleId.`,
      })
    }
  }

  d.atoms.forEach((atom: any, i: number) => {
    if (!artIds.has(atom.coupleId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['atoms', i, 'coupleId'],
        message: `«${atom.coupleId}» rompe la línea de sangre del átomo «${atom.id}»: la atomización apunta a un bloque del artículo que ya no existe.`,
      })
    }
  })

  /* Un KPI de portada sin su cifra grande sale VACÍO en la ① y en el instrumento. */
  d.evidence.facts.forEach((f: any, i: number) => {
    if (f.headline && (!f.big || !f.bigUnit)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['evidence', 'facts', i, 'big'],
        message: `«${f.label}» está marcado como headline (va de KPI grande) pero le falta \`big\` o \`bigUnit\`: saldría una tarjeta vacía.`,
      })
    }
  })

  /* Anclas duplicadas = IDs duplicados en el HTML y un índice que salta al lugar equivocado. */
  const anchors = d.article.blocks.filter((b: any) => b.anchor).map((b: any) => b.anchor)
  const dupes = anchors.filter((a: string, i: number) => anchors.indexOf(a) !== i)
  if (dupes.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['article', 'blocks'],
      message: `Anclas duplicadas (${[...new Set(dupes)].join(', ')}): serían IDs repetidos en el HTML y el índice saltaría al lugar equivocado.`,
    })
  }
}


/**
 * 🔴 EL ACENTO DEL CLIENTE ENTRA COMO COLOR DE TEXTO — y el schema solo validaba la FORMA.
 *
 * `regex(/^#[0-9a-fA-F]{6}$/)` comprueba que sea un hex, no que se pueda LEER. El magenta de SKY
 * (#E6007E) da ~4,5:1 sobre blanco: pasa AA por los pelos, y por suerte. Un payload con un accent
 * claro —amarillo, lima, celeste; comunísimos en salud y retail— se pintaría igual en la categoría,
 * los enlaces internos y los números del índice: texto ilegible EN LA PANTALLA DEL CLIENTE, en la
 * pieza cuya tesis entera es el rigor técnico. El schema tiene que exigir 4,5:1 (WCAG 1.4.3).
 */
const contrastOnWhite = (hex: string) => {
  const v = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255

    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const L = 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]

  return 1.05 / (L + 0.05)
}

const aeoXray = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/aeo-xray' }),
  schema: ({ image }) =>
    z.object({
    client: z.object({
      name: z.string(),
      legalName: z.string(),
      site: z.string(),
      accent: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .refine(hex => contrastOnWhite(hex) >= 4.5, hex => ({
          message: `El acento ${hex} da ${contrastOnWhite(hex).toFixed(2)}:1 sobre blanco y WCAG 1.4.3 pide 4,5:1. Entra como color de TEXTO en el artículo (categoría, enlaces, números del índice): quedaría ilegible en la pantalla del cliente, en la pieza cuya tesis es el rigor. Usa un tono más oscuro de la marca para el texto.`,
        })),
      /* 🔴 LA TIPOGRAFÍA DEL CLIENTE ES DATO, NO CÓDIGO.
         Vivía en el CSS (`--client-font: 'Assistant Variable'`), y el propio comentario lo confesaba:
         «cuando la muestra sea de otro, cambia acá». Eso es un `if (cliente === 'sky')` escrito en
         CSS. El cliente #2 dibujaría SU artículo —la zona que la arquitectura declara «es el
         ESPÉCIMEN, es del CLIENTE»— en la tipografía de SKY, y el gate lo bendecía (el assert 38
         exigía literalmente «Assistant»).

         ⚠️ El @font-face sigue siendo un paso de repo (instalar el paquete fontsource e importarlo):
         no se puede importar un paquete npm dinámicamente. Pero eso ahora es un paso DECLARADO del
         manual, no una cadena escondida en una hoja de estilos. */
      font: z.object({
        family: z.string().min(3),
        titleWeight: z.number().int().min(100).max(900),
        bodyWeight: z.number().int().min(100).max(900),
      }),
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
    /* 🔴 CUATRO PANTALLAS, NO N. `getStaticPaths` genera las rutas desde el payload, pero el body
       las decide con un switch de literales — así que un step renombrado («/post» en vez de
       «/articulo») generaba la ruta, PASABA EL BUILD y servía una página EN BLANCO: chrome, riel,
       footer y cero contenido. Sin ruido. Es el bug de huérfanos/fantasmas aplicado al flow.
       El enum es la verdad: el motor renderiza estas cuatro y solo estas cuatro. El día que haya
       una quinta pantalla, se agrega acá Y en el render — juntas, o no se agrega. */
    flow: z
      .array(z.object({ step: z.enum(['', 'articulo', 'radiografia', 'atomizacion']), label: z.string(), next: z.string() }))
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
          /* La cifra del átomo y SU FUENTE. `source` + `asOf` son obligatorios por la misma
             razón que en `evidence.facts`: sin fuente y sin fecha, una cifra es una opinión
             con números. La ④ afirmaba tres cifras con CERO citas mientras la ① y la ③ citaban
             todo — en la pantalla que cierra el argumento, y en la pieza cuya tesis es el rigor.
             Obligatorio en el schema para que no vuelva a pasar en el próximo payload. */
          stat: z.string(),
          statNote: z.string(),
          source: z.string().min(8),
          asOf: z.string().min(4),
          why: z.string().min(40),
          /** Lo que la muestra NO puede fingir. Decirlo suma; simularlo destruye la pieza. */
          honesty: z.string().min(20),
          deliverable: z.array(z.object({ k: z.string(), v: z.string() })).min(2),
          video: z
            .object({
              src: z.string().min(1),
              poster: z.string().min(1),
              alt: z.string().min(10),
              label: z.string().optional(),
              disclosure: z.string().optional(),
            })
            .optional(),
          /* ¿Este átomo EXHIBE las imágenes del artículo? El átomo de imágenes argumentaba sobre
             los `alt` y no mostraba ni una foto: dos átomos demostraban y uno solo afirmaba. Es DATO
             del payload — el motor no puede saber cuál es «el de imágenes» sin conocer al cliente. */
          showsImages: z.boolean().optional(),
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
      /* 🔴 LA PIEZA PROMETÍA VERIFICABILIDAD Y NUNCA ENTREGABA LA HERRAMIENTA.
         La arquitectura dice, textual, que esto es «una prueba que el comité puede verificar por su
         cuenta» — y en ninguna de las cuatro pantallas se le decía CÓMO. Convertir un claim en una
         comprobación que el evaluador hace con SUS PROPIAS MANOS es el movimiento de mayor
         apalancamiento que la pieza tiene, y no cuesta nada: es el argumento que después él repite
         en la reunión interna. Le pedíamos fe donde podíamos darle prueba. */
      verifyTitle: z.string(),
      verifySteps: z.array(z.object({ what: z.string(), how: z.string() })).min(2),
      verifyNote: z.string(),
    }),
  })
    /* 🔴 EL GATE DE LAS CIFRAS. Recorre el payload ENTERO —craft, jsonld, seo, og, átomos,
       evidencia y cualquier bloque que se invente mañana— y rompe el build en cuanto encuentre
       un `stat` sin `source` + `asOf`. Es la única forma de que el invariante 7 sea estructural
       y no un acuerdo de caballeros: los tres números que no resistían verificación vivían
       justo en la familia que el schema no miraba. */
    .superRefine((data, ctx) => {
      requireSourceForStats(data, ctx)
      checkCoupling(data, ctx)
    }),
})

export const collections = { aeoXray }
