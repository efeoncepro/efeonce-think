# Primitivas canónicas del hub

Componentes de UI reutilizables, gobernados, con contrato tipado. Un primitive = **una fuente
de verdad, muchos consumers**. Los lead magnets del hub (AEO hoy; SEO/otros mañana) reusan estos
componentes en vez de reimplementarlos.

Reglas:

- **Presentación pura + self-contained.** El primitive trae sus estilos y su motion. El consumer
  solo le pasa data ya adaptada a su contrato — no lo cablea por fuera.
- **Desacoplado del modelo de dominio.** El contrato del primitive (`src/lib/primitives/*.ts`) no
  conoce el modelo del grader. El consumer escribe un *adapter* (modelo → contrato).
- **Tokens, no crudo.** Colores desde `report-tokens` (`axis.*` / `severityMeta`), nunca HEX inline.
- **Robusto.** El motion respeta `prefers-reduced-motion` y tiene fail-safe (nunca deja contenido
  en blanco si el JS falla).
- **Primer paint deterministico.** Las dimensiones estructurales deben salir del HTML/CSS inicial
  sin depender de JS ni de `calc()` con operaciones no soportadas por todos los navegadores.

## Catálogo

| Primitive | Contrato | Qué es | Consumers |
|---|---|---|---|
| **`EngineAvatarGroup`** | `@lib/primitives/engine-avatar-group` (`EngineAvatarGroupProps`) | Grupo compacto de logos de motores con solape, pull-up hover/focus, tooltip accesible y overflow `+N`. Inspirado en el patrón `TeamAvatarGroup` de Greenhouse, adaptado al hub Think. | Informe AEO (`brand-visibility/r/[token]`, resumen ejecutivo y tablas de evidencia) |
| **`MaturityLadder`** | `@lib/primitives/ladder` (`LadderRung`) | La "escalera" — N peldaños de madurez que se suben en orden. Estatura del escalafón = posición/valor Be X con altura precomputada en SSR; nivel interno del líquido = score 0-100; color = severidad; `null` = "En cobertura" (hatch); `isNext` = "Empieza aquí". Anima su entrada (peldaños suben + count-up) self-contained. | Informe AEO (`brand-visibility/r/[token]`, sección "La escalera de visibilidad en IA") |
| **`ReportIcon`** | props locales (`name`, `size`, `strokeWidth`, `label`) | Set sobrio de glyphs stroke-only para informes: hereda `currentColor`, es decorativo por defecto y sólo debe acompañar texto visible. | Informe AEO (`brand-visibility/r/[token]`, métricas ejecutivas, fuente citada, operabilidad y prioridad) |
| **`StatusScreen`** | `@lib/primitives/status-screen` (`StatusKind`) | Pantalla de estado full-screen (hero ambiental): personaje Nexa por estado + capa navy con órbitas y bokeh de profundidad + título display + CTA. Self-contained (estilos + motion bajo `prefers-reduced-motion`, primer paint determinista). Copy canónico es-CL por estado (`not_found`/`gone`/`rate_limited`/`error`) con override puntual. | `/brand-visibility/r/[token]`, `/s/[code]`, `404.astro` |

### Uso — EngineAvatarGroup

```astro
---
import EngineAvatarGroup from '@/components/primitives/EngineAvatarGroup.astro'
import type { EngineAvatarGroupProps } from '@lib/primitives/engine-avatar-group'

const sampledEngines: EngineAvatarGroupProps['providers'] = [
  'gemini',
  'chatgpt',
  'perplexity',
  'google_ai_overview',
]
---
<EngineAvatarGroup providers={sampledEngines} size="sm" />
```

Props: `providers` (obligatorio), `max` (default `6`), `size` (default `"md"`).

### Uso — ReportIcon

```astro
---
import ReportIcon from '@/components/primitives/ReportIcon.astro'
---
<span class="inline-section-label">
  <ReportIcon name="citation" size={15} />
  Citabilidad propia
</span>
```

Props: `name` (obligatorio), `size` (default `18`), `strokeWidth` (default `1.8`), `label`
(opcional). Usar `label` sólo si el ícono comunica significado propio; en informes normalmente
acompaña texto visible y queda `aria-hidden`.

### Uso — MaturityLadder

```astro
---
import MaturityLadder from '@/components/primitives/MaturityLadder.astro'
import type { LadderRung } from '@lib/primitives/ladder'

// Adapter: tu modelo → LadderRung[] (ordenados 01→N, isNext resuelto por vos).
const rungs: LadderRung[] = /* … */
---
<MaturityLadder rungs={rungs} />
```

Props: `rungs` (obligatorio), `animate` (default `true`), `nextLabel` (default `"Empieza aquí"`),
`coverageLabel` (default `"En cobertura"`).

Nota de robustez: la altura de cada peldaño se precomputa en SSR como `--rung-min-height`.
No uses multiplicaciones dentro de `calc()` para la estructura de la escalera ni limpies custom
properties con `clearProps: all`; el motion sólo puede limpiar `opacity`/`transform`.

### Uso — StatusScreen

```astro
---
import StatusScreen from '@/components/primitives/StatusScreen.astro'
---
{/* Estado token-gated: el kind sale del status del resolver (not_found / gone / rate_limited / error). */}
<StatusScreen kind="gone" />

{/* 404 global u otra ruta: mismo primitive con copy override. */}
<StatusScreen
  kind="not_found"
  eyebrow="Error 404"
  title="Esta página no existe"
  body="La página que buscas no está aquí o se movió."
  ctaLabel="Volver al inicio"
  ctaHref="/"
/>
```

