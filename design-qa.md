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
