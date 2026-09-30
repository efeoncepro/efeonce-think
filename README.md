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
| `/insights/r/[token]` | Informe compartido de Efeonce Insights (SSR por request, token-gated). Ver sección abajo | en producción (2026-09-28) | **noindex** |
| `/insights/muestra` | Muestra pública del informe de Insights para clientes: mismo render (`InsightReport`), datos de ejemplo y marca ficticia | en producción (2026-09-28) | **noindex**, fuera del sitemap |

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

### Conversion primitives — Growth CTA seed

- **`EfeonceMeetingEmbed`** (`src/components/EfeonceMeetingEmbed.astro`) — seed Think del patrón portable `book_meeting`.
  La ruta noindex `/preview/meeting-embed` permite revisar estética antes de insertarlo en informes o landings.
  Default `mode="overlay"`: renderiza un CTA medible que abre HubSpot Meetings en un booking room fijo,
  amplio y con scroll del documento bloqueado. Esto evita que el paso de datos/privacidad de HubSpot quede
  desalineado dentro de una card angosta. En mobile, el overlay es dueño del scroll y el iframe se mantiene
  alto para evitar scroll interno de HubSpot; los mensajes de altura del iframe resetean el overlay al inicio
  de cada paso, así los campos quedan visibles antes del aviso de privacidad incluso tras elegir horarios bajos.
  `mode="inline"` queda reservado para superficies dedicadas y sólo
  después de QA de flujo completo; `mode="handoff"` abre HubSpot en pestaña nueva como fallback CRO-safe.
  La primitiva carga `MeetingsEmbedCode.js` una sola vez, conserva fallback directo, respeta
  `prefers-reduced-motion` y emite `dataLayer` sin PII:
  `gh_cta_clicked`, `gh_meeting_embed_viewed`, `gh_meeting_embed_loaded`, `gh_meeting_embed_failed`.
  Cuando se inserte en reportes tokenizados, debe redactar `page_uri` como `/brand-visibility/r/[token]`;
  no enviar tokens reales al tracking plan. La arquitectura destino vive en Greenhouse como `growth.cta` y HubSpot Meetings es sólo la
  acción/destino `book_meeting`, no el source of truth.

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
| `GREENHOUSE_THINK_KEY` | server (secret) | vacío | Llave de Think ante `/api/public/**` de Greenhouse (header `x-efeonce-think-key`): el Firewall exceptúa del límite por IP sólo a quien la presenta. Vacía = funciona igual, sin holgura. |
| `GREENHOUSE_API_BYPASS` | server (secret) | vacío | Sólo para apuntar a staging (SSO de Vercel): se envía como `x-vercel-protection-bypass`. Vacío en producción. |

## Stack

Astro 7 · adapter Vercel 11 · React islands · Tailwind 4 (CSS-first) · GSAP · ECharts (radar,
tree-shaken) · Geist + Poppins · TypeScript strict. Espeja las convenciones de `efeonce-web`
para converger sin fricción.

## Deploy

Auto-deploy en cada push a `main` (Vercel, team `efeonce-7670142f` — **NUNCA** scope personal).
Proyecto `efeonce-think` (`prj_F4gvS8jmWjvdJ8cTwM6k60R1XydV`). Gobernable desde Greenhouse vía
`greenhouse.repo.json` (cableado del control plane multi-repo = TASK-1326).

## Efeonce Insights — informe compartido (`/insights/r/<token>`)

Render tonto de `InsightWebModelV1` (modelVersion `1.x`; `1.1` es aditivo) que Greenhouse sirve en
`GET /api/public/insights/shared/{token}`. Owner: `TASK-1875` (greenhouse-eo). Resolución por request, sin cache:
revocar en Greenhouse revoca en la lectura siguiente. Estados `404`/`410`/`429`/`502` con `StatusScreen`.

- Página: `src/pages/insights/r/[token].astro`. Componentes: `src/components/insights/` (ver
  `src/components/primitives/README.md`). Interacción: `src/scripts/insights-report.ts`. Estilos: `src/styles/insights.css`.
- Único lugar con valores de marca: `src/lib/insights-tokens.ts` (La órbita, copiada de AXIS). Copy del chrome
  es-CL/en-US por `model.locale`: `src/lib/insights-copy.ts`.
- El token nunca aparece en el HTML: descargas por `?descargar=report_pdf|deck_pdf` y logo del cliente por `?logo=1`
  sobre la misma URL (Greenhouse revalida el grant). Sin GTM; `Cache-Control: private, no-store`,
  `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`.
