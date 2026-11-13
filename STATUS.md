# Estado de business-web-audit

**Versión 0.1.0 · herramienta de uso local.** El flujo cubre el contexto de negocio, las cinco áreas de revisión, los hallazgos y el informe. Para iniciarla, consulta [Arranque local en el README](README.md#arranque-local).

## Revisión del 13 de noviembre de 2026

Se contrastaron las instrucciones de arranque y uso con los comandos de `package.json`, el servidor, el modelo, los controles de la interfaz y el ejemplo incluido. Se actualizaron las instrucciones para que puedan utilizarse desde cualquier copia del proyecto.

Se repitieron `npm run check` (sintaxis correcta) y `npm test` (**17/17 pruebas aprobadas**: 14 del modelo, 3 del servidor). No se repitió el recorrido manual en navegador.

## Verificación de la primera versión · 12 de noviembre de 2026

Los resultados de esta sección corresponden a la comprobación de esa fecha.

| Área | Qué se comprobó | Resultado entonces |
| --- | --- | --- |
| Sintaxis y pruebas | `npm run check` y `npm test`: 14 pruebas del modelo y 3 del servidor. | Sintaxis correcta; 17/17 aprobadas. |
| Servidor local | Páginas y módulos con sus tipos de contenido, archivos fuera de la lista permitida, solicitudes POST y política de conexiones del navegador. | Las páginas respondieron con 200, los archivos excluidos con 404 y las solicitudes POST con 405. La política incluye `connect-src 'none'`. |
| Contexto y borrador | Recarga con una URL parcial y con un hallazgo en borrador. | Los datos se recuperaron y el informe seguía provisional. |
| Hallazgos | Guardar sin evidencia; crear y modificar uno válido; cancelar y confirmar una eliminación. | La evidencia vacía impidió guardar. Tras guardar cambios, el área volvió a pendiente. |
| Cobertura | Cerrar las cinco áreas, incluidas una revisada sin hallazgos y otra no aplicable. | Se exigieron las notas correspondientes; con el contexto y la cobertura completos se obtuvo **Revisión documentada**. |
| Informe y copias | Descargar y leer Markdown, descargar JSON, restaurar el trabajo y probar un archivo incompatible. | Se recuperaron hallazgo y estado. El archivo incompatible no sustituyó los datos. |
| Ejemplo didáctico | Abrir Estudio Bruma, recorrer contacto y preguntas frecuentes y revisar su informe. | Tres hallazgos en cinco áreas revisadas; navegación y desplegable operativos. |
| Presentación | Chromium en vistas de escritorio (1280 × 720) y móvil (390 × 844), y emulación de estilos de impresión. | Sin desbordamiento horizontal observado en revisión e informe. En impresión aparecieron los tres hallazgos del ejemplo y se ocultaron los controles. |

El informe separó hechos observados, evidencia, posibles interpretaciones y acciones propuestas. Las etiquetas de prioridad y esfuerzo no calculan una nota ni pronostican conversiones. En el recorrido no se registraron errores o advertencias de consola.

## Guion para repetir la revisión

Inicia el servidor como indica el README, usa datos de prueba y exporta antes cualquier revisión propia que quieras conservar.

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

## Límites de verificación y de uso

- La suite automatizada cubre el modelo y el servidor. El recorrido de interfaz descrito fue manual; no hay pruebas automatizadas del DOM. No se realizaron pruebas en Safari o Firefox ni una evaluación exhaustiva de accesibilidad.
- Se inspeccionó la vista de impresión mediante emulación CSS. No se verificaron impresión física ni paginación final de PDF.
- No se simularon en navegador cuota agotada, datos locales corruptos ni conflictos entre pestañas. El código incluye protección ante esos casos, pero no proporciona copias de seguridad ni colaboración.
- La revisión funciona en un solo navegador y origen, sin cuentas, sincronización ni historial. Admite hasta 200 hallazgos; una copia de hasta 75 MB podría superar la cuota de almacenamiento del navegador. Conviene exportar los datos editables en JSON.
- La evidencia se registra como texto y ubicación. La herramienta no contrasta afirmaciones ni demuestra causalidad comercial. Tampoco hace una evaluación técnica, legal o de accesibilidad del sitio. El contacto de la web ficticia no envía mensajes.
