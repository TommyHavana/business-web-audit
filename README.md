# business-web-audit

Herramienta local para hacer una **revisión comercial humana y guiada de una web**. Ayuda a registrar el objetivo del negocio, examinar cinco áreas y redactar mejoras con evidencia, justificación, prioridad y esfuerzo.

Está pensada también para aprender a argumentar una revisión. No asigna una nota global, no diagnostica una web automáticamente y no estima aumentos de conversiones.

## Arranque local

Requisitos: Node.js 22 o superior y un navegador moderno. No hay dependencias de ejecución ni hace falta instalar paquetes.

```sh
cd "/Users/nerea/Documents/Proyectos/git hub/busines web audit"
npm run dev
```

Abre <http://127.0.0.1:4173>. El servidor escucha solo en la interfaz local. Para detenerlo, pulsa `Ctrl+C` en la terminal.

Si el puerto está ocupado, usa otro:

```sh
PORT=4174 npm run dev
```

En ese caso, abre <http://127.0.0.1:4174>. Este fue el puerto utilizado para la revisión local de esta versión porque el 4173 estaba ocupado. Cada puerto tiene su propio almacenamiento en el navegador: exporta e importa una copia JSON si necesitas trasladar una auditoría entre ambos.

```sh
npm test
npm run check
```

Primera versión local terminada: 17 pruebas automatizadas aprobadas y recorrido completo comprobado en Chromium, con vistas de escritorio y móvil. Consulta [STATUS.md](STATUS.md) para conocer las comprobaciones y sus límites. Para usarla, inicia el servidor con uno de los comandos anteriores. No se ha publicado ni desplegado.

## Recorrido de una revisión

1. Define el negocio, su objetivo, el público, la acción esperada y el alcance de la revisión. Un objetivo útil sería «facilitar que responsables de pequeños alojamientos soliciten una conversación sobre sus fotografías». Identifica las páginas y condiciones que examinas.
2. Abre la web ficticia **Estudio Bruma**, o usa la auditoría de ejemplo para explorar un informe ya elaborado. Todo su contenido y sus hallazgos son inventados con fines didácticos; no representan una empresa real ni resultados medidos.
3. Revisa oferta, público, evidencias, objeciones y contacto. Cada área empieza pendiente. Márcala como revisada cuando hayas inspeccionado lo incluido en el alcance. Si no encuentras hallazgos, deja una nota de lo que comprobaste. Si no aplica, explica por qué.
4. Añade hallazgos. Separa lo observado de la posible interpretación y de la propuesta. Registra siempre evidencia localizable y justificación. El borrador de un hallazgo se conserva localmente, pero debes guardarlo como hallazgo para incorporarlo al informe. Guardar o editar un hallazgo vuelve a dejar su área pendiente para que revises la cobertura.
5. Asigna una prioridad y un esfuerzo cualitativos con un motivo. Añade cómo comprobarías la utilidad del cambio. Si faltan datos para decidir, indica qué necesitas validar.
6. Revisa el informe. Es provisional mientras falten contexto, áreas justificadas, campos obligatorios de los hallazgos o exista un borrador con contenido sin resolver. Un editor vacío no impide cerrar la revisión. El estado **«Revisión documentada»** indica que has completado los datos y la cobertura; no demuestra la calidad de la web ni el efecto comercial de las propuestas.
7. Exporta el informe en Markdown o imprímelo desde el navegador. Guarda también una copia JSON si quieres recuperar o trasladar los datos editables.

La importación JSON sustituye la auditoría local. Conserva una copia antes de importar otra o iniciar una auditoría nueva. El Markdown es un informe de lectura; el JSON es la copia que permite volver a editar.

## Cómo razonar un hallazgo

