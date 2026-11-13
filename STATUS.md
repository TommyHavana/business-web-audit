# Estado de business-web-audit

Fecha: 12 de noviembre de 2026.

Primera versión local terminada y verificada dentro del alcance descrito. Proyecto independiente en esta carpeta. No se ha publicado ni desplegado. Para usarla, iniciar el servidor siguiendo [README.md](README.md).

## Criterios de aceptación

Los criterios de esta primera versión están cubiertos. Las comprobaciones realizadas y los límites de cobertura se detallan debajo; no equivalen a una certificación de las conclusiones comerciales.

| Criterio | Comprobación realizada | Resultado |
| --- | --- | --- |
| Arranque local sin dependencias de ejecución | `PORT=4174 npm run dev` y navegación local; puerto 4173 ocupado. | Correcto |
| Contexto del negocio | Registro y recuperación al recargar, incluida una URL parcial. | Correcto |
| Revisión humana guiada | Recorrido por las cinco áreas con estados pendiente, revisada y no aplica. | Correcto |
| Cobertura argumentada | Notas exigidas para revisadas sin hallazgos y motivo para no aplica. | Correcto |
| Hallazgos trazables | Creación, edición, cancelación de borrado y borrado confirmado; validación de campos en modelo y rechazo de evidencia vacía en navegador. | Correcto |
| Distinción entre hecho e interpretación | Campos y ayudas separados; ejemplo e informe con observación, hipótesis y recomendación. | Correcto |
| Priorización sin notas arbitrarias | Etiquetas cualitativas y esfuerzo justificado; sin nota global ni promesas de conversión. | Correcto |
| Informe honesto sobre su estado | Provisional con URL incompleta o borrador; «Revisión documentada» al completar los requisitos. | Correcto |
| Ejemplo autocontenido | Estudio Bruma ficticio, tres hallazgos y cinco áreas; navegación a contacto y FAQ desplegable. | Correcto |
| Conservación del trabajo | Contexto y borrador recuperados tras recarga en el mismo origen. | Correcto |
| Copia editable | Descarga e importación JSON con recuperación del hallazgo y el estado; archivo incompatible rechazado sin sustituir datos. | Correcto |
| Informe utilizable | Markdown descargado y leído; vista de impresión inspeccionada mediante emulación CSS. | Correcto dentro de los límites indicados |
| Recorrido completo | Desde contexto vacío hasta informe documentado; después, revisión del ejemplo. | Correcto |
| Verificación automatizada | `npm test`: 17/17; `npm run check`: correcto. | Correcto |
| Documentación y alcance local | README y STATUS actualizados; sin publicación ni despliegue. | Completado |

## Registro de verificación

Comprobaciones finales:

- `npm run dev`: el puerto predeterminado 4173 estaba ocupado.
- `PORT=4174 npm run dev`: aplicación servida y revisada en <http://127.0.0.1:4174>. El servidor de prueba se detuvo con `Ctrl+C` al terminar. El comando permite volver a iniciarlo; no se instala un servicio permanente.
- `npm test`: **17 pruebas aprobadas**, 14 de modelo y 3 de servidor. Incluyen validación, importación, estado de la revisión, informe y regresiones para conservar contexto incompleto, incluida una fecha con año fuera del rango de la interfaz.
- `npm run check`: comprobaciones de sintaxis aprobadas.
- Servidor: escucha local, páginas y tipos de contenido correctos con respuesta 200, archivos del repositorio fuera de la lista pública con 404, solicitudes POST con 405 y política CSP sin conexiones externas.

El recorrido de interfaz se comprobó en el navegador integrado Chromium con vistas de **1280 × 720** y **390 × 844**. Se completó una revisión desde el contexto vacío hasta «Revisión documentada», con un hallazgo nuevo y las cinco áreas justificadas, incluida una marcada como no aplicable con motivo.

Se comprobó que la URL parcial `https://` sobrevive a la recarga y mantiene el informe provisional; el borrador también se recupera. La evidencia vacía impide guardar mediante validación nativa. Guardar y editar un hallazgo dejan su área pendiente. Se probaron edición, cancelación de eliminación y eliminación confirmada.

Se descargaron archivos reales Markdown y JSON. Se leyó el informe y se reimportó la copia, recuperando el hallazgo y el estado documentado. Un archivo incompatible se rechazó sin sustituir la revisión. Después se cargó el ejemplo con tres hallazgos y cinco áreas y se comprobó la web ficticia, incluida la navegación a `#contacto` y la FAQ desplegable.

El informe y la revisión no mostraron desbordamiento horizontal en la vista móvil. La consola no registró errores ni advertencias. La emulación CSS de impresión mostró los tres hallazgos del ejemplo y ocultó navegación y acciones. **No se validó impresión física ni paginación final de PDF.**

Capturas locales de apoyo, excluidas del control de versiones en `test-results/`: `vista-local.png`, `informe-movil.png` e `informe-impresion.png`.

### Guion para repetir la revisión

Este guion permite repetir las comprobaciones después de futuros cambios; no representa trabajo necesario pendiente de esta entrega. Usar datos de prueba y exportar antes cualquier revisión propia que se quiera conservar.

