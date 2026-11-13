import { AREAS, createAudit, createFinding } from './model.js';

/** Everything in this sample is fictional, including the business context. */
export function createExampleAudit() {
  const audit = createAudit();
  audit.isExample = true;
  audit.context = {
    name: 'Estudio Bruma · ejemplo ficticio',
    url: 'https://estudiobruma.example',
    goal: 'Facilitar consultas sobre proyectos de identidad visual para pequeños negocios de barrio. Objetivo supuesto para este ejercicio, pendiente de contrastar con un negocio real.',
    audience: 'Personas que gestionan cafeterías, tiendas o pequeños alojamientos y están preparando una apertura o una nueva etapa. Público supuesto, sin entrevistas ni datos de clientes.',
    action: 'Llegar al bloque de contacto y preparar una primera consulta sobre un proyecto.',
    scope: 'Página ficticia incluida en example/index.html: portada, servicios, muestra de proyectos, preguntas y contacto. Revisión del contenido y los enlaces internos. No se evalúan envío real, respuesta, analítica ni otras páginas.',
    traffic: 'No hay tráfico, ventas, analítica, testimonios verificables ni entrevistas. Es un ejemplo educativo local.',
    reviewer: 'Revisión de ejemplo',
    date: audit.context.date
  };
  audit.reviews = Object.fromEntries(AREAS.map(({ id }) => [id, { status: 'reviewed', note: '' }]));
  audit.reviews.audience.note = 'La sección «Para negocios con trato cercano» nombra cafeterías, tiendas y pequeños alojamientos, así como aperturas y nuevas etapas. Coincide con el público supuesto en el ejercicio. No hay evidencia suficiente para confirmar que esos negocios se identifiquen con el mensaje.';
  audit.reviews.objections.note = 'Las preguntas explican una conversación inicial y la preparación de una propuesta según el alcance. No se registra un hallazgo: sin consultas reales no sabemos qué dudas resultan decisivas. No se ha validado que estas respuestas sean suficientes.';
  audit.findings = [
    {
      ...createFinding('offer'), id: 'example-offer', title: 'Concretar qué se puede contratar',
      observation: 'La portada habla de una próxima etapa y el bloque de servicios enumera tres categorías, pero no describe entregables concretos ni su alcance.',
      evidence: 'Portada: «Hacemos espacio a tu próxima etapa.» Servicios: «Identidad. Espacios. Comunicación.» En esos dos bloques no se especifican entregables.',
      location: 'example/index.html · #inicio y #servicios',
      hypothesis: 'Una persona que busca identidad visual podría necesitar más detalle para decidir si su proyecto encaja. No se ha comprobado con usuarios.',
      recommendation: 'Describir la oferta de identidad visual con ejemplos de entregables y límites acordados con el negocio. Revisar después que la portada permita reconocer esa oferta.',
      reason: 'Planificar: la oferta es pertinente para el objetivo supuesto y el contacto está disponible. La observación permite proponer aclaraciones, pero no demuestra que el mensaje impida consultar.',
      priority: 'plan', effort: 'medium',
      effortReason: 'Requiere aclarar el servicio con la persona responsable y revisar dos bloques de contenido. Es una estimación relativa; no incluye rediseño ni nuevas fotografías.',
      validation: 'Primero confirmar con el negocio cuáles son los entregables. Después pedir a personas del público previsto que expliquen qué pueden contratar tras leer la página; registrar respuestas y dudas sin atribuir resultados comerciales.'
    },
    {
      ...createFinding('evidence'), id: 'example-evidence', title: 'Comprobar el respaldo de la experiencia declarada',
      observation: 'El bloque de proyectos incluye una cifra de experiencia. Las tres muestras visibles solo muestran nombre y categoría, sin explicar participación, alcance o fecha.',
      evidence: 'La sección dice «Más de 40 proyectos acompañados.» Las muestras se titulan «Café Lento», «Casa Oliva» y «Tienda Miga» y no incluyen una ficha del trabajo.',
      location: 'example/index.html · #proyectos',
      hypothesis: 'Las muestras sin contexto podrían dejar preguntas sobre la experiencia pertinente del estudio. La ausencia de respaldo visible no demuestra que la cifra sea falsa.',
      recommendation: 'Comprobar primero el origen de la cifra y qué cuenta como proyecto. Si hay documentación y permiso, añadir un caso que explique encargo, aportación y entregables. Corregir o retirar cualquier afirmación que el negocio no pueda sostener.',
      reason: 'Validar antes: no disponemos de documentación que permita confirmar la afirmación ni seleccionar un caso representativo. La prioridad es reunir esa evidencia.',
      priority: 'validate', effort: 'unknown',
      effortReason: 'La dedicación depende de los archivos disponibles y de los permisos de publicación. No hay base para estimar el trabajo antes de comprobarlos.',
      validation: 'Revisar el registro de proyectos y los permisos. Comprobar que cada afirmación publicada corresponde a documentación identificable y que el caso describe el trabajo sin inventar resultados.'
    },
    {
      ...createFinding('contact'), id: 'example-contact', title: 'Explicar qué preparar y qué sucede tras la consulta',
      observation: 'El enlace «Hablemos» lleva al bloque de contacto. Ese bloque muestra una dirección de ejemplo y una invitación general; no explica qué información conviene preparar ni cuál sería el siguiente paso de una consulta.',
      evidence: 'El bloque de contacto dice «Cuéntanos tu idea.» y «hola@estudiobruma.example». El aviso identifica el contacto como ficticio y sin envío.',
      location: 'example/index.html · enlace «Hablemos» y #contacto',
      hypothesis: 'Una persona interesada podría tener dudas sobre cómo formular la consulta. No se han observado abandonos ni se ha probado un envío real.',
      recommendation: 'Una vez confirmado el proceso del negocio, indicar brevemente qué información ayuda a la primera conversación y qué respuesta puede esperar. En una web real, comprobar también el canal de contacto y su confirmación.',
      reason: 'Planificar: explicar el paso siguiente apoya la acción principal del ejercicio. El enlace interno funciona y no se ha demostrado un bloqueo; el envío queda fuera del alcance por tratarse de una web ficticia.',
      priority: 'plan', effort: 'small',
      effortReason: 'La propuesta se limita a un texto breve si el proceso ya está definido. Si hay que cambiar el canal o acordar el proceso, debe revisarse esta estimación.',
      validation: 'Confirmar el proceso con el negocio y comprobar que el texto lo refleja. Pedir a una persona del público que indique cómo iniciaría la consulta y qué espera después. El ejercicio local no permite verificar entrega ni respuesta.'
    }
  ];
  return audit;
}
