# AEO X-Ray — revisión desde referencia Banco Pichincha

Fecha: 2026-09-30. Product Design aplicado al código existente. La aceptación funcional previa no implica aceptación visual.

## Fuentes y comparación

- Referencia del operador: `/Users/jreye/Documents/Banco Pichincha Peru — Prospect Case/05-XRay-production/assets/reference-bank/operator-reference.png` (3420x1970).
- Referencia oficial observada a 1440x1000 CSS px, DPR1: `.captures/aeo-xray-extension/official-reference-desktop.png`.
- Implementación revisada: `.captures/aeo-xray-extension/reference-revision-desktop.png`, `reference-revision-desktop-3.png`.
- URL local: `/aeo-xray/r/fixture-pichincha?artifact=ahorro-preferente&step=articulo`.
- Ambas imágenes desktop se abrieron juntas en la misma llamada de comparación. La segunda captura de implementación corresponde a coordenadas de documento con scroll activo: no certifica el marco sticky; se comparó el espécimen bancario. Captura estable completa pendiente.

## Findings e historial

1. [P1] Primera propuesta rígida: retrato vertical separado, sin banner bancario y rótulo genérico. Rechazada por operador. Corregida con header oficial, banner panorámico, H1 de producto y beneficios por moneda.
2. [P2] Revisión intermedia a 698px recortaba media cara y apilaba navegación extensa. Se corrigieron etiquetas cortas y breakpoint de apilado <=900px. Recaptura pendiente.
3. [P2] Copy desktop demasiado al borde y jerarquía de beneficios compitiendo con H1. Corregido a contenedor centrado1160px y H2~42px; observado en revisión desktop3.
4. [P2] Niveles de encabezados heredados del panel técnico en lectura. Corregidos H1/H2/H3 de lectura nueva; comprobados en navegador.
5. [P2] La regla legacy `.sp-read .post {display:block}` ganaba a la extensión y dejaba título/banner en688px. Corregido con especificidad explícita `.sp.sp-editorial`; navegador confirmó `contents` y1112px, nueva captura final-blog-desktop muestra dos líneas y banner ancho.
6. [P2] Márgenes heredados comprimían lectura móvil a258px; corrección a24px de margen útil en progreso.
7. [P2] Span100 del TOC creaba filas vacías. Revisión de longitud de página completa pendiente antes de aceptación.

## Superficies de fidelidad

- Tipografía: Roboto Slab licenciada mantiene la familia visual slab; no es Prelo original. Título52–56, cuerpo sans y navegación compacta. Revisión de tamaños finales móvil pendiente.
- Espaciado: banner fullwidth, contenedor centrado y beneficios agrupados reemplazan columna editorial de la landing. Blog y resto de página pendientes.
- Color: navy y amarillo de la referencia; se retiró el lavado con gradiente sobre fotografía. Efeonce conserva su marco propio.
- Activos: banner y logo originales, con fuente documentada, sin aproximación dibujada. Fotografía del blog Anete Lusina/Pexels. No se infiere aprobación bancaria ni publicación.
- Copy: Cuenta de Ahorros Preferente. No se encontraron referencias a cuenta corriente en payload activo; condiciones se muestran junto al dato. La muestra no abre cuentas.

## Verificación pendiente

Capturas estables desktop/390/698, recorrido completo, CTA/TOC/FAQ, contraste, console, mobile inspector y reduced-motion después de los últimos cambios. Revisión final del blog y todas las secciones de landing.

final result: passed (QA local; aceptación del operador y rollout pendientes)


## Cierre de revisión local — 30/09/2026

Los pendientes anteriores describen iteraciones ya corregidas. Comparación final conjunta de referencia oficial y `final-landing-desktop.png` a1440×1000: banner original, navy/amarillo, logo auténtico, jerarquía de producto y CTA visibles. El marco Efeonce, la composición de beneficios y la tipografía licenciada son diferencias intencionales.

Revisadas las capturas finales landing desktop/390/698, beneficios y blog. `final-blog-mobile.png` (11:55:52) confirma márgenes24px y ancho342px; `final-blog-full.png` (11:55:53,1440×6954) confirma desaparición de filas vacías. TOC lateral en desktop y disclosure móvil después del banner. El rail móvil muestra indicador de continuidad. No quedan P0/P1/P2 identificados en estas superficies. Esto no constituye aprobación del operador.