- Assets: `public/branding/insights/*` (de `@efeoncepro/axis-brand-assets` 0.4.0); OG genérica sin datos del informe,
  generada con `node scripts/build-insights-og.mjs`.
- Fixtures sólo en `astro dev` con tokens `fixture-*` (`src/lib/insights-fixtures.ts`).

Verificación (con `pnpm dev --port 4331` corriendo):

```bash
pnpm test:insights                                 # 14 pruebas de vista y geometría
node scripts/verify-insights-report.mjs            # estados, cabeceras, token fuera del HTML, overflow, cifras, motion reducido
node scripts/audit-insights-a11y.mjs               # contraste AA + recorrido con Tab en 1440 y 390
node scripts/capture-insights-report.mjs <dir>     # dossier visual desktop/mobile, presentación y motion reducido
```

Estado: construido y verificado en local (verify «Todo verde», a11y AA en 1440/390, 14 pruebas). **Sin desplegar**:
`main` publica producción automáticamente, así que el push queda pendiente del operador.

## Radiografía AEO — muestras de trabajo (`/muestras/<slug>`)

Un artículo real con **su capa de máquina visible y acoplada** al lado (JSON-LD, metadatos,
`alt`, encabezados, enlaces de cluster) más **un tercer panel con la evidencia** de por qué
ese artículo existe. Se usa como muestra en propuestas comerciales. Owner: `TASK-1410`
(greenhouse-eo).

**El cliente es un payload, no código.** Para hacer la muestra del siguiente cliente:

1. Escribe `src/content/aeo-xray/<cliente>-<slug>.json`. Copia
   `sky-carretera-austral.json` como referencia.
   **Genera su token con `openssl rand -hex 6`** y decláralo en el campo `token`.
2. Deja las imágenes en `public/muestras/<cliente>-<slug>/`.
3. `pnpm build && pnpm verify:aeo-xray` (usa `XRAY_SLUG=<cliente>-<slug>`).

No se toca ni un componente. Si terminas escribiendo un `if (cliente === '...')` en algún
componente, la frontera se rompió.

El schema Zod (`src/content.config.ts`) es el gate de calidad: **obliga** `alt` + autoría +
licencia en cada imagen y `source` + `asOf` en cada cifra. Un payload incompleto **rompe el
build** en vez de publicar una muestra que promete rigor y no lo tiene.

### ⚠️ Invariantes (romper uno vuelve la pieza en contra)

1. **El JSON-LD se renderiza como TEXTO ESCAPADO.** Jamás dentro de un
   `<script type="application/ld+json">`, y la página **no** le pasa `jsonLd` a `BaseLayout`.
   Emitirlo aquí declararía, en *nuestro* dominio, que Efeonce publicó un artículo del cliente:
   un dato estructurado falso, ingerible por crawlers y motores de respuesta, justo en la pieza
   cuya tesis es el rigor técnico. El assert 1 del verify **falla el gate** si aparece uno solo.
2. **`noindex` + fuera del sitemap** (el `filter` vive en `astro.config.mjs`).
3. **Rótulo persistente** "Ejemplo ilustrativo de Efeonce": niega autoría **y** alojamiento.
4. **Procedencia verificable + crédito visible.** El caso original usa fotografía licenciada.
   Una composición nueva sólo incorpora material generativo con autorización del operador
   y disclosure; nunca lo presenta como fotografía documental o testimonio real.
5. **Nunca prometer el rich snippet de FAQ de Google** (restringido desde 2023 a gov/salud).
6. **Cero cifras sin fuente y sin `as-of`.**
7. **La URL lleva token: `/muestras/<slug>-<token>`.** Sin él es adivinable — quien recibe
   `/muestras/sky-…` puede probar `/muestras/<competidor>-…`. El token **se declara en el
   payload, jamás se genera en el build**: uno aleatorio por build cambiaría la URL en cada
   deploy, y esa URL va a una lámina y a una propuesta. Es oscuridad, no seguridad (no hay
   auth): quien tenga el enlace, entra. Para una muestra de trabajo, es justo lo que queremos.


## X-Ray compuesto: publicación autónoma por cliente