| Parte | Qué contiene | Ejemplo didáctico |
| --- | --- | --- |
| Observación | Un hecho comprobable en el alcance revisado, sin atribuir intenciones al visitante. | «El botón principal dice “Hablemos”; junto a él no se explica qué sucede después». |
| Evidencia y ubicación | El texto, comportamiento o ausencia comprobada y dónde reproducirla. Acota las ausencias a lo que revisaste. | «Portada, bloque inicial, botón “Hablemos”. Se revisaron ese bloque y el bloque de contacto». |
| Hipótesis | Una interpretación plausible todavía no demostrada. Es opcional. | «Una persona que aún compara proveedores podría dudar si pulsar inicia un presupuesto o una llamada». |
| Recomendación | Un cambio concreto ligado al objetivo y a la evidencia. | «Explicar junto al botón cuál es el siguiente paso real del contacto». |
| Justificación | Por qué esa propuesta responde a la observación y al objetivo del negocio. | «La acción esperada es solicitar información; describir el proceso permite decidir con más contexto». |
| Validación | Cómo comprobar la hipótesis o evaluar el cambio, sin dar el resultado por hecho. | «Pedir a personas del público previsto que expliquen qué esperan tras pulsar; comparar sus respuestas con el proceso real». |

Evita «la web no genera confianza»: mezcla interpretación y resultado. Describe primero qué hay o falta en una ubicación concreta. Una captura, una cita o una URL pueden apoyar un hecho, pero no prueban por sí solas lo que piensan los visitantes ni un efecto en las ventas.

## Criterios de las cinco áreas

Estos criterios son una guía de conversación y observación. No forman una escala validada ni una lista universal que todas las webs deban cumplir.

| Área | Qué examinar | Qué hace falta confirmar fuera de la web |
| --- | --- | --- |
| Oferta | Qué se ofrece, a quién, qué incluye, qué queda fuera y cuál es el siguiente paso. | Que la descripción coincide con el servicio que el negocio puede prestar. |
| Público | Si el lenguaje, los ejemplos y las situaciones permiten reconocer a quién se dirige la oferta. | Las necesidades, el vocabulario y los criterios de decisión del público real. |
| Evidencias | Si las afirmaciones cuentan con ejemplos, casos, testimonios u otras pruebas pertinentes y contextualizadas. | La autenticidad, el permiso de uso y el alcance de esas pruebas. Una afirmación repetida no es evidencia independiente. |
| Objeciones | Si se responden dudas relevantes sobre alcance, proceso, condiciones, plazos o encaje. | Qué dudas aparecen realmente en conversaciones comerciales; no asumir que todas las personas tienen las mismas. |
| Contacto | Si la acción principal es comprensible y accesible, y si se explica qué ocurre al realizarla. | Que el negocio atiende ese canal y cumple el proceso descrito. La demo local no verifica la entrega de mensajes. |

Una ausencia no exige siempre añadir contenido: puede ser deliberada o irrelevante para ese recorrido. Relaciona cada propuesta con el objetivo y el alcance registrados.

## Prioridad y esfuerzo

Las etiquetas sirven para ordenar una conversación de trabajo. No se suman, no generan porcentajes y no equivalen a impacto comercial demostrado.

| Prioridad | Cuándo usarla |
| --- | --- |
| Resolver primero | Hay un obstáculo concreto y comprobado para entender la oferta o completar la acción principal, dentro del alcance. Explica ese obstáculo. |
| Planificar | La mejora tiene un motivo claro, pero necesita coordinación, contenido o trabajo adicional y no bloquea el recorrido observado. |
| Validar antes | La propuesta depende de una suposición relevante o de información insuficiente. Indica qué evidencia permitiría decidir. |
| Mejora menor | Ajuste acotado de claridad o consistencia sin un bloqueo observado de la acción principal. |

El esfuerzo es una estimación relativa para este proyecto, no un presupuesto ni un plazo. **Pequeño** suele corresponder a una edición acotada con materiales disponibles; **Medio**, a preparar contenido o coordinar varios cambios; **Alto**, a modificar un proceso, integrar sistemas o depender de varias personas. Usa **Por estimar** si faltan datos y explica cuáles necesitas. Documenta siempre qué trabajo y dependencias fundamentan la etiqueta.

