/* ═══════════════════════════════════════════════════════════════════════════════
   TUVETIA · visuales sueltos
   Las cards que no están atadas al calendario del mes: apertura de grid, tesis,
   las reglas de Athos, la búsqueda de los 10. Se bajan en PNG 1080×1350, que
   sirve igual de post de Instagram y de slide de carrusel en LinkedIn.

   Tema claro, como el sistema: el blanco es el centro y el menta es acción.
   El grafito sólo aparece cuando la pieza habla de Athos escuchando.
   ═══════════════════════════════════════════════════════════════════════════════ */

(function () {
  const B = window.BRAND;

  /* Dibuja sobre la superficie grafito y devuelve el tema a claro al terminar. */
  const enGrafito = fn => ctx => { CK.use(B, 'dark'); fn(ctx); CK.use(B, 'light'); };

  const paso = (n, titulo, cuerpo) => ctx => CK.cardNumbered(ctx, {
    eyebrow: 'Tuvetia · Cómo funciona',
    label: 'paso',
    number: n,
    title: titulo,
    body: cuerpo,
  });

  window.CARDS = {
    ui: { caption: 'Caption', copy: 'copiar', copied: 'copiado' },
    eyebrow: 'Visuales · Tuvetia',
    title: 'Ver y descargar.',
    intro: 'Cada card se dibuja con los tokens reales de <span class="mono">marca/tokens/tuvetia.css</span>. <strong>Descargar PNG</strong> para exportar, clic en el caption para copiarlo.',

    sets: [
      {
        label: 'Set 1', nav: 'Tesis',
        title: 'La tesis.',
        sub: 'Las que se pueden publicar cualquier día sin que envejezcan. Abren el grid y sirven de relleno cuando una pieza de video se cae.',
        cards: [
          {
            id: 'tesis',
            label: 'Tesis',
            draw: ctx => CK.cardStatement(ctx, {
              eyebrow: 'Tuvetia',
              title: 'Ningún veterinario debería volver a escribir una ficha.',
              body: 'La ficha es obligatoria y debe serlo: es la historia del paciente. Escribirla a mano en 2026, no.',
              size: 104,
            }),
            caption: `Ningún veterinario debería volver a escribir una ficha.\n\nLa ficha es obligatoria y debe serlo. Escribirla a mano en 2026, no.\n\nBuscamos los primeros 10 veterinarios. WhatsApp en la bio.\n\n#veterinaria #veterinariacolombia #medicinaveterinaria #vetlife #softwareveterinario`,
          },
          {
            id: 'mecanografia',
            label: 'Mecanografía',
            draw: ctx => CK.cardDimPunch(ctx, {
              eyebrow: 'Tuvetia · El día del vet',
              dim: 'Estudiaste anatomía, farmacología y cirugía.',
              punch: 'Y hoy pasas horas haciendo mecanografía.',
              size: 74,
            }),
            caption: `Estudiaste años de anatomía, farmacología y cirugía.\n\nY una parte enorme de tu día se va escribiendo.\n\nAthos escucha la consulta y escribe la ficha mientras atiendes. Tú la revisas y la firmas.\n\n#veterinaria #veterinariacolombia #vetlife`,
          },
          {
            id: 'escucha',
            label: 'Athos escucha',
            draw: ctx => CK.cardDimPunch(ctx, {
              eyebrow: 'Tuvetia · Athos',
              dim: 'Athos escucha la consulta y escribe la ficha mientras atiendes.',
              punch: 'Tú la revisas y la firmas.',
              size: 76,
            }),
            caption: `Athos escucha la consulta y escribe la ficha mientras atiendes.\n\nTú la revisas, la corriges si quieres, y la firmas.\n\nLa medicina la sigues haciendo tú.\n\n#veterinaria #softwareveterinario #medicinaveterinaria`,
          },
        ],
      },

      {
        label: 'Set 2', nav: 'Cómo funciona',
        title: 'Cómo funciona, en cuatro pasos.',
        sub: 'Carrusel de cuatro slides. Sirve como carrusel de Instagram y, exportado a PDF, como documento de LinkedIn.',
        cards: [
          { id: 'paso-1', label: 'Paso 01', draw: paso('01', 'Athos escucha la consulta.', 'Atiendes y hablas con el dueño como siempre. Nadie escribe nada mientras tanto.') },
          { id: 'paso-2', label: 'Paso 02', draw: paso('02', 'La ficha se va armando sola.', 'La nota se estructura mientras la consulta pasa. Al terminar ya está escrita.') },
          { id: 'paso-3', label: 'Paso 03', draw: paso('03', 'Tú la revisas y la corriges.', 'La lees, cambias lo que quieras. Athos escribió, pero la ficha todavía no existe.') },
          {
            id: 'paso-4', label: 'Paso 04',
            draw: paso('04', 'Tú firmas.', 'Ahí sí existe. La ficha lleva tu firma porque la decisión y la responsabilidad son tuyas.'),
            caption: `Cómo funciona, sin misterio:\n\n1. Athos escucha la consulta.\n2. La ficha se va armando sola.\n3. Tú la revisas y la corriges.\n4. Tú firmas.\n\nAthos escribe. El veterinario decide y firma. Esa línea no se mueve.\n\nBuscamos los primeros 10 veterinarios. WhatsApp en la bio.\n\n#veterinaria #veterinariacolombia #softwareveterinario #medicinaveterinaria`,
          },
        ],
      },

      {
        label: 'Set 3', nav: 'Athos',
        title: 'Los límites de Athos.',
        sub: 'Las únicas cards sobre fondo grafito: en el sistema el grafito es de Athos. Son las que más confianza construyen con un profesional con licencia.',
        cards: [
          {
            id: 'limites',
            label: 'Los límites',
            draw: enGrafito(ctx => CK.cardDimPunch(ctx, {
              eyebrow: 'Tuvetia · Athos',
              dim: 'Athos no diagnostica. No firma. No manda nada sin que lo apruebes.',
              punch: 'La medicina la sigues haciendo tú.',
              size: 68,
            })),
            caption: `Athos escucha, escribe, sugiere y cita.\n\nNo diagnostica. No firma. No manda nada al dueño sin que lo apruebes.\n\nLa medicina la sigues haciendo tú. Nosotros te quitamos la mecanografía.\n\n#veterinaria #medicinaveterinaria #softwareveterinario`,
          },
          {
            id: 'fuentes',
            label: 'Con fuentes',
            draw: enGrafito(ctx => CK.cardDimPunch(ctx, {
              eyebrow: 'Tuvetia · Athos',
              dim: 'Athos piensa el caso contigo y te dice de dónde salió cada cosa.',
              punch: 'Sin fuente no hay respuesta.',
              size: 70,
            })),
            caption: `Athos tiene 61.540 papers de veterinaria adentro.\n\nNo para saber más medicina que tú. Para el caso raro, ese que ves una vez cada dos años y donde quisieras un colega al lado.\n\nY cada cosa que dice viene con su fuente. Sin fuente no hay respuesta.\n\n#veterinaria #medicinaveterinaria #vetlife`,
          },
          {
            id: 'privacidad',
            label: 'Privacidad',
            draw: enGrafito(ctx => CK.cardList(ctx, {
              eyebrow: 'Tuvetia · Privacidad',
              title: 'Qué pasa con el audio.',
              size: 92,
              items: [
                'Se destruye a los 7 días',
                'Cada veterinario tiene su espacio aislado',
                'Todo bajo la Ley 1581',
                'Nadie graba sin que se sepa',
              ],
            })),
            caption: `Qué pasa con el audio de la consulta:\n\nSe destruye a los 7 días. Cada veterinario tiene su espacio aislado. Todo se maneja bajo la Ley 1581.\n\nY nadie graba sin que se sepa.\n\n#veterinaria #privacidad #softwareveterinario`,
          },
        ],
      },

      {
        label: 'Set 4', nav: 'Los 10',
        title: 'La búsqueda de los 10.',
        sub: 'La card de la pedida. Se usa una vez al mes como mucho, y sólo cuando ya hay semanas de producto detrás.',
        cards: [
          {
            id: 'los-diez',
            label: 'Los 10',
            draw: ctx => CK.cardList(ctx, {
              eyebrow: 'Tuvetia · Bogotá',
              title: 'Buscamos los primeros 10 veterinarios.',
              size: 90,
              items: [
                'Todavía no lo usa ninguna clínica',
                'Lo montamos contigo, sobre tu forma de trabajar',
                'Nos dices qué falta y lo construimos',
                'Si no te sirve, nos lo dices y ya',
              ],
            }),
            caption: `Buscamos los primeros 10 veterinarios en Colombia.\n\nTodavía no lo usa ninguna clínica. Los primeros 10 entran a algo que se está armando, y lo armamos con lo que ellos digan que falta.\n\nSi eres vet y quieres verlo, el WhatsApp está en la bio. Contesta Luciano, no un formulario.\n\n#veterinaria #veterinariacolombia #buildinpublic #softwareveterinario`,
          },
        ],
      },
    ],

    footer: 'Los colores salen de <span class="mono">publicacion/marca.config.js</span>, que copia <span class="mono">marca/tokens/tuvetia.css</span>. Si cambia la app, se actualiza allá y todo esto sigue.',
  };
})();