1. Abrir la aplicación, elegir **Nueva revisión** y confirmar la sustitución si se solicita. Abrir el informe: debe aparecer como provisional e indicar el contexto y las áreas que faltan.
2. Completar el contexto del negocio con objetivo, público, acción y alcance. Recargar la página y comprobar que se conservan los valores.
3. Entrar en **Oferta**, iniciar un hallazgo y escribir una observación. Recargar y comprobar que el borrador se recupera. Volver al informe y comprobar que sigue provisional por ese borrador. Descartarlo y verificar que un editor vacío no añade un bloqueo.
4. Crear un hallazgo con evidencia, ubicación, recomendación, justificación, prioridad, esfuerzo, motivo del esfuerzo y forma de validación. Probar primero a guardarlo sin evidencia o sin justificación: debe impedir el guardado e identificar lo que falta. Completarlo y guardarlo.
5. Marcar el área como revisada. Editar y guardar el hallazgo y comprobar que el área vuelve a pendiente. Revisarla de nuevo. Probar también la eliminación con un hallazgo de prueba y conservar al menos uno válido.
6. Recorrer las otras cuatro áreas. Para una revisada sin hallazgos, comprobar que necesita una nota. Probar **No aplica** sin explicación y después con explicación. Un área con hallazgos no debe poder quedar como no aplicable.
7. Con contexto completo, áreas justificadas, hallazgos válidos y sin borrador con contenido, abrir el informe y comprobar **Revisión documentada**. Revisar que muestra evidencia, razonamiento, prioridades, esfuerzo y límites sin puntuaciones ni promesas de conversión.
8. Descargar el informe Markdown y examinar sus secciones. Revisar la vista de impresión: el informe debe ser legible sin los controles de edición. La comprobación final de impresión física o PDF sería una ampliación de la cobertura actual.
9. Descargar **Copia JSON**, iniciar otra revisión e importar la copia. Comprobar que se recuperan contexto, estados y hallazgos. Intentar importar un archivo que no sea JSON válido y comprobar que no sustituye los datos actuales.
10. Cargar el ejemplo, abrir **Estudio Bruma** y contrastar sus hallazgos con la web ficticia. Confirmar que ambos indican su carácter didáctico y que el contacto no envía mensajes.
11. Repetir una comprobación de lectura y navegación con ventana estrecha; revisar que no haya desbordamiento horizontal en revisión e informe.

Ampliación opcional no ejecutada en esta revisión: simular cuota de almacenamiento agotada, datos locales corruptos y edición desde dos pestañas; comprobar sus avisos y descargar la copia antes de recargar. También se puede ampliar la cobertura a Safari, Firefox, accesibilidad y paginación PDF.

## Decisiones de esta versión

- HTML, CSS y JavaScript con módulos; servidor local de Node.js y sin dependencias de ejecución.
- Una auditoría por navegador y origen, guardada en `localStorage`, con copia JSON e informe Markdown.
- Cinco áreas de revisión, sin puntuación global ni cálculo de impacto económico.
- Cada hallazgo relaciona evidencia, observación, recomendación y justificación. Las hipótesis se presentan como interpretaciones por validar.
- Prioridad y esfuerzo cualitativos; informe provisional cuando faltan datos o cobertura de revisión.
- Un borrador con contenido impide el estado «Revisión documentada»; un editor vacío no. Guardar o editar un hallazgo deja su área pendiente de revisión.
- La importación valida estructura y conserva datos semánticamente incompletos para corregirlos; el informe señala esas carencias.
- Los datos corruptos no se sobrescriben automáticamente y pueden descargarse como texto original. Un cambio desde otra pestaña detiene el guardado para evitar sobrescribirlo.
- Ejemplo didáctico completamente ficticio. El contacto de la demo no envía mensajes.

## Límites conocidos

- La calidad del informe depende del juicio humano, el alcance y las pruebas registradas. Completar el formulario no valida sus conclusiones.
- No hay rastreo, análisis automático, IA evaluadora ni verificación independiente de afirmaciones. No se demuestra causalidad comercial.
- La evidencia admite texto y referencias; no se adjuntan capturas ni documentos.
- No se evalúan de forma exhaustiva accesibilidad, rendimiento, SEO, seguridad ni cumplimiento legal.
- No hay backend de datos, autenticación, sincronización, historial o colaboración. El almacenamiento del navegador puede borrarse; exportar JSON es la copia recuperable.
- Cambiar el origen o el navegador cambia la copia local disponible. La importación sustituye la auditoría actual.
- Hasta 200 hallazgos por auditoría, archivos de importación de hasta 75 MB y límites por campo. La cuota de `localStorage` puede ser menor: un archivo importable no tiene garantizado el guardado automático.
- Las protecciones ante datos dañados y varias pestañas requieren intervención de la persona; no sustituyen una copia JSON ni proporcionan recuperación automática o sincronización.
- El esfuerzo es orientativo y depende de las personas, los materiales y los sistemas implicados; no constituye un presupuesto.
- La impresión depende del navegador. La demo no verifica ningún canal comercial real.
- Las pruebas automatizadas cubren el modelo y el servidor; la interfaz se comprobó en Chromium mediante el recorrido descrito. No hay una suite automatizada del DOM ni pruebas en Safari o Firefox, y no se realizó una auditoría exhaustiva de accesibilidad.
- No se simularon fallos reales de cuota, datos corruptos en `localStorage` ni conflictos entre pestañas en el navegador. Las protecciones están implementadas y la validación del esquema está probada; esto no equivale a verificar esos fallos de extremo a extremo.
- La vista de impresión se comprobó con emulación CSS y captura; no se verificaron impresión física ni paginación final de PDF.
- Sin publicación ni despliegue; no hay preparación para operar como servicio público.

## Próximos pasos posibles

1. Usar la herramienta en varias revisiones humanas y recoger dónde cuesta separar observaciones, hipótesis y recomendaciones.
2. Ajustar las ayudas y las etiquetas a partir de esas sesiones, sin convertirlas en una escala de puntuación.
3. Decidir si hacen falta múltiples auditorías, versiones o evidencias adjuntas; definir antes cómo se conservarán y compartirán los datos.
4. Diseñar una fase posterior de contraste con usuarios o datos del negocio cuando se quiera evaluar una hipótesis o el resultado de una mejora.

Estos pasos no forman parte de la primera versión ni autorizan un despliegue.
