/* ═══════════════════════════════════════════════════════════════════════════════
   TUVETIA · contenido de publicación — mes 1 (7 sep – 4 oct 2026)

   Cada fila del arco de estrategia-linkedin.md es un item de acá. El hub lo
   convierte en una tarjeta con su día, cuenta, hora, botón de copiar y PNG.

   Reglas que este archivo obedece (CLAUDE.md + marca/no-decimos.md):
   · Todo cierra en WhatsApp. Nunca en la landing ni en "link en bio" genérico.
   · Athos escucha, escribe, sugiere y cita. Nunca diagnostica, nunca firma.
   · Cero métricas o clínicas inventadas. Lo que depende de la realidad va en
     [corchetes] y se rellena antes de publicar, o la pieza no sale.
   · Tuteo colombiano. Sin em-dashes en LinkedIn. Primera línea corta y sola.
   ═══════════════════════════════════════════════════════════════════════════════ */

(function () {
  const B = window.BRAND;
  const WA = B.funnel.linkComment;

  /* ── Visuales ─────────────────────────────────────────────────────────────
     Tema claro, como el resto del sistema: el blanco es el centro y el menta
     es acción. El grafito sólo aparece en la card que habla de Athos oyendo. */

  const cTesis = ctx => CK.cardStatement(ctx, {
    eyebrow: 'Tuvetia',
    title: 'Ningún veterinario debería volver a escribir una ficha.',
    body: 'La ficha es obligatoria y debe serlo: es la historia del paciente. Escribirla a mano en 2026, no.',
    size: 104,
  });

  const cEscucha = ctx => CK.cardDimPunch(ctx, {
    eyebrow: 'Tuvetia · Athos',
    dim: 'Athos escucha la consulta y escribe la ficha mientras atiendes.',
    punch: 'Tú la revisas y la firmas.',
    size: 76,
  });

  /* La única card sobre fondo grafito: el grafito es de Athos. */
  const cAthos = ctx => {
    CK.use(B, 'dark');
    CK.cardDimPunch(ctx, {
      eyebrow: 'Tuvetia · Athos',
      dim: 'Athos no diagnostica. No firma. No manda nada sin que lo apruebes.',
      punch: 'La medicina la sigues haciendo tú.',
      size: 68,
    });
    CK.use(B, 'light');
  };

  const cDiez = ctx => CK.cardList(ctx, {
    eyebrow: 'Tuvetia · Bogotá',
    title: 'Buscamos los primeros 10 veterinarios.',
    size: 90,
    items: [
      'Todavía no lo usa ninguna clínica',
      'Lo montamos contigo, sobre tu forma de trabajar',
      'Nos dices qué falta y lo construimos',
      'Si no te sirve, nos lo dices y ya',
    ],
  });

  const regla = (n, titulo, cuerpo) => ctx => CK.cardNumbered(ctx, {
    eyebrow: 'Tuvetia · Cómo funciona',
    label: 'paso',
    number: n,
    title: titulo,
    body: cuerpo,
  });

  const cTiempo = ctx => CK.cardDimPunch(ctx, {
    eyebrow: 'Tuvetia · El día del vet',
    dim: 'Estudiaste anatomía, farmacología y cirugía.',
    punch: 'Y hoy pasas horas haciendo mecanografía.',
    size: 74,
  });

  /* ── Cuentas ──────────────────────────────────────────────────────────── */

  const platforms = {
    lu: { name: 'LinkedIn · Luciano', short: 'LI · Luciano', style: 'solid' },
    pag: { name: 'LinkedIn · página Tuvetia', short: 'LI · página', style: 'outline' },
    dav: { name: 'LinkedIn · David', short: 'LI · David', style: 'soft' },
    ig: { name: 'Instagram · Tuvetia', short: 'Instagram', style: 'quiet' },
  };

  /* Hora Colombia (COT). Luciano publica desde Ginebra: COT + 7 = CEST.
     07:30 COT = 14:30 en Ginebra · 12:30 COT = 19:30 en Ginebra. */
  const times = {
    lu: { DEFAULT: '07:30', MIÉ: '12:30' },
    pag: { DEFAULT: '15:00' },
    dav: { DEFAULT: '08:00' },
    ig: { DEFAULT: '12:30', SÁB: '11:00' },
  };

  window.CONTENT = {
    id: 'mes-1',

    /* El chrome del hub en español, igual que el contenido. */
    ui: {
      published: 'publicado',
      copy: 'copiar',
      copied: 'copiado',
      all: 'Todo',
      progress: (n, total) => `${n} / ${total} publicadas`,
    },

    period: '7 sep – 4 oct 2026',
    eyebrow: 'Publicación · 7 sep – 4 oct 2026',
    title: 'El mes 1, listo para publicar.',
    intro: 'Cada pieza está escrita: <strong>copiar → pegar → publicar</strong>. Los visuales se bajan en PNG. Marca cada una cuando la publiques, el checklist se guarda solo en este navegador.',

    howto: [
      { title: 'LinkedIn', text: 'El link del WhatsApp SIEMPRE va en el primer comentario, nunca en el cuerpo del post. Video nativo, subido directo, nunca un link de YouTube.' },
      { title: 'Los videos', text: 'Se cortan del demo de Remotion y de los clips de <span class="mono">captura/clips-raw/</span>. Subtítulos quemados siempre: se ve sin audio.' },
      { title: 'Instagram', text: 'Los mismos videos en 9:16. Las cards se bajan de <span class="mono">cards.html</span>. El WhatsApp va en la bio.' },
      { title: '[Corchetes]', text: 'Todo lo que está [entre corchetes] se llena con la realidad de esa semana antes de publicar. Si el dato no es real, la pieza no sale.' },
    ],

    platforms,
    times,

    scheduleTitle: 'El horario fijo · hora Colombia · igual todas las semanas',
    schedule: [
      { when: 'LUN 07:30', what: 'Luciano — la pieza fuerte, con video' },
      { when: 'MAR 08:00', what: 'David — campo, desde Bogotá' },
      { when: 'MIÉ 12:30', what: 'Luciano — video de funcionalidad' },
      { when: 'MIÉ 15:00', what: 'Página Tuvetia — repost del lunes' },
      { when: 'VIE 07:30', what: 'Luciano — tesis o construcción' },
      { when: 'VIE 12:30', what: 'Instagram — card + reels de la semana' },
    ],
    scheduleNote: '<strong>Por qué estas horas:</strong> el veterinario colombiano revisa el teléfono antes de abrir consultorio y en el hueco de mediodía. 07:30 COT son las 14:30 en Ginebra, así que Luciano publica a media tarde y alcanza a responder toda la primera hora, que es la que decide el alcance.<br><br><strong>Qué publica cada cuenta:</strong> el motor es <strong>la cuenta personal de Luciano</strong>. Nadie sigue a una empresa de software veterinario con cero clientes; sí siguen a alguien construyendo algo a la vista. La página sólo repostea el lunes con una línea propia. David publica lo que ve en las clínicas de Bogotá, que es lo que Luciano no puede ver desde Ginebra.<br><br><strong>Los tres videos de la semana</strong> salen del mismo material: el demo de Remotion y los clips ya capturados. No se graba de cero cada vez.',

    footer: 'Rutina diaria (20–30 min): responder todo · comentar con sustancia en 5–10 posts de la lista objetivo · quedarse la primera hora de cada post.<br>Viernes, 15 min: qué funcionó, qué no, qué se repite.<br>Estrategia completa: <span class="mono">publicacion/estrategia-linkedin.md</span> · Líneas rojas: <span class="mono">marca/no-decimos.md</span>',

    weeks: [

      /* ── SEMANA 0 · SETUP ──────────────────────────────────────────────── */
      {
        id: 's0',
        nav: 'Setup',
        label: 'Semana 0 · 3–6 sep',
        title: 'Setup. Todavía no se publica nada.',
        sub: 'Los perfiles quedan impecables antes del primer post. Todo lo de abajo es copiar y pegar en cada perfil. Y falta lo importante: el link definitivo de WhatsApp, que va en <span class="mono">publicacion/marca.config.js</span> y desde ahí entra en todas las piezas.',
        items: [
          {
            day: 'SETUP', platform: 'lu', title: 'LinkedIn Luciano — titular y Acerca de',
            note: 'El titular aparece debajo de cada comentario que dejas durante todo el mes. Es el espacio que más rinde de tu perfil. El Acerca de va en primera persona: tu voz, no la de una empresa.',
            blocks: [
              { lbl: 'Titular', text: 'Construyendo Tuvetia — software clínico para veterinarios. Athos escucha la consulta y escribe la ficha; el vet firma. Buscando los primeros 10 vets en Colombia.' },
              {
                lbl: 'Acerca de', text: `Un veterinario estudia años de anatomía, farmacología y cirugía. Y buena parte de su día se le va escribiendo.

Estoy construyendo Tuvetia para cambiar eso. Athos, la inteligencia del sistema, escucha la consulta y escribe la ficha mientras el vet atiende. El vet la revisa, la corrige si quiere, y la firma. La medicina la sigue haciendo el veterinario.

Athos también responde el WhatsApp de los dueños, siempre con la aprobación del vet antes de enviar nada, y piensa los casos citando literatura real.

Lo que hace y lo que no:
- escucha, escribe, sugiere y cita
- nunca diagnostica y nunca firma
- no manda nada sin que el vet lo apruebe

Estado real: todavía no lo usa ninguna clínica. Estoy buscando los primeros 10 veterinarios en Colombia que quieran montarlo conmigo. Construyo desde Ginebra, con David en Bogotá en la calle.

Si eres veterinario, escríbeme por WhatsApp y hablamos.` },
            ],
          },
          {
            day: 'SETUP', platform: 'pag', title: 'Página Tuvetia — eslogan y Acerca de',
            note: 'Logo: el wordmark de <span class="mono">marca/logo/wordmark.svg</span>. Botón de la página configurado al WhatsApp, no a la landing.',
            blocks: [
              { lbl: 'Eslogan', text: 'Ningún veterinario debería volver a escribir una ficha.' },
              {
                lbl: 'Acerca de', text: `Tuvetia es software clínico para veterinarios en Colombia.

Athos, su inteligencia, escucha la consulta y escribe la ficha mientras el veterinario atiende. El veterinario la revisa y la firma. Athos también redacta las respuestas de WhatsApp a los dueños, que no salen hasta que el vet las aprueba, y piensa los casos citando literatura real.

Athos escucha, escribe, sugiere y cita. No diagnostica y no firma. Esa línea no se mueve.

Privacidad: el audio se destruye a los 7 días, cada veterinario tiene su espacio aislado, y todo se maneja bajo la Ley 1581.

Estamos empezando y buscamos los primeros 10 veterinarios que quieran montarlo con nosotros. Escríbenos por WhatsApp.` },
            ],
          },
          {
            day: 'SETUP', platform: 'dav', title: 'LinkedIn David — titular y Acerca de',
            note: 'Su ángulo es el campo, no el producto. Los [corchetes] los llena él con lo suyo.',
            blocks: [
              { lbl: 'Titular', text: 'En las clínicas de Bogotá, mostrando Tuvetia a veterinarios. Buscamos los primeros 10.' },
              {
                lbl: 'Acerca de', text: `Me la paso en clínicas veterinarias de Bogotá.

Estoy con Tuvetia, un software clínico donde la IA escucha la consulta y escribe la ficha para que el vet solo la revise y la firme. Mi trabajo es simple: mostrárselo a veterinarios de verdad y escuchar qué les falta.

Empezó con Athos, mi bulldog francés. [Una o dos líneas contando la historia real: la castración, la incontinencia, las horas buscando respuestas.] De ahí salió la idea, y por eso la IA del producto se llama como él.

Todavía no lo usa ninguna clínica. Estoy buscando las primeras 10 que quieran probarlo. Si eres veterinario en Bogotá y quieres verlo, escríbeme.` },
            ],
          },
          {
            day: 'SETUP', platform: 'ig', title: 'Instagram — bio',
            blocks: [
              { lbl: 'Bio', text: `Software clínico para veterinarios 🇨🇴
Athos escucha la consulta y escribe la ficha. Tú firmas.
Buscamos los primeros 10 vets 👇` },
            ],
          },
        ],
      },

      /* ── SEMANA 1 · ESTO EXISTE ────────────────────────────────────────── */
      {
        id: 's1',
        nav: 'Sem 1',
        label: 'Semana 1 · 7–13 sep',
        title: '"Esto existe."',
        sub: 'El lunes es la pieza más importante del mes: el demo completo. Publícalo con calma y quédate la primera hora respondiendo todo.',
        items: [
          {
            day: 'LUN 7', platform: 'lu', title: 'El demo de 80 segundos — post de lanzamiento',
            note: '<strong>La pieza fundacional.</strong> Video: <span class="mono">remotion/out/demo-saas.mp4</span>, subido nativo. El link del WhatsApp va en el primer comentario. Primera hora: responder todos los comentarios.',
            canvases: [{ id: 's1-tesis', label: 'Card de apoyo (IG)', draw: cTesis }],
            blocks: [
              {
                lbl: 'Post', text: `Llevo [N] meses construyendo esto y hoy lo muestro por primera vez.

Es Tuvetia: software clínico para veterinarios. Lo que ves en el video es la app real corriendo, no un mockup.

La idea cabe en una frase. Un veterinario estudia años de anatomía, farmacología y cirugía, y después se le va media vida escribiendo. La ficha clínica es obligatoria y debe serlo, porque es la historia del paciente. Lo que no debería ser obligatorio es escribirla a mano en 2026.

Athos, la inteligencia del sistema, escucha la consulta y escribe la ficha mientras el vet atiende. El vet la revisa, la corrige si hace falta, y la firma.

Lo que Athos hace: escucha, escribe, sugiere y cita.
Lo que Athos nunca hace: diagnosticar y firmar. Eso es del veterinario y ahí no nos metemos.

Ahora la parte incómoda: todavía no lo usa ninguna clínica. Cero. Estoy buscando los primeros 10 veterinarios en Colombia que quieran montarlo conmigo, decirme qué les falta y verlo cambiar según lo que digan.

Si eres veterinario, el WhatsApp está en el primer comentario. Contesto yo.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'LUN 7', platform: 'pag', title: 'Página — repost del demo',
            note: 'Repost del post de Luciano con esta línea de intro.',
            blocks: [
              { lbl: 'Intro del repost', text: 'Así se ve una consulta cuando el veterinario no tiene que escribir la ficha. Nuestro fundador mostrando Tuvetia por primera vez, con todo y la parte incómoda.' },
            ],
          },
          {
            day: 'MAR 8', platform: 'dav', title: 'David se presenta — la historia de Athos',
            note: 'David lo escribe con SU realidad. Los [corchetes] son suyos y si el detalle no es real, no se publica. Luciano lo revisa el lunes: veta o aprueba, no reescribe.',
            blocks: [
              {
                lbl: 'Post (David)', text: `Todo esto empezó por mi perro.

Athos es mi bulldog francés. [Después de la castración empezó con incontinencia / el detalle real de lo que pasó.] Me pasé [semanas / el detalle real] leyendo, preguntando y tratando de entender qué le estaba pasando.

Lo que más me sorprendió no fue lo difícil que era encontrar respuestas. Fue ver todo el tiempo que el veterinario gastaba en cosas que no eran mi perro: escribir, buscar en un sistema lento, volver a escribir lo mismo.

Ahora me la paso en clínicas de Bogotá mostrándole a veterinarios un software donde eso no pasa. La IA se llama Athos, por él.

Todavía no lo usa nadie. Estamos buscando los primeros 10 veterinarios. Si eres vet en Bogotá y quieres que te lo muestre en tu consultorio, escríbeme.` },
            ],
          },
          {
            day: 'MIÉ 9', platform: 'lu', title: 'Video 1 — la ficha se escribe sola',
            note: 'Video de 30–45 s cortado del clip <span class="mono">04-cockpit-transcribiendo.webm</span> con zoom a las notas apareciendo. Subtítulos quemados.',
            canvases: [{ id: 's1-escucha', label: 'Card (IG)', draw: cEscucha }],
            blocks: [
              {
                lbl: 'Post', text: `Esto es una consulta donde el veterinario no escribe nada.

En el video, Athos está escuchando. A la derecha se va armando la nota sola, mientras el vet atiende al paciente y habla con el dueño como hablaría siempre.

Al final la ficha está lista. El vet la lee, corrige lo que quiera y firma.

Tres cosas que importan de cómo está hecho:

El audio se destruye a los 7 días. No se guarda "por si acaso".
Cada veterinario tiene su espacio aislado, y todo va bajo la Ley 1581.
Athos escribe, pero no firma. La ficha no existe hasta que un veterinario con licencia dice que existe.

La parte que más me costó construir no fue la transcripción. Fue [el detalle técnico real de esta semana].

Todavía no lo usa ninguna clínica y estoy buscando las primeras 10. WhatsApp en el primer comentario.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'VIE 11', platform: 'lu', title: 'La tesis — por qué ningún vet debería escribir una ficha',
            note: 'Puede ir con video a cámara (guion ya escrito en <span class="mono">contenido/2026-07/002-tesis-ficha/</span>) o solo texto. El texto de abajo funciona sin video.',
            canvases: [{ id: 's1-tiempo', label: 'Card (IG)', draw: cTiempo }],
            blocks: [
              {
                lbl: 'Post', text: `Ningún veterinario debería volver a escribir una ficha.

No es una exageración para llamar la atención. Es la tesis sobre la que estamos construyendo Tuvetia, y quiero explicar por qué.

La ficha clínica es obligatoria y tiene que serlo. Es la historia del paciente, es la defensa del profesional, y es lo que permite que otro colega entienda qué pasó. Nadie está proponiendo quitarla.

Lo que sí propongo es que escribirla deje de ser trabajo del veterinario.

Piénsalo por el lado del costo. Cada ficha son unos minutos. Multiplícalos por las consultas de un día, por los días de un año, por los años de una carrera. Lo que sale no es un número de productividad: es tiempo de un profesional formado, gastado en mecanografía.

Y ese tiempo sale de algún lado. Sale de la consulta siguiente, que se acorta. Sale de la explicación al dueño, que se recorta. O sale de la noche, cuando el vet cierra y se queda poniendo al día lo del día.

La tecnología para que eso no pase ya existe. Lo que faltaba era que alguien la pusiera donde el veterinario trabaja, con las líneas claras: la máquina escucha y escribe, el veterinario decide y firma.

Eso es Tuvetia. Todavía no lo usa nadie. Busco los primeros 10.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'VIE 11', platform: 'ig', title: 'IG — apertura del grid + reels de la semana',
            note: 'Sube las dos cards y los tres videos de la semana en 9:16. El grid abre con la card de la tesis.',
            canvases: [
              { id: 'ig-s1-tesis', label: 'Card tesis', draw: cTesis },
              { id: 'ig-s1-escucha', label: 'Card Athos', draw: cEscucha },
            ],
            blocks: [
              {
                lbl: 'Caption (card tesis)', text: `Ningún veterinario debería volver a escribir una ficha.

La ficha es obligatoria y debe serlo: es la historia del paciente. Escribirla a mano en 2026, no.

Athos escucha la consulta y la escribe mientras atiendes. Tú la revisas y la firmas.

Buscamos los primeros 10 veterinarios. El WhatsApp está en la bio.

#veterinaria #veterinariacolombia #medicinaveterinaria #vetlife #softwareveterinario #historiaclinica` },
            ],
          },
        ],
      },

      /* ── SEMANA 2 · EN LA CONSULTA ─────────────────────────────────────── */
      {
        id: 's2',
        nav: 'Sem 2',
        label: 'Semana 2 · 14–20 sep',
        title: 'Lo que hace dentro de la consulta.',
        sub: 'Dos funcionalidades y el corpus. Es la semana donde el producto tiene que verse útil, no impresionante.',
        items: [
          {
            day: 'LUN 14', platform: 'lu', title: 'Video 2 — la alerta de alergia',
            note: 'Video del clip <span class="mono">05-alerta-alergia.webm</span>. Es el mejor argumento del producto: no es que escriba, es que se acuerda de algo que se puede escapar.',
            blocks: [
              {
                lbl: 'Post', text: `El momento del video no es que Athos escriba. Es que se acuerde.

El vet está en consulta, dicta lo que va a formular, y salta la alerta: ese paciente tiene una alergia registrada hace [N] meses, en una consulta que atendió otra persona.

No pasa nada dramático. El vet lo ve, cambia el fármaco, sigue. Diez segundos.

Pero eso es exactamente lo que se pierde cuando la información está regada entre una historia clínica que nadie relee, la memoria de quien atendió ese día, y un sistema que no avisa nada.

Quiero ser preciso con lo que hace y lo que no, porque en medicina la diferencia importa:

Athos no decide el tratamiento. Muestra lo que ya está en la historia del paciente y avisa cuando algo que dijiste choca con eso.
La decisión es del veterinario, siempre. Athos no diagnostica y no firma.

Es asistencia de memoria, no de criterio. El criterio ya lo tiene el vet, y es justo lo que no queremos tocar.

Todavía no lo usa ninguna clínica. Busco 10. WhatsApp en el primer comentario.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'MAR 15', platform: 'dav', title: 'David — la primera reacción de un vet',
            note: 'David escribe lo que pasó de verdad en una clínica esta semana. Sin nombre de la clínica ni del vet salvo que den permiso. Si esta semana no visitó a nadie, no se publica esto: se cambia por otro ángulo real.',
            blocks: [
              {
                lbl: 'Post (David)', text: `Le mostré Tuvetia a [una veterinaria / un veterinario] en [zona de Bogotá] y me quedé callado a ver qué decía.

Lo primero que hizo no fue mirar la ficha escribiéndose. Fue [lo que realmente hizo primero: buscar el botón de X, preguntar por Y].

Y lo primero que preguntó fue: [la pregunta real, textual].

Le contesté [la respuesta real que le diste].

Anoté dos cosas que no habíamos pensado:
[lo que pidió que no estaba]
[la objeción real que puso]

Las dos van derecho a Luciano. Así es como se está armando esto: no lo que creemos en una reunión, sino lo que dice alguien que lleva [N] años en consulta.

Si eres veterinario en Bogotá y quieres que te lo muestre, escríbeme. Voy a tu consultorio.` },
            ],
          },
          {
            day: 'MIÉ 16', platform: 'lu', title: 'Video 3 — el SOAP y el botón de firmar',
            note: 'Video del clip <span class="mono">06-generar-soap.webm</span>. Termina en el botón de aprobar, con zoom.',
            canvases: [{ id: 's2-athos', label: 'Card grafito (IG)', draw: cAthos }],
            blocks: [
              {
                lbl: 'Post', text: `El botón que más pienso de todo el producto es el de firmar.

En el video, Athos convierte la consulta en una nota SOAP: subjetivo, objetivo, análisis, plan. Estructurada, con lo que se dijo, lista para revisar.

Y ahí se detiene.

La nota no existe hasta que el veterinario la lee y la firma. No hay guardado automático, no hay "si no haces nada se aprueba sola", no hay modo rápido que se salte ese paso.

Me lo han cuestionado dos veces con el mismo argumento: si la IA la escribe bien, el paso de aprobación es fricción, y la fricción es mala UX.

No estoy de acuerdo, y no por diseño sino por lo que es una ficha clínica. Esa nota lleva la firma de un profesional con licencia y responde por ella. Automatizar la firma no es quitar fricción: es mover la responsabilidad a un lugar donde no puede estar.

Así que Athos escribe todo lo que puede y para en seco justo antes de la única parte que no le toca.

Todavía no lo usa ninguna clínica. Busco los primeros 10. WhatsApp abajo.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'MIÉ 16', platform: 'pag', title: 'Página — repost del lunes',
            blocks: [
              { lbl: 'Intro del repost', text: 'Una alergia registrada hace meses, en una consulta que atendió otra persona. Eso es lo que se pierde cuando la información está regada.' },
            ],
          },
          {
            day: 'VIE 18', platform: 'lu', title: 'El corpus — qué significa "lo piensa contigo"',
            note: 'Puede ir sin video o con el clip del cockpit citando. Guion relacionado ya escrito en <span class="mono">contenido/2026-07/006-corpus-61540/</span>.',
            blocks: [
              {
                lbl: 'Post', text: `Athos tiene 61.540 papers de veterinaria adentro. Quiero explicar para qué, porque no es para lo que suena.

No es para que Athos sepa más medicina que el veterinario. Eso ni pasa ni es el punto.

Es para el caso raro. Ese que ves una vez cada dos años, que te deja pensando, y donde lo que quisieras es un colega al lado para contrastar. Athos hace ese papel: le cuentas el caso, te trae lo que dice la literatura, y te dice de dónde lo sacó.

Esa última parte es la que importa. Cada cosa que dice viene con su fuente, y puedes ir a leerla. Sin fuente no hay respuesta.

Una IA que da una respuesta segura sin poder mostrar de dónde salió no sirve en clínica. En una consulta eso no es un error simpático: es algo que alguien puede repetirle a un dueño.

Por eso Athos cita y no afirma. Piensa contigo, no por ti. Y lo que se hace con eso lo decide el veterinario.

Estamos empezando y busco los primeros 10 vets. WhatsApp en el primer comentario.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'VIE 18', platform: 'ig', title: 'IG — card de Athos + reels',
            canvases: [{ id: 'ig-s2-athos', label: 'Card grafito', draw: cAthos }],
            blocks: [
              {
                lbl: 'Caption', text: `Athos escucha, escribe, sugiere y cita.

No diagnostica. No firma. No manda nada sin que lo apruebes.

La medicina la sigues haciendo tú. Nosotros te quitamos la mecanografía.

Buscamos los primeros 10 veterinarios. WhatsApp en la bio.

#veterinaria #veterinariacolombia #medicinaveterinaria #vetlife #softwareveterinario` },
            ],
          },
        ],
      },

      /* ── SEMANA 3 · FUERA DE LA CONSULTA ───────────────────────────────── */
      {
        id: 's3',
        nav: 'Sem 3',
        label: 'Semana 3 · 21–27 sep',
        title: 'Lo que hace fuera de la consulta.',
        sub: 'El WhatsApp de los dueños y el día completo. Acá se ve que esto no es un dictáfono sino el sistema donde vive la clínica.',
        items: [
          {
            day: 'LUN 21', platform: 'lu', title: 'Video 4 — WhatsApp con freno',
            note: 'Video del clip <span class="mono">09-athos-whatsapp.webm</span>. La toma clave es el borrador detenido esperando aprobación. Guion relacionado: <span class="mono">contenido/2026-07/003-whatsapp-freno/</span>.',
            blocks: [
              {
                lbl: 'Post', text: `Le construí un freno a la parte del producto que más ganas tenía de automatizar.

Contexto: el WhatsApp de una clínica veterinaria es un segundo turno. Dueños preguntando cómo sigue el paciente, si puede comer, si eso que le salió es normal. Preguntas legítimas, casi siempre de noche.

Athos las lee y redacta la respuesta con lo que hay en la historia del paciente.

Y ahí se queda quieto. El mensaje no sale.

Se queda en borrador hasta que el veterinario lo lee y le da enviar. Si el vet lo cambia, sale el cambio. Si no lo aprueba, no sale nada.

Sé que un asistente que responde solo suena mejor en una demo. Pero eso es información clínica sobre un paciente concreto, saliendo con el nombre de una clínica. Si eso sale mal, no es un mal correo: es un dueño tomando una decisión con su animal por algo que ningún profesional revisó.

Así que la regla quedó igual que con la ficha. Athos redacta todo. Enviar es del veterinario.

Es más lento. Es correcto.

Todavía no lo usa ninguna clínica. Busco 10. WhatsApp en el primer comentario.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'MAR 22', platform: 'dav', title: 'David — una objeción real',
            note: 'La objeción tiene que ser real y de esta semana. Contestarla con honestidad, incluida la parte donde tienen razón, es lo que hace que el post funcione.',
            blocks: [
              {
                lbl: 'Post (David)', text: `Hoy me dijeron que no, y creo que con razón.

[Un veterinario / una veterinaria] en [zona] me escuchó todo y me dijo: [la objeción real, textual].

Lo primero que pensé fue defenderme. Después caí en que tenía razón en [la parte donde efectivamente la tiene].

Lo que le contesté: [la respuesta honesta que diste, incluido lo que no puedes prometer].

Se quedó con [lo que pasó al final: quedó de pensarlo, te dio un contacto, te dijo que volvieras en X].

Escribo esto porque es fácil contar solo las visitas donde dicen que sí. Todavía no tenemos ninguna clínica usando Tuvetia, y cada no que recibo me dice algo que no sabía.

Si eres veterinario y crees que esto no sirve, escríbeme. Esa conversación me sirve más que un cumplido.` },
            ],
          },
          {
            day: 'MIÉ 23', platform: 'lu', title: 'Video 5 — el día del vet, de la cita a la consulta',
            note: 'Video con los clips <span class="mono">02-agenda</span> + <span class="mono">03-abrir-consulta</span> + <span class="mono">10-flash-agenda</span>. Enseña el flujo, no las pantallas.',
            blocks: [
              {
                lbl: 'Post', text: `Una cosa que aprendí construyendo esto: el software no se pierde en las funciones, se pierde en las costuras.

Cada paso del día de un veterinario ya tiene su herramienta. La agenda funciona. La historia funciona. La facturación funciona.

Lo que no funciona es el pegamento entre ellas. Volver a escribir el nombre del paciente. Abrir otra pestaña para ver qué se le hizo la vez pasada. Copiar a mano en la factura lo que acabas de recetar.

En el video no hay ninguna función espectacular. Es el paso de la cita en la agenda a la consulta abierta, con la historia del paciente ya cargada, sin escribir nada dos veces.

Eso, sumado a lo largo de un día de [N] consultas, es donde de verdad se va el tiempo. No en una tarea grande y visible, sino en cincuenta pequeñas que nadie cronometra.

Construir esto es menos vistoso que la IA. Y probablemente sea lo que más se nota cuando lo usas todos los días.

Busco los primeros 10 veterinarios. WhatsApp en el primer comentario.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'MIÉ 23', platform: 'pag', title: 'Página — repost del lunes',
            blocks: [
              { lbl: 'Intro del repost', text: 'Athos redacta la respuesta al dueño. Enviarla sigue siendo del veterinario. Por qué le pusimos ese freno a propósito.' },
            ],
          },
          {
            day: 'VIE 25', platform: 'lu', title: 'Construcción — una decisión de esta semana',
            note: 'Se llena con lo que pasó de verdad esta semana. Si no hubo una decisión interesante, se cambia por un post de producto. No se inventa.',
            blocks: [
              {
                lbl: 'Post', text: `Esta semana descarté [lo que descartaste de verdad].

La idea era [qué era y por qué sonaba bien]. La construí, la probé, y [qué pasó cuando la probaste].

El problema no fue técnico. Fue que [la razón real: rompía una regla, agregaba un paso, hacía que Athos pareciera decidir algo que no le toca].

Lo que quedó en su lugar: [lo que hiciste finalmente].

Escribo esto por una razón concreta. Cuando alguien decide confiarle sus consultas a un software, lo que quiere saber no es qué tan rápido construyes. Es cómo decides. Y la única forma de mostrarlo es enseñando las decisiones, incluidas las que salieron mal.

Vamos [N] de 10 veterinarios. Si eres vet en Colombia y quieres ser uno, el WhatsApp está abajo.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'VIE 25', platform: 'ig', title: 'IG — card de la regla + reels',
            canvases: [{ id: 'ig-s3-athos', label: 'Card', draw: cEscucha }],
            blocks: [
              {
                lbl: 'Caption', text: `Athos redacta la respuesta al dueño con lo que hay en la historia del paciente.

Y se queda quieto. El mensaje no sale hasta que el veterinario lo aprueba.

Es más lento. Es correcto.

Buscamos los primeros 10 veterinarios. WhatsApp en la bio.

#veterinaria #veterinariacolombia #medicinaveterinaria #vetlife #softwareveterinario` },
            ],
          },
        ],
      },

      /* ── SEMANA 4 · LOS 10 ─────────────────────────────────────────────── */
      {
        id: 's4',
        nav: 'Sem 4',
        label: 'Semana 4 · 28 sep – 4 oct',
        title: 'Los 10.',
        sub: 'Ahora sí la pedida directa, con tres semanas de credibilidad detrás. El miércoles es el post más importante de la semana.',
        items: [
          {
            day: 'LUN 28', platform: 'lu', title: 'Video 6 — de lo recetado a la factura',
            note: 'Video con los clips <span class="mono">07-facturar-recetado</span> + <span class="mono">08-carrito-emitir</span>. Ojo con la línea roja: nunca atacar la facturación como categoría.',
            blocks: [
              {
                lbl: 'Post', text: `Lo que recetaste en la consulta ya está en la factura. Eso es todo lo que hace el video.

Suena a poco. Vale la pena mirar el paso que desaparece.

Normalmente el veterinario receta durante la consulta, y después alguien vuelve a mirar qué se recetó para pasarlo a la cuenta. A veces es el mismo vet al final del día. A veces es recepción preguntando. A veces se cobra de menos porque algo no quedó anotado.

Es la misma información escrita dos veces, con una oportunidad de que se pierda en el medio.

Acá el plan de la consulta y lo que se cobra son la misma cosa mirada desde dos lados. No hay que trasladar nada.

Y lo digo sin exagerar: esto no es una novedad conceptual, es higiene. Buena parte de construir software para una clínica es quitar el segundo lugar donde hay que escribir lo mismo.

Todavía no lo usa ninguna clínica. Estamos buscando las primeras 10. WhatsApp en el primer comentario.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'MAR 29', platform: 'dav', title: 'David — cómo va la búsqueda desde la calle',
            note: 'Números reales de David: cuántas clínicas visitó, cuántas dijeron que sí, cuántas que no. Sin inflar nada.',
            blocks: [
              {
                lbl: 'Post (David)', text: `Un mes tocando puertas de clínicas en Bogotá. Los números reales:

[N] clínicas visitadas
[N] veterinarios que vieron el producto completo
[N] que quedaron de probarlo
[N] que dijeron que no

Lo que más se repite cuando dicen que no: [la razón real, la más frecuente].

Lo que más se repite cuando dicen que sí: [la razón real].

Y lo que no esperaba: [el aprendizaje real del mes].

Seguimos buscando los primeros 10 veterinarios. Si estás en Bogotá y quieres que te lo muestre en tu consultorio, escríbeme y voy.` },
            ],
          },
          {
            day: 'MIÉ 30', platform: 'lu', title: 'El post de los 10 — la pedida directa',
            note: '<strong>El post más importante de la semana.</strong> Va sin video o con la card. Las condiciones tienen que ser reales: si no puedes sostener una, se quita.',
            canvases: [{ id: 's4-diez', label: 'Card (IG)', draw: cDiez }],
            blocks: [
              {
                lbl: 'Post', text: `Busco 10 veterinarios en Colombia. Escribo exactamente qué significa eso, para que nadie tenga que adivinar.

Lo que hay hoy: un producto que funciona, que has visto en video este mes, y cero clínicas usándolo. Los primeros 10 entran a algo que todavía se está armando.

Qué implica ser uno de los 10:

Lo montamos sobre tu forma de trabajar, no al revés. No hay una configuración estándar que te tengas que aprender.
Me dices qué falta y lo construyo. Literalmente: la lista de esta semana salió de conversaciones con veterinarios.
Vas a encontrar cosas rotas. Somos pocos y esto es temprano. Prefiero decírtelo ahora que después.
Si no te sirve, me lo dices y ya. Sin contrato largo y sin insistencia.

Qué no implica:

No tienes que cambiar de sistema el primer día.
No tienes que darme datos de tus pacientes para hablar conmigo. La primera conversación es una conversación.
Y Athos no va a diagnosticar ni a firmar nada. Eso no cambia con la versión.

Si eres veterinario en ejercicio y esto te suena, escríbeme al WhatsApp del primer comentario. Contesto yo, no un formulario.

Y si no eres vet pero conoces a alguno que se queda escribiendo fichas después de cerrar, pásaselo.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'MIÉ 30', platform: 'pag', title: 'Página — repost del post de los 10',
            blocks: [
              { lbl: 'Intro del repost', text: 'Buscamos los primeros 10 veterinarios en Colombia. Acá están las condiciones, escritas sin letra chica.' },
            ],
          },
          {
            day: 'VIE 2', platform: 'lu', title: 'Cierre del mes — los números reales',
            note: 'Todos los números tienen que ser los de verdad, incluidos los feos. Un mes de build in public que redondea hacia arriba deja de servir para lo único que sirve.',
            blocks: [
              {
                lbl: 'Post', text: `Primer mes mostrando Tuvetia en público. Los números, con los feos incluidos.

Publicado: [N] piezas de [N] planeadas.
Conversaciones de WhatsApp con veterinarios: [N].
Veterinarios que quedaron de probarlo: [N] de 10.
Clínicas usándolo hoy: [N].

Lo que funcionó: [la pieza o el ángulo que de verdad movió conversaciones, y tu hipótesis de por qué].

Lo que no: [lo que creíste que iba a funcionar y no]. [Qué haces distinto por eso.]

Lo que aprendí y no esperaba: [lo real, en una o dos líneas].

Lo que no cambia: la ficha la escribe Athos, la firma el veterinario. Athos no diagnostica. Nada sale al dueño sin aprobación. Esas tres no se mueven por más rápido que queramos ir.

Mes dos arranca el lunes. Sigo buscando veterinarios para los 10 que faltan.

WhatsApp en el primer comentario. Gracias a los que escribieron este mes.` },
              { lbl: 'Primer comentario', text: WA },
            ],
          },
          {
            day: 'VIE 2', platform: 'ig', title: 'IG — card de los 10 + recap',
            canvases: [{ id: 'ig-s4-diez', label: 'Card los 10', draw: cDiez }],
            blocks: [
              {
                lbl: 'Caption', text: `Buscamos los primeros 10 veterinarios en Colombia.

Todavía no lo usa ninguna clínica. Los primeros 10 entran a algo que se está armando, y lo armamos con lo que ellos digan que falta.

Si eres vet y quieres verlo, el WhatsApp está en la bio. Contesta Luciano, no un formulario.

#veterinaria #veterinariacolombia #medicinaveterinaria #vetlife #softwareveterinario #buildinpublic` },
            ],
          },
        ],
      },
    ],
  };
})();