Gates finales: Astro check sin errores, build,9 pruebas unitarias,46 legacy y195 verificaciones de extensión, incluidos cuatro pasos por dos piezas en1440/390/320, privacidad/noJS/orígenes; distribución7 hashes. Sonda H2 de beneficios con teclado y expansión verificadas. Root comprobó en IAB el avance real pieza→radiografía tras reiniciar en pestaña nueva; la pestaña previa retenía un error de conexión del reinicio. Motion original y reduced-motion conservados; no se certifica accesibilidad integral ni rendimiento de producción.

El enlace es fixture local. Grant real, publicación y aceptación visual del usuario siguen pendientes.

## Revisión posterior al kit multicliente

La recaptura detectó regresión del hero desktop: regla genérica `.landing .blk` vencía a `.landing-photo` y apilaba la foto. Corregida especificidad también en breakpoint móvil. Nueva captura `desktop-ahorro-preferente-articulo.png` revisada muestra composición de referencia restaurada. Gate geométrico añadido;198 checks PASS y15 unitarias PASS. No implica aprobación del operador.

## Publicación autónoma autorizada — 30/09/2026

El operador solicita enviar la muestra ahora y pospone la conexión a Greenhouse. Se publica el mismo recorrido completo mediante paquete `sample_*` incluido en Think: manifest validado y tres imágenes aprobadas con hashes comprobados. No requiere Greenhouse, migraciones, flags, grants ni release general. Enlace no listado, noindex, sin analytics; no es acceso autenticado. Retirada mediante redeploy.

Preflight autónomo: build PASS, Astro check sin errores,17 pruebas unitarias PASS,198 verificaciones de experiencia con el paquete publicado PASS, distribución AXIS7 hashes PASS. El estado de despliegue se verifica contra Vercel y HTTP después del push.


## Corrección tras revisión del operador — motion y landing completa

El operador identificó que la publicación conservaba CSS de view transitions pero no una
transición perceptible durante el recorrido, y que la landing terminaba en texto genérico tras
el hero. El gate anterior con `reducedMotion: reduce` no certificaba movimiento real. Se corrige
esa afirmación de cierre: el motion ahora tiene una prueba independiente sin reducción.

- `ClientRouter` en la ruta compuesta; navegación por query y cambio de artefacto dentro del
  mismo documento, transformación del espécimen de620ms, entrada del instrumento y secuencia
  de derivados. Navegación atrás/adelante y acoplamiento reinicializados después del swap.
- Landing con9 módulos reutilizables: respuesta inicial, beneficios, condiciones por moneda,
  apertura, información de confianza, documentos, FAQ, artículo relacionado y CTA final.
  Se preservan hero, fotografía, tipografía y paleta de la referencia bancaria.
- Explorador compacto del valor: preguntas del manifest, respuesta real, decisión SEO/AEO,
  fuentes y salto al bloque exacto. Medición propuesta separa descubrimiento, presencia/citas
  y avance hacia producto; no atribuye resultados ni despliegue al dominio del banco.
- Paquete publicado revalidado con el contrato AXIS y condiciones oficiales consultadas al
 30/09/2026. Estados implementados sólo se refieren al HTML de esta muestra.

Evidencia local: Astro check0 errores, build PASS,19 tests, distribución AXIS7 hashes,
198 comprobaciones del recorrido,25 de motion efectivo,87 de valor/módulos y46 del motor original. Capturas y
trazas en `.captures/aeo-xray-extension`, `.captures/aeo-xray-motion` y
`.captures/aeo-xray-value`. Revisadas landing desktop y móvil y panel de valor; la revisión
independiente no identificó P1/P2 en las capturas de módulos. Esto no constituye aprobación
del operador, auditoría integral de accesibilidad ni medición de rendimiento del cliente.

Alcance de publicación: sólo **efeonce-think**. Greenhouse no recibe deploy ni cambios de runtime.
La verificación de Vercel y del enlace público se registra después del push.

## Personalización y producción visual — 30/09/2026

- Header con SVG oficial de Banco Pichincha Perú; atribución «Demostración de Efeonce»
  trasladada al footer. Marca resuelta desde el manifest, sin cliente fijo en componentes.
