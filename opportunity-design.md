# La oportunidad — dirección y verificación

Fecha: 2026-09-30. Extensión de la muestra existente; runtime exclusivo de Think.

## Dirección

Referencia viva: captura `.captures/aeo-opportunity/before.png`. La apertura anterior fragmenta argumento y evidencia en paneles similares y no anticipa visualmente la pieza siguiente. En ancho intermedio el título se parte en demasiadas líneas. El rail conserva cuatro pasos.

Alternativas consideradas: (1) ranking ampliado, útil para auditar pero débil como apertura; (2) réplica de Google AI Mode, reconocible pero fácil de confundir con una observación real; (3) recorrido editorial de pregunta → respuesta → fuente, seleccionado. Usa datos y contenido reales de la composición, sin atribuir una respuesta a un proveedor de IA.

Primer pliegue: tesis a la izquierda y demostración a la derecha; una vista previa de la pieza funciona como fuente y CTA. El siguiente bloque conserva la observación SERP, fecha/mercado, consulta y límites. No convierte posiciones puntuales en una ausencia global.

En móvil: tesis, demostración y evidencia en una columna; sin scroll horizontal, iconos orientativos y tamaños legibles. El artículo y la landing mantienen su identidad bancaria. El frame analítico conserva navy, Geist/Poppins, Lucide y tokens CSS de X-Ray/AXIS.

## Motion e interacción

- Recorrido breve de consulta, respuesta y fuente. Una única reproducción automática; control para repetir. El contenido queda completo en reposo, sin JS y con reduced motion.
- Vista previa = la misma pieza de la etapa 2. Shared element `xr-article` transforma la tarjeta en lectura; nunca morph entre clientes o artefactos diferentes.
- Preservar 2→3, retroceso/avance, query del artefacto, foco y scroll. Los elementos no interactivos de la ilustración no aparentan un buscador operativo.
- Iconografía por rol semántico: navegación, listas, comparación, preguntas y fuentes. No sustituye títulos ni significado; SVG decorativos fuera del árbol accesible.

## Alcance de datos

DataForSEO se retira de las fuentes editoriales consultadas del artículo; sigue siendo procedencia de la investigación donde corresponde. Renombrado visible a «La oportunidad», manteniendo las URLs existentes.

## QA requerido

Capturas 1440/390/320; inspección del pliegue y de la evidencia; iconos en módulos/índice; noJS/reduced motion; replay; transición real 1→2, 2→3 y back; ausencia de desbordamiento; fuentes editoriales sin DataForSEO. Despliegue de Think y readback del SHA publicado.

## Resultado local

- `pnpm type-check`: 0 errores, 0 warnings (15 hints preexistentes); `pnpm build`: correcto.
- Contrato v2: 19 tests; recorrido compuesto: 198 comprobaciones; legado: 46/46.
- Motion: 49 comprobaciones en `.captures/aeo-xray-motion/verification.json`, con geometría real, continuidad de la foto, retorno visible, historial y separación de artefactos.
- Reduced motion y navegación sin JS comprobados. Se desactiva la transición nativa cross-document sólo cuando `scripting: none`; ClientRouter conserva su coreografía.
- Inspección visual 1440, 390 y 320; sin overflow. Replay reproduce y se detiene completo. Fuentes del artículo verificadas en DOM: cinco enlaces, sin DataForSEO.
- Iconos decorativos fuera del árbol accesible; las rutas y el contenido técnico permanecen disponibles.
- Captura final local: `.captures/aeo-opportunity/local-final.png`. El cierre de publicación se registra por separado en `.captures/aeo-opportunity/release.json` contra el SHA exacto del proveedor.

## Portada de entrada — 2026-09-30

Solicitud del operador: telón azul con logo cliente, «Esto preparamos para ti:», «Haz click aquí» y, bastante más abajo, Efeonce AEO + URL bubble. Dirección elegida: invitación centrada sobre azul profundo, con dos zonas de lectura separadas por aire. Se descartó una tarjeta flotante (no sería un telón) y una portada con imagen (compite con la jerarquía solicitada). El logo cliente sale de `brand.logoAssetId`; el fallback es `preparedFor`.

El telón usa `--navy-sunk` del X-Ray; textos y acción usan sus tokens de contraste. Firma oficial sin alterar: lockup AEO y `url-bubble-baked-dark` de AXIS. El gris de firma tiene contraste >5:1 sobre este fondo. No hay órbita decorativa ni un nuevo logo.

Se muestra al entrar por el primer paso, una vez por pestaña/caso; no interrumpe navegación interna ni enlaces profundos. La apertura dura `--xr-motion-open` (820 ms) y usa `--xr-motion-ease`; sólo transforma el telón y desplaza suavemente el contenido. Modal nativo con foco contenido y retorno al título. Reduced motion abre de inmediato. Sin JS, el formulario nativo `method=dialog` permite continuar. El demo de búsqueda espera al evento de apertura. El estado no persiste si sessionStorage está bloqueado, pero nunca impide abrir el contenido.

QA del telón: `scripts/verify-aeo-xray-curtain.mjs`; evidencia en `.captures/aeo-xray-curtain/`. Los gates del recorrido y motion abren primero la invitación con su botón real.

Validación final del telón: 41 comprobaciones (1440, 390 y 320 px), 198 del recorrido y 49 de motion; build correcto y type-check sin errores ni warnings. Revisadas capturas del telón cerrado y en ascenso. La respuesta se reinicia aún cubierta, sin fundido inverso visible, y comienza a revelarse después de la apertura.
