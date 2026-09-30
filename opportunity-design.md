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
