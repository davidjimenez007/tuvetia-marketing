# Motor de contenido — Tuvetia

Este repo produce TODO el contenido de Tuvetia: reels, carruseles, posts de LinkedIn, guiones de video, prompts de imagen y composiciones de Remotion. Claude Code es el motor; este archivo es la constitución. Todo lo que se genere aquí la obedece.

## Qué es Tuvetia

Software clínico para veterinarios en Colombia/LatAm. VetGPT es su inteligencia: escucha la consulta, escribe la ficha, el vet revisa y firma. También responde el WhatsApp de los dueños (siempre con aprobación del vet) y piensa los casos con el vet citando literatura real (120.000 fuentes veterinarias).

**Estado real: cero clínicas lo usan todavía. Buscamos los primeros 10 veterinarios.** Esto no se esconde — es el gancho. Construimos en público.

## La tesis (el porqué de todo el contenido)

> Ningún veterinario debería volver a escribir una ficha.

El enemigo es el statu quo: el papeleo, el software viejo, el tiempo robado al vet. **Nunca** un competidor con nombre, **nunca** la facturación, **nunca** la seriedad clínica.

## Estrategia: forma de Cluely, ética de Aliado

Referencia de forma: Cluely / Roy Lee — fundador como canal, tesis provocadora, producción nativa de plataforma, tempo alto, cada cosa que pasa se vuelve contenido.

Lo que NO se copia de Cluely: el rage-bait y la ética de "hacer trampa". Nuestro cliente es un profesional con licencia que va a confiarnos sus consultas. La provocación va contra el papeleo y el software viejo; el fondo es impecable, leal, profesional. **Formato agresivo, fondo impecable.**

## Las dos voces (ver marca/voces.md)

- **Luciano — la construcción.** Building in public: el producto naciendo, decisiones, errores, demos. Desde Ginebra.
- **David — la calle.** Bogotá, clínicas reales, vets reales, la historia de Athos (su bulldog francés). En campo.

Cada pieza declara su voz. Los dos alimentan al otro: lo que David oye en campo → contenido de producto de Luciano; lo que Luciano construye → contenido de David mostrándolo.

## Pipeline

```
/idea [carril]  →  ángulos con hook
/guion          →  guion con tomas, texto en pantalla, prompts de asset
/carrusel       →  carrusel completo con specs visuales
/revisar        →  lint de marca — OBLIGATORIO antes de publicar, sin excepciones
```

Cada pieza vive en `contenido/AAAA-MM/NNN-nombre/` con `guion.md`, `assets/` y `publicacion.md`.

## Publicación — LinkedIn e Instagram

`contenido/` produce las piezas de video vertical. **`publicacion/` es donde vive el canal
de LinkedIn y el calendario de lo que sale cada día**, con el texto ya escrito.

- `publicacion/LEEME.md` — cómo se opera la semana. Empieza por acá.
- `publicacion/estrategia-linkedin.md` — el plan del mes: objetivo, carriles, arco de 4 semanas.
- `publicacion/hub.html` — doble clic: las piezas del mes con día, cuenta, hora, texto para
  copiar y checklist de publicado.
- `publicacion/cards.html` — doble clic: los visuales de Instagram y los carruseles, en PNG.
- `publicacion/social/contenido.js` — donde se agrega o edita una pieza del calendario.
- `publicacion/marca.config.js` — los tokens que usan los generadores. Copian
  `marca/tokens/tuvetia.css`; si cambia la app, se actualiza allá primero.

Las piezas de `publicacion/` obedecen lo mismo que todo lo demás: las líneas rojas, el
tuteo, el CTA a WhatsApp y `/revisar` antes de publicar. También los posts de texto.

## CTA — regla absoluta

**Todo contenido cierra en WhatsApp.** No a la landing, no a "link en bio" genérico. El CTA es escribir al WhatsApp de Tuvetia.

## Líneas rojas

Ver `marca/no-decimos.md`. Se aplican con `/revisar` a todo lo que salga, de cualquiera de las dos voces. No son negociables.

## Skills

- `guionista` — estructura de guiones (hook, tomas, CTA)
- `prompts-imagen` — reglas probadas de generación de imagen (16 rondas de aprendizaje)
- `remotion-tuvetia` — convenciones de video-as-code y motor de animación

## Idioma

Español colombiano, **tuteo** siempre. Nunca voseo, nunca español neutro de doblaje. Registro: como le hablas a un colega que respetas, no como le habla una empresa a "su clínica".
