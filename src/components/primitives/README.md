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

## Catálogo

| Primitive | Contrato | Qué es | Consumers |
|---|---|---|---|
| **`MaturityLadder`** | `@lib/primitives/ladder` (`LadderRung`) | La "escalera" — N peldaños de madurez que se suben en orden. Altura del pedestal-líquido = posición; color = severidad; `null` = "En cobertura" (hatch); `isNext` = "Empieza aquí". Anima su entrada (peldaños suben + count-up) self-contained. | Informe AEO (`brand-visibility/r/[token]`, sección "La escalera de visibilidad en IA") |

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
