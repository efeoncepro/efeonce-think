# AEO X-Ray — revisión SEO/AEO

Fecha: 2026-09-30. Alcance: composición publicada de Banco Pichincha, dos artefactos y cuatro pasos; contrato reutilizable, HTML, experiencia interactiva y evidencia. Skills: `seo-aeo` y `seo-aeo-practice`, con sus módulos de SEO técnico, E-E-A-T, AEO y medición.

## Evaluación

La herramienta demuestra una cadena útil: intención de búsqueda → contenido → decisiones técnicas verificables → derivados con origen. La landing y el artículo tienen papeles distintos y se conectan; el inspector explica decisiones sobre bloques concretos. Las fuentes, fechas, condiciones y HTML legible sin JavaScript son fortalezas. La marca del cliente y el recorrido compartido conservan la identidad de una muestra comercial.

La demostración acredita ejecución, no resultados orgánicos del cliente. No es una auditoría exhaustiva del dominio del banco, ni un estudio de presencia en motores generativos. No se han medido en esta revisión Search Console, logs del banco, Core Web Vitals de campo, un panel de respuestas IA ni conversiones comerciales.

## Mejoras incorporadas

| Prioridad | Hallazgo | Cambio |
| --- | --- | --- |
| Alta | La respuesta aislada de tasas perdía la fecha de apertura a la que aplican los tramos en soles. | La condición viaja en el caption de la tabla, en landing, respuesta e inspector. |
| Alta | Las evidencias existían en el contrato pero no se mostraban. | Disclosure reutilizable con descripción, fecha y enlaces en decisiones e instrumento; expone método, frescura y límites de los volúmenes estimados. |
| Alta | La guía financiera no mostraba la revisión editorial pendiente. | El adaptador conserva el reviewer opcional del contrato; la muestra sin reviewer muestra el pendiente sin inventar una persona. |
| Media | Varias decisiones AEO repetían una explicación genérica. | Justificación específica para tasa, saldo promedio, apertura y cobertura. |
| Media | Medición abstracta y copy acoplado a bancos. | Plan por pregunta/URL, línea base pendiente, protocolo por motor/modo/país/fecha/número de observaciones; defaults reutilizables entre industrias. |
| Media | FAQPage podía interpretarse como ventaja actual en Google. | Nota y fuente oficiales sobre su retiro como resultado enriquecido; el ejemplo permanece inerte y opcional. |
| Media | Cierre del inspector móvil perdía foco o retenía estado expandido. | Retorno al botón de origen, sin reapertura, y aria-expanded coherente, incluso entrando por fragmento. |
| Media | Un enlace a una pieza social concreta seleccionaba la primera. | Selección por fragmento inicial/hashchange y actualización del enlace al elegir formato, sin autoplay. |

## Próxima fase para un cliente real

1. Aprobación editorial y revisión de producto por una persona responsable del cliente; comprobar vigencia de documentación financiera antes de publicar.
2. Publicación en el dominio destino, con canonicals, schema compatible con el contenido aprobado y permisos de rastreo verificados allí. Esta muestra conserva noindex, no-store y JSON-LD inerte.
3. Línea base SEO por consulta/página/país/dispositivo; confirmar indexación, arquitectura del sitio y rendimiento de campo.
4. Panel AEO acordado por motor y modo: guardar pregunta, respuesta, URL citada, exactitud, fecha y número de observaciones. Repetir el mismo protocolo. No convertir presencia o volumen estimado en tráfico, ingresos ni cuotas sin denominador.
5. Medir la acción comercial acordada con acceso autorizado. Distinguir clic en CTA, llegada al canal y conversión efectiva.

La aprobación y datos del cliente son insumos para esa fase; no impiden mostrar este X-Ray como demostración.

## Fuentes actuales contrastadas

- [Producto Banco Pichincha](https://www.pichincha.pe/personas/cuenta/ahorro-preferente): condiciones y fecha de aplicación de tramos en soles.
- [Google: optimización para experiencias IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): fundamentos SEO, sin schema especial para IA.
- [Google: cambios de documentación](https://developers.google.com/search/updates): retiro de resultados enriquecidos FAQ desde el 07/05/2026; retirada de documentación el 15/06/2026.
- [OpenAI: bots](https://developers.openai.com/api/docs/bots): OAI-SearchBot y GPTBot tienen finalidades y controles separados.

## Verificación

- 19 pruebas del contrato, aislamiento, transporte, referencias y activos aprobados.
- 198 comprobaciones de los cuatro pasos y dos piezas en 1440, 390 y 320 px, incluidos privacidad, HTML sin JS, imágenes y navegación.
- 113 comprobaciones de medios y reproducción desde gesto del usuario.
- 46 comprobaciones del X-Ray original: se actualizó el selector de la prueba de separación tipográfica para el rótulo actual de cabecera, sin relajar la aserción. La captura desktop legacy también fue revisada.
- Astro check: 0 errores, 0 warnings; 15 hints preexistentes. Build completo.
- Revisión directa en navegador: prueba de keyword con fecha/método, decisiones específicas, plan por URL, condición de tasas, retorno de foco y estado expandido, enlace social `#delivery-2`, ausencia de overflow a 390 px.
- 25 comprobaciones de motion y navegación pasaron en la corrida final, registrada en `.captures/aeo-xray-motion/verification.json`; el primer intento coincidió con cambios del servidor de desarrollo y agotó la espera de la transición. No se usa como evidencia de aprobación.

El scope de publicación es exclusivamente `efeonce-think`; Greenhouse no forma parte del deploy. Evidencia final de producción en `.captures/aeo-seo-audit/` (archivos locales ignorados), con SHA/deployment y captura.
