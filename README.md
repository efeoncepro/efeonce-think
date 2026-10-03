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
| `/muestras/<slug>-<token>` | Radiografía legacy (SKY), mismo renderer X-Ray | en producción | **noindex**, fuera del sitemap |
| `/aeo-xray/r/sample_<clave>` | Composición X-Ray landing/artículo autónoma, sin Greenhouse; enlace público no listado | en producción (2026-09-30) | **noindex**, fuera del sitemap |
| `/aeo-xray/r/xrg_<grant>` | Consumer de ediciones/acceso gobernados Greenhouse | implementación local; provider/flags/migración/canary productivos pendientes | **noindex** |

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

Render tonto de `InsightWebModelV1` (modelVersion `1.x`, hoy `1.4`; cada menor es aditivo) que Greenhouse sirve en
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
- Fixtures sólo en `astro dev` con tokens `fixture-*` (`src/lib/insights-fixtures.ts`); `fixture-cifras` es el modelo 1.4.
- Modelo 1.4 (TASK-1975): la tarjeta de cifra (`StatCard.astro`) abre el capítulo antes de los gráficos, que Think
  dibuja en el orden en que llegan. Retícula 1 / 2 / 3 columnas según la cantidad (una a 390 px), variación con
  triángulo redondeado (píldora teñida sobre papel; sólo el triángulo sobre navy) y el recorrido aprobado de la cifra
  (`count` del modelo). El waffle dibuja un cuadro por unidad (5 columnas hasta 30, 10 hasta 100; más, sólo tabla).

Verificación (con `pnpm dev --port 4331` corriendo):

```bash
pnpm test:insights                                 # 14 pruebas de vista y geometría
node scripts/verify-insights-report.mjs            # estados, cabeceras, token fuera del HTML, overflow, cifras, motion reducido
node scripts/audit-insights-a11y.mjs               # contraste AA + recorrido con Tab en 1440 y 390
node scripts/capture-insights-report.mjs <dir>     # dossier visual desktop/mobile, presentación y motion reducido
```

Estado histórico de esas pruebas: local. El renderer Insights y la muestra están en producción desde el 28/09/2026; apertura del sharing Greenhouse requiere su flag/rollout y evidencia independientes. No inferir grant operativo por existir el renderer.

## Radiografía AEO — muestras de trabajo (`/muestras/<slug>`)

Un artículo real con **su capa de máquina visible y acoplada** al lado (JSON-LD, metadatos,
`alt`, encabezados, enlaces de cluster) más **un tercer panel con la evidencia** de por qué
ese artículo existe. Se usa como muestra en propuestas comerciales. Owner: `TASK-1410`
(greenhouse-eo).

**El cliente es un payload, no código.** El procedimiento siguiente es **legacy**; para un cliente nuevo usar el kit AXIS compuesto documentado en Greenhouse (sección siguiente), no copiar el caso SKY ni su token:

1. Escribe `src/content/aeo-xray/<cliente>-<slug>.json`. Copia
   `sky-carretera-austral.json` como referencia.
   **Genera su token con `openssl rand -hex 6`** y decláralo en el campo `token`.
2. Para legacy, deja las fotografías en `src/assets/muestras/<cliente>-<slug>/` para pasar por el pipeline Astro. No confundir con entregas estáticas autorizadas del carril compuesto autónomo.
3. `pnpm build && pnpm verify:aeo-xray` (usa `XRAY_SAMPLE=<cliente>-<slug>`).

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

La cabecera usa el lockup oficial `aeo-lockup-negative.svg` de
`@efeoncepro/axis-brand-assets` 0.4.8, idéntico al archivo de Greenhouse y al sello AXIS
`5e51544c05601735213789b0d9fc8e3be12eee950251bb3a2abf78f49403fecb`.
Se distribuye como copia estática sin editar en `public/branding/`; X-Ray identifica
la experiencia en la barra de piezas, separado del lockup de marca.

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

### Invitación de entrada del X-Ray

Las ediciones compuestas tienen un telón de bienvenida al entrar por «La oportunidad».
`WelcomeCurtain.astro` toma el logo del manifiesto y mantiene el contenido completo debajo.
La apertura se recuerda por caso en la pestaña; enlaces profundos e historial conservan su destino.
Se usa `dialog` y `form method=dialog`: navegación con teclado, reducción de movimiento y
continuación sin JavaScript. La secuencia de preguntas espera hasta abrir el telón.

La burbuja `public/branding/url-bubble-baked-dark.svg` es una copia estática **sin modificar** de
`@efeoncepro/axis-brand-assets`, hash canónico
`cdc09b6b0250cffc442aec76e3415136396400baf433194e594e99496ab73c29`.
Acompaña al lockup oficial AEO sobre fondo oscuro; nunca lo sustituye.
Verificación: `node scripts/verify-aeo-xray-curtain.mjs` (mismo `XRAY_VERIFY_BASE` y
`XRAY_VERIFY_TOKEN` que los gates de composición).


### Manuales canónicos y repetición por cliente

La documentación de dominio vive en `../greenhouse-eo/docs/think/`:

- `radiografia-aeo-architecture.md`: modelo y renderer, acceso, evidencia e invariantes.
- `radiografia-aeo-manual.md`: operación detallada de todos los carriles, etapas, QA y release.
- `aeo-xray-nuevo-cliente.md`: kit neutral, expediente privado, investigación, marca, medios y entrega.
- `aeo-xray-release-handoff.md`: publicación independiente y pendientes de integración.
- `../docs/documentation/comercial/radiografia-aeo-muestra-de-trabajo.md`: producto y límites de venta.