- Dos banners editoriales1440×640, tras TREA y apertura. La inspección de píxeles detectó
  un recorte heredado16:9 que eliminaba texto: ahora las imágenes interiores conservan
  su proporción intrínseca. El gate verifica esa relación, además de cargar el archivo.
- Tres láminas de feed1080×1350 y una Story1080×1920 compuestas con logo oficial, fuentes
  licenciadas y fotografía de procedencia conocida. Referencia: Instagram Banco Pichincha Perú.
- Video ilustrativo generado con Gemini Omni1.1 y acabado con placas tipográficas y SVG;
  entrega720×1280,10s,24fps, sin audio. No es un testimonio y se declara su procedencia.
- Galería por formato, controles de video, ampliación, descarga, teclado y bloque de origen.
  No-JS expone todo el contenido; cambiar de formato o ruta pausa el video. La galería es
  reutilizable para cualquier número de derivados del manifest.

Revisión visual: desktop1440, móvil390 y compacto320; abiertas las capturas de showcase,
video y banners. Se revisaron también los contact sheets de las piezas y del video.
Evidencia en `.captures/aeo-xray-media` y masters externos documentados en README.

Validación final local: Astro check0 errores, build PASS,19 tests de contrato,46 del motor
original,198 del recorrido compuesto,104 de medios y25 de movimiento/navegación; distribución
AXIS7 hashes. El gate legacy se adaptó a la clase compuesta del nuevo panel y conserva la
exigencia de fuente/fecha para cada cifra. La comprobación de privacidad falló de manera
intermitente durante trabajo con el servidor dev; una sonda posterior no reprodujo el caso
en HTML ni DOM y la corrida completa final pasó. Se conserva diagnóstico de contexto en
el gate y se exige comprobar de nuevo el enlace de producción.

Alcance: sólo Think. No se publica en Instagram, no se envía correo y no se despliega Greenhouse.
Aceptación visual final del operador y auditoría integral de accesibilidad no se presuponen.

### Ajuste de reproducción tras prueba del operador

El operador reportó que el video no reproducía. En su navegador IAB se verificó carga720×1280,
duración10s, avance tras el Play nativo y llegada al último fotograma. La interacción requería
dos clics: «Video» sólo cambiaba de vista y el Play quedaba debajo del primer viewport. Ahora
esa selección inicia reproducción por gesto del usuario; un botón grande permite reproducir,
reanudar y repetir, y un fallo real expone recuperación/descarga. No hay autoplay al abrir la página.

El gate ya no inicia el video con `play()` para probar ese flujo: exige que avance después del
clic en «Video» y prueba el control grande.113 checks locales de medios y25 de motion PASS.
El caso no-JS de motion espera la carga del instrumento completo: esperar sólo su contenedor
podía comprobarlo antes de que llegaran sus hijos en producción. No cambió el runtime no-JS.

### Precarga del router — causa confirmada

La corrida pública permitió identificar el fallo intermitente: ClientRouter habilitaba por
defecto prefetch en hover/foco e insertaba la URL absoluta del enlace compartido en un
`link rel=prefetch` del DOM. Se deshabilita la precarga con el atributo soportado por Astro
en los enlaces del X-Ray; las transiciones y la navegación por clic permanecen. El gate de
privacidad ahora provoca hover antes de comprobar el documento para reproducir esa ruta.

## Cabecera Efeonce AEO — 30/09/2026

Petición del operador: reemplazar la firma genérica del header por el logo existente de
Efeonce AEO y dar a X-Ray otra ubicación. Intervención `ui-lite`, sobre el shell existente.
Se usa el lockup negativo completo de AXIS sin rearmarlo ni editarlo; sus bytes coinciden
con Greenhouse y con el sello del paquete 0.4.8. Banco Pichincha conserva su posición a la derecha.

X-Ray pasa a la barra de piezas con un icono de inspección y «El contenido, por dentro»;
Landing/Artículo se agrupan a la derecha. En móvil se conserva el nombre y se omite el
descriptor secundario para dejar espacio útil. Capturas y geometría revisadas en 1440, 768,
390 y 320 px: logos separados, sin recorte ni overflow. Compilación y 25 comprobaciones de
motion y navegación aprobadas. Evidencia `.captures/aeo-brand/`.
Greenhouse y AXIS se consultan como fuentes; no se modifican ni se despliegan.
