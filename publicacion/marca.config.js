/* ═══════════════════════════════════════════════════════════════════════════════
   TUVETIA · configuración de marca para los generadores de publicación

   Los valores NO se inventan aquí: son los mismos de marca/tokens/tuvetia.css,
   que a su vez vienen de globals.css de la app. Si la app cambia, se actualiza
   allá primero y se copia acá.

   Reglas de la marca que estos números no dicen (marca/tokens/tuvetia.css):
   · El blanco es fondo y centro. El menta se reserva para ACCIÓN, nunca para
     decorar superficies grandes.
   · Menta 500 pinta rellenos con tinta blanca encima. Menta 700 es el menta
     que va en TEXTO.
   · El grafito sólo aparece cuando es Athos (notch, cockpit, pill).
   ═══════════════════════════════════════════════════════════════════════════════ */

window.BRAND = {

  slug: 'tuvetia',
  name: 'Tuvetia',
  wordmark: 'Tuvetia',        // grafía: una palabra, nunca "Tu Vetia" ni "TuVetia"
  mark: null,                 // la marca tiene wordmark, no marca apilada. Ver LEEME.md
  domain: 'tuvetia.com',
  email: '',
  tagline: 'Ningún veterinario debería volver a escribir una ficha.',
  location: 'Bogotá · Ginebra',

  founder: { name: 'Luciano', role: 'Construyendo Tuvetia', initial: 'L' },

  langInternal: 'es',
  langPublic: 'es',           // español colombiano, tuteo siempre
  langSecondary: null,

  /* ── Temas ────────────────────────────────────────────────────────────────
     Tuvetia es light-first, al revés que la mayoría de marcas: el blanco es el
     centro del sistema. Por eso las piezas sociales también van en claro — el
     grafito es de Athos, no un fondo decorativo.                              */
  docTheme: 'light',
  socialTheme: 'light',

  light: {
    bg: '#ffffff',            // --tv-white
    ink: '#0c1613',           // --tv-graphite
    card: '#ffffff',
    cream: '#f5f8f7',         // --tv-snow
    brand: '#0b5847',         // --tv-mint-700, el menta que va en TEXTO (8.4:1)
    accent: '#12856a',        // --tv-mint-500, el menta de RELLENOS
    muted: '#5d706a',
    soft: '#7a8a82',
    border: '#e2e9e5',
    borderStrong: '#7a8a82',
  },

  /* La superficie grafito: sólo para piezas que hablan de Athos escuchando. */
  dark: {
    bg: '#0c1613',
    ink: '#f5f8f7',
    card: '#14211c',
    cream: '#14211c',
    brand: '#7ed0ba',         // menta 300: el 500 no contrasta sobre grafito
    accent: '#7ed0ba',
    muted: '#7b8d85',
    soft: '#5c7066',
    border: '#223129',
    borderStrong: '#5c7066',
  },

  whatsapp: '#25D366',        // sólo para el logo de WhatsApp y el CTA

  fonts: {
    sans: 'Inter Tight',
    mono: 'JetBrains Mono',
    serif: 'Archivo',         // en Tuvetia el "display" es Archivo, no una serif
    display: 'Archivo',
    googleUrl: 'https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap',
  },

  type: {
    headlineWeight: 600,      // Archivo 600 es el peso de titular del sistema
    headlineTracking: -0.022, // .tv-titular
    eyebrowTracking: 0.15,    // .tv-rotulo
    radius: '12px',           // --radius-xl, la escala apretada del rediseño
  },

  canvas: {
    preset: 'post',           // 1080×1350: sirve de post IG y de slide de LinkedIn
    margin: 96,
    grain: true,              // el grano de papel del sistema (.tv-grano)
  },

  /* ── El funnel ────────────────────────────────────────────────────────────
     Regla absoluta del CLAUDE.md: todo contenido cierra en WhatsApp. No a la
     landing, no a "link en bio" genérico.                                     */
  funnel: {
    action: 'Escríbenos al WhatsApp',
    promise: 'Buscamos los primeros 10 veterinarios.',
    url: '[LINK WHATSAPP]',   // pegar wa.me/57XXXXXXXXXX aquí, y ya queda en todo
    linkComment: 'Acá está el WhatsApp directo, escribe y te contesto yo: [LINK WHATSAPP]',
  },
};