El mismo `Experience.astro` sirve el recorrido original y las composiciones de landing/artículo,
radiografía y derivados. Una muestra `sample_*` se distribuye directamente desde Think, sin
consultar Greenhouse, sin flags ni migraciones. El enlace es no listado, con `noindex`, sin
analytics. No es autenticación: quien recibe el enlace puede abrirlo y sus imágenes son públicas.

Para otro cliente: generar y validar el manifest con el kit de composición, agregar un JSON en
`src/lib/aeo-xray/published/` con `key` aleatoria estable, `editionId`, `model` y mapa `assets`,
y registrarlo en `published.ts`. Copiar únicamente los archivos finales autorizados a
`public/aeo-xray-media/<key>/`. No se modifica la UI. Para retirar una muestra, quitar su
entrada y sus imágenes y volver a desplegar; esta modalidad no ofrece revocación central.
El carril futuro `xrg_*` conserva su contrato separado con Greenhouse.

Verificar antes de publicar: `pnpm type-check`, `pnpm build`, `pnpm test:aeo-xray-v2`,
`node scripts/qa/verify-aeo-xray-distribution.mjs` y el recorrido con
`XRAY_VERIFY_TOKEN=<key> pnpm verify:aeo-xray-v2` sobre el servidor local.
Publicación: commit del alcance propio y push a `main` de **efeonce-think**;
Vercel despliega Think de forma independiente. Verificar el SHA nuevo y el enlace público.

### Módulos de landing y exploración del valor

`LandingModules.astro` compone los bloques del manifest en beneficios, condiciones,
proceso, documentos, FAQ, contenido relacionado y CTA. `landingSections` conserva el orden
y los IDs de origen; los módulos no contienen nombres ni IDs de clientes. Las tablas no
compatibles con el selector conservan su representación semántica completa.

`ValueExplorer.astro` conecta `experience.evidence.fanOut.items[].coveredBy` con el bloque real,
sus anotaciones y sus fuentes. Las explicaciones y estados duplicados en `machine.craft`
deben coincidir con la anotación correspondiente; el paquete publicado lo verifica con tests.
No se simula una respuesta de un motor ni se presentan resultados que no se han medido.

El `ClientRouter` del enlace compuesto conserva el documento durante el recorrido. El espécimen
se transforma entre lectura y radiografía; los listeners se reinician tras `astro:page-load`,
y la atomización revela los derivados conservando sus vínculos de origen. La navegación
sin JS y con movimiento reducido mantiene el contenido y los enlaces.

Antes de publicar cambios al recorrido, ejecutar también con `XRAY_VERIFY_TOKEN=<key>`:
`node scripts/verify-aeo-xray-motion.mjs` (movimiento real, no sólo presencia de CSS) y
`node scripts/verify-aeo-xray-value.mjs` (pregunta, respuesta, fuente, bloque y módulos).
Las capturas y trazas quedan en `.captures/aeo-xray-motion` y `.captures/aeo-xray-value`.

### Marca y producción de derivados

El header toma el logo de `brand.logoAssetId`; la atribución de la demostración vive en el
footer. Los banners del artículo son bloques de imagen con proporción intrínseca, crédito,
fuente y anotación. Los assets cuyo crédito comienza con `Composición:` se muestran como
«Diseño» en lugar de «Foto».

`SocialShowcase.astro` presenta todos los elementos de `experience.atoms`, sin un límite fijo
de tres. `post.imageAssetId` proporciona una gráfica; `reel` incorpora el video y su poster.
El componente incluye pestañas accesibles, ampliación, descarga y reproducción controlada,
que arranca al pulsar «Video» y ofrece un Play grande para reanudar o repetir,
conservando el enlace al bloque de origen y el detalle de producción. Sin JavaScript muestra
todos los formatos. Cambiar de formato o de página pausa el video.

La muestra Pichincha contiene tres piezas de feed, una Story, un video de diez segundos y
dos banners contextuales. Los masters, editables, referencias, prompt, consumo y procedencia
quedan fuera del repositorio en `Banco Pichincha Peru — Prospect Case/06-Social-production`,
`07-Video-production` y `08-Article-banners`; Think distribuye únicamente las entregas.

Gate de medios: `XRAY_VERIFY_TOKEN=<key> node scripts/verify-aeo-xray-media.mjs`.
Verifica carga y proporción de banners, formatos, ampliación, teclado, video real, pausa,
origen, no-JS y ausencia de overflow a1440/390/320. Las capturas quedan en
`.captures/aeo-xray-media`. La revisión visual de esas capturas sigue siendo necesaria.
