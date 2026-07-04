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