Props: `kind` (obligatorio: `not_found` | `gone` | `rate_limited` | `error`), y overrides opcionales
`eyebrow` / `title` / `body` / `ctaLabel` / `ctaHref`. El copy canónico por estado vive en el contrato
(`STATUS_CONTENT`); los assets del personaje viven en `public/characters/nexa-<pose>.webp`.

## Componentes del informe de Insights — `src/components/insights/`

No son primitivas en sentido estricto: conocen el contrato `InsightWebModelV1` de Greenhouse (tipos copiados en
`@lib/insights`) en vez de un contrato propio vía adapter. Se documentan acá porque son el catálogo de UI del informe
compartido (`/insights/r/[token]`, TASK-1875 en greenhouse-eo) y porque el próximo informe de datos del hub debería
partir de ellos. Mismas reglas que arriba: presentación pura, tokens (desde `@lib/insights-tokens`, no
`report-tokens`), primer paint completo sin JS y motion con fail-safe.

| Componente | Qué es |
|---|---|
| **`ChartFigure`** | Un `ChartSpecV1` explorable, dibujado en el servidor sin librería de gráficos. |
| **`ModuleScene`** | La escena de un capítulo (módulo) del informe: gráfico principal narrado + resto compacto. |
| **`FactMark`** | Marca de procedencia de una cifra: «Medido» o «Estimado». |

Nota sobre nombres: el plan original hablaba de `EditionMasthead` y `FactCallout`. No existen como componentes. La
portada (masthead) es markup propio de la página (`<header class="ins-hero">` en `[token].astro`), y el callout de
procedencia quedó como `FactMark` (dentro de la fila de procedencia de cada escena).

### ChartFigure

Dibuja las **15 familias** de Insights. Series: `bar`, `bar_grouped`, `bar_stacked`, `line`, `pie`, `donut`,
`scatter`. Datos propios (`spec.data.kind`): `bullet`, `gauge`, `waterfall`, `funnel`, `heatmap`, `waffle`, `venn_two`,
`upset`.

Props:

| Prop | Tipo | Nota |
|---|---|---|
| `spec` | `ChartSpecV1` | Obligatorio. Familia, series, dimensiones, escala y `data` propia. |
| `table` | `{ columns, rows }` | Obligatorio. La misma lectura en tabla (celda `null` → copy de ausencia). |
| `facts` | `Record<string, InsightWebFactV1>` | Obligatorio. Toda cifra impresa sale de `fact.display`; nunca se formatea localmente. |
| `locale` | `string` | Obligatorio. Sólo para las marcas del eje (`Intl.NumberFormat`). |
| `uid` | `string` | Obligatorio. `id` de la figura (lo usa el interruptor y el enlace directo). |
| `theme` | `'dark' \| 'light'` | Default `light`. Cambia los roles de dato actual/anterior. |
| `compact` | `boolean` | Default `false`. Versión reducida para los *beats* de una escena. |
| `derived` | `{ funnelStepRates? }` | Modelo 1.1: tasas de paso del embudo calculadas por Greenhouse; se muestran bajo cada etapa. |
| `copy` | `InsightsCopy` | Diccionario del chrome (es-CL o en-US). Default es-CL. |

Comportamiento:

- **Gráfico ↔ tabla**: un interruptor (`aria-pressed`) alterna entre ambos. Sin JS se ven los dos.
- **Detalle**: cada grupo de barras es un `<button>` con `aria-label` completo y un tooltip visual al pasar o enfocar;
  los puntos de dispersión son enfocables. Las figuras SVG llevan `role="img"` con la lectura en `aria-label`.
- **Embudo**: ancho relativo a la primera etapa (piso 2 %) y, si viene `derived.funnelStepRates`, la tasa de paso.
- **Narrable**: expone `data-step` para que `ModuleScene` cambie su estado por paso; sin JS queda en estado final.
- **Geometría** en `src/lib/insights-chart-geometry.ts`, con las mismas convenciones que
  `src/lib/artifact-composer/chart-geometry.ts` de greenhouse-eo (la fuente de los PDF): barras con origen cero, escala
  «redonda» de ~4 tramos, torta/dona hasta 3 partes, medidor de 270° abierto, heatmap por intensidad (luminancia, nunca
  tono), waffle de 100 celdas por restos mayores, Venn de áreas proporcionales. Sólo produce posiciones y tamaños.

```astro
<ChartFigure spec={chart.spec} table={chart.table} derived={chart.derived} facts={model.facts}
  locale={model.locale} copy={C} uid={`fig-${chart.spec.chartId}`} />
```

### ModuleScene

Props: `chapter` (`InsightWebChapterV1`), `index` (número del capítulo, se imprime `01`, `02`…), `facts`, `locale`,
`copy`.

- **Gráfico principal**: el primero que tiene lectura (`readings`), o el primero del capítulo. Queda fijo mientras
  avanzan los pasos de su lectura, en orden: `key` (cifra principal con count-up que termina en el `display` exacto),
  `conclusion`, `meaning` (qué significa), `next` (próximo paso). Bajo el gráfico, la fila de procedencia: unidad,
  fuentes, fecha de corte y `FactMark` (estimado si alguna cifra lo es).
- **Demás gráficos**: como *beats* compactos alternados (texto + figura), cada uno con su propia lectura si la trae.
- **Hechos sueltos**: los citados por afirmaciones que no aparecen en ningún gráfico se muestran como fichas; un valor
  `null` se muestra como ausencia con su razón, nunca como cero.
- **Límites** del capítulo al final; capítulo vacío → estado vacío honesto.
- Sin JS se lee de corrido; con movimiento reducido, sin animar.

### FactMark

Props: `observation` (`'observed' | 'estimated'`), `copy`. Anillo de trazo lleno = «Medido»; anillo punteado =
«Estimado». El estado se comunica con la forma y el texto, nunca con color de semáforo ni con una esfera (regla de
«La órbita»).
