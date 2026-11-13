# business-web-audit

Herramienta local para hacer una **revisión comercial humana y guiada de una web**. Ayuda a registrar el objetivo del negocio, examinar cinco áreas y redactar mejoras con evidencia, justificación, prioridad y esfuerzo.

Está pensada también para aprender a argumentar una revisión. No asigna una nota global, no diagnostica una web automáticamente y no estima aumentos de conversiones.

## Arranque local

Necesitas Node.js 22 o superior con npm y un navegador moderno. Si aún no tienes el código, puedes descargarlo desde [el repositorio](https://github.com/TommyHavana/business-web-audit) o clonarlo:

```sh
git clone https://github.com/TommyHavana/business-web-audit.git
cd business-web-audit
```

Desde la carpeta que contiene `package.json`, ejecuta:

```sh
npm run dev
```

Abre <http://127.0.0.1:4173>. No hace falta instalar paquetes ni compilar. El servidor solo escucha en la interfaz local; para detenerlo, pulsa `Ctrl+C` en la terminal. Si necesitas otro puerto, establece la variable de entorno `PORT` antes del arranque (por ejemplo, `PORT=4174 npm run dev` en macOS o Linux) y abre la dirección que indique la terminal.

## Primer recorrido

**Para aprender con el ejemplo:** en la ficha del negocio, elige **Cargar ejemplo** y luego **Abrir web ficticia**. Estudio Bruma incluye tres hallazgos y la revisión de las cinco áreas. Localiza las frases citadas en la web antes de leer la hipótesis y la propuesta. El caso es inventado y no contiene resultados comerciales medidos.

**Para revisar tu propia web:** si quieres conservar el trabajo actual, descarga primero una **Copia JSON**. Cargar el ejemplo, iniciar una **Nueva revisión** o importar otra auditoría sustituye la que está abierta.

1. Define negocio, objetivo, público, acción esperada, fecha y alcance. Por ejemplo: «Que los comercios que preparan una apertura puedan consultar sobre un proyecto de identidad visual». Indica qué páginas y dispositivos revisas.
2. Examina oferta, público, evidencias, objeciones y contacto. Marca cada área como revisada cuando hayas inspeccionado el alcance previsto. Si no encuentras hallazgos, deja una nota de lo que comprobaste. Si no aplica, explica por qué.
3. Añade un hallazgo con la observación, la evidencia y su ubicación. Distingue lo que puedes comprobar de la hipótesis opcional. Describe la recomendación, justifica su prioridad y explica en qué basas el esfuerzo estimado. Indica cómo comprobarías el cambio.
4. Guarda el hallazgo. El borrador se conserva localmente, pero solo los hallazgos guardados se incorporan al informe. Guardar uno nuevo o modificado vuelve a dejar su área pendiente para que revises la cobertura.
5. Abre el informe. Si faltan contexto, notas de cobertura o campos necesarios, o queda un borrador con contenido, verás qué falta y podrás exportar un informe provisional. **Revisión documentada** significa que completaste los datos y las cinco áreas; no demuestra la calidad de la web ni el efecto de las propuestas.
6. Descarga el informe en Markdown o imprímelo desde el navegador. Guarda también una copia JSON para recuperar o trasladar la revisión editable.

## Comprobaciones locales

Desde la misma carpeta puedes ejecutar la comprobación de sintaxis y las pruebas del modelo y del servidor:

```sh
npm run check
npm test
```

Consulta [STATUS.md](STATUS.md) para el historial de verificación, la cobertura y un recorrido manual reproducible.

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
- Cambiar de navegador, perfil, nombre de host o puerto puede mostrar otro almacenamiento. Borrar los datos del sitio elimina la copia local. El modo privado puede descartarla al cerrar la sesión.
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

La cobertura de navegadores, impresión y fallos de almacenamiento se detalla en [STATUS.md](STATUS.md).