La prioridad no se deduce automáticamente del esfuerzo: un cambio fácil puede ser irrelevante y uno costoso puede resolver un problema necesario.

## Datos, copias y privacidad

- Se guarda una única auditoría en `localStorage`, incluido el borrador del formulario. Los datos permanecen en ese navegador y origen; no hay cuenta, servidor de datos ni sincronización.
- Cambiar de navegador, perfil, hostname o puerto puede mostrar otro almacenamiento. Borrar los datos del sitio elimina la copia local. El modo privado puede descartarla al cerrar la sesión.
- Exporta JSON para tener una copia independiente. Los informes y copias contienen el texto que hayas escrito; revisa su contenido antes de compartirlos. Evita introducir datos personales o confidenciales que no sean necesarios.
- La importación valida la estructura de la copia antes de sustituir la auditoría. Admite trabajo incompleto: una URL o una fecha pendiente se conserva para corregirla y aparece en las comprobaciones del informe. Esto no certifica la veracidad de los datos.
- Si la copia guardada está dañada, la aplicación evita sobrescribirla y ofrece descargar el texto original para intentar recuperarla. Si otra pestaña cambia la revisión, detiene el guardado automático de la pestaña anterior: exporta su copia JSON antes de recargar. Esta protección no permite editar en colaboración.
- La aplicación no sube evidencias ni visita automáticamente las URLs indicadas. La evidencia se registra como texto y referencias; esta versión no adjunta capturas ni archivos.
- La web ficticia es local y su contacto es demostrativo. No envía mensajes ni registra solicitudes reales.

## Estructura

```text
index.html            Entrada de la aplicación
src/app.js            Interfaz y recorrido de edición
src/styles.css        Presentación y estilos de impresión
src/model.js          Modelo, validación e informe
src/example.js        Auditoría ficticia de ejemplo
example/              Web ficticia Estudio Bruma
server.mjs            Servidor de desarrollo local
tests/model.test.js   Comprobaciones automatizadas del modelo
tests/server.test.js  Comprobaciones automatizadas del servidor
README.md             Uso, criterios y límites
STATUS.md             Estado y verificación
```

## Límites de la primera versión

La herramienta estructura el juicio humano. No rastrea sitios, no comprueba automáticamente hechos, accesibilidad, SEO, rendimiento o requisitos legales, y no sustituye esas revisiones. Tampoco incorpora analítica, experimentos, investigación con usuarios ni una evaluación exhaustiva del negocio.

Las conclusiones dependen del alcance y de la evidencia introducida. Una revisión de la portada no justifica afirmaciones sobre toda la web. Las hipótesis requieren contraste; las recomendaciones no garantizan ventas, contactos ni aumentos de conversión. Para conocer resultados comerciales hace falta un diseño de medición adecuado y tener en cuenta otros factores.

Es una aplicación de uso individual y local: no hay colaboración simultánea, historial de versiones, autenticación, almacenamiento remoto ni recuperación automática de copias perdidas. No está preparada como servicio público. La impresión y la paginación pueden variar según el navegador.

Cada auditoría admite hasta 200 hallazgos. La importación limita los archivos a 75 MB y los campos de texto tienen límites, habitualmente entre 300 y 8.000 caracteres según su función. El límite de importación no garantiza que el navegador pueda guardar una copia de ese tamaño: la capacidad de `localStorage` suele ser menor y depende del navegador. Ante un error de guardado, conserva una copia JSON antes de cerrar.

La comprobación de interfaz se realizó en Chromium; no cubre Safari, Firefox ni una auditoría exhaustiva de accesibilidad. Se inspeccionaron los estilos de impresión mediante emulación, pero no la impresión física ni la paginación final de un PDF. Las protecciones frente a cuota agotada, datos locales corruptos y cambios desde otra pestaña están implementadas; no se simularon esos fallos en navegador durante esta revisión.