Desde Greenhouse, `node scripts/aeo-xray/client-kit.mjs init --client "Cliente" --locale es-CL
--out /ruta/privada/caso` crea BRIEF/intent/assets; `validate` y `build` usan el contrato AXIS.
`--draft` permite preview incompleta, nunca aprobación de entrega. Con `XRAY_CASE_DIR=/ruta/privada/caso`
y `pnpm dev --host 127.0.0.1 --port 4346`, `/aeo-xray/r/fixture-client?artifact=landing&step=articulo`
carga el expediente genérico únicamente en DEV. El loader verifica mapa lógico, hash de bytes,
MIME soportado y containment real; rechaza escapes y symlinks fuera de la carpeta de medios.

Reutilizar componentes y contrato, no copiar nombres/claims/personas ni aprobaciones de otro
cliente. El selector conserva `step`; los valores técnicos siguen `''`, `articulo`, `radiografia`,
`atomizacion` y los nombres visibles son La oportunidad/La pieza/La radiografía/Dónde más vive.
`step=articulo` sirve también la landing. Un cliente nuevo requiere QA propio: los gates bancarios
usan IDs del caso Pichincha y no acreditan automáticamente cualquier contenido.

### Telón, motion y contrato de degradación

La entrada primera etapa muestra logo cliente, invitación, botón, lockup AEO y burbuja oficial.
La apertura normal asciende durante 1400ms con arco deliberado; el contenido entra desde 56px.
`xray:curtain-opening` prepara la pregunta bajo el telón y `xray:curtain-opened` inicia la secuencia.
El caso se recuerda por pathname en sessionStorage de la pestaña; nueva pestaña repite entrada.
Deep links, Back y navegación interna conservan destino sin bienvenida repetida. `dialog`/form
nativos mantienen Escape, foco, scroll y continuación sin JS; reduced-motion revela inmediatamente.

**Bug de producción resuelto:** el optimizador CSS puede convertir `1400ms` en `1.4s`; WAAPI espera
milisegundos. Leer parseFloat sin sufijo reduce apertura a 1.4ms. `WelcomeCurtain.astro` convierte
según `ms`/`s`, y el gate ejercita CSS serializada en segundos y desplazamiento gradual. Validar
build y live, no sólo DEV. No eliminar reduced-motion para forzar una animación.

El selector tiene iconos, indicador compartido y texto en snapshot superior para evitar que se
oculte durante la transición. La pieza→radiografía conserva geometría; cambiar de artefacto evita
morph entre entidades distintas. Las duraciones vienen de `src/styles/aeo-xray.css`:
control 300ms, morph 620ms, oportunidad→pieza 820ms, vuelta 700ms y telón 1400ms.

### Honestidad, privacidad y operación

El recorrido pregunta→respuesta→fuente es ilustrativo; no es resultado real de Google AI Mode/LLM.
`ValueExplorer` muestra preguntas y fuentes contra bloques existentes. La radiografía distingue
alcance y proposed/implemented/verified/measured, sin confundir implementación demo con sitio cliente.
El schema del banco sólo se muestra como texto escapado, nunca JSON-LD activo en Think.
DataForSEO sigue como provenance de research; no aparece entre fuentes editoriales del producto.
Los beneficios/condiciones provienen de fuentes oficiales fechadas y se reverifican antes del envío.

La distribución autónoma usa public/aeo-xray-media y lectura SSR con no-store/noindex/no-referrer,
sin analytics. Esas cabeceras **no protegen medios estáticos ni autentican al lector**. No usarla
para datos confidenciales. Su expiresAt de envelope es compatibilidad y no un TTL gobernado.
Retiro: borrar entrada **y medios**, redeploy y readback. Modelo/API/medios privados/TTL/revocación
Greenhouse pertenecen al carril xrg_* pendiente. No desplegar Greenhouse para compartir un sample.

Los masters, briefs, research, prompts y costos quedan fuera de Git; el registro runtime incluye
sólo modelo y entregas finales autorizadas. Nunca copiar secretos de proveedores o bearer de grants
al manifest, evidencias públicas, analytics o docs. Un permiso de gasto/creación no se hereda entre clientes.

### Verificación y evidencia al cierre del 30/09/2026

Think `be8d4841e1124818bd7f4c88d0d7ad7b970e5122`, deployment
`dpl_7AEWYHEiiWWUyCiwrcTj1US1e3vB`, READY y alias `think.efeoncepro.com` verificados.
Es un registro de release, no garantía de salud futura. URL concreta y QA del caso se conservan
privadamente. Greenhouse no se publicó con esta entrega; migración y canary productivos pendientes.

Con servidor local corriendo, elegir `XRAY_VERIFY_BASE`/`XRAY_VERIFY_TOKEN` por entorno y ejecutar:

```bash
pnpm type-check
pnpm build
pnpm test:aeo-xray-v2
node scripts/qa/verify-aeo-xray-distribution.mjs
pnpm verify:aeo-xray-v2
node scripts/verify-aeo-xray-motion.mjs
node scripts/verify-aeo-xray-value.mjs
node scripts/verify-aeo-xray-media.mjs
node scripts/verify-aeo-xray-curtain.mjs
XRAY_SAMPLE=sky-carretera-austral pnpm verify:aeo-xray
```

Defaults de verificadores compuestos: base 127.0.0.1:4345, token fixture-pichincha (sólo DEV).
Capturas ignoradas `.captures/aeo-xray-{v2,motion,value,media,curtain}` deben abrirse y revisarse.
Comprobar 1440/390/320, deep links, teclado, noJS, reduced-motion, overflow y video con tiempo avanzando.
No provocar HMR mientras un test registra transición. Gate verde no sustituye lectura editorial ni
revisión visual. Publish autorizado: commit alcance propio, push main **Think**, READY + SHA exacto
+alias y lectura pública de documento/medios, conservando rollback del deployment anterior.
