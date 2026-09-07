# Publicación — cómo arrancar

Esta carpeta es lo que le faltaba al motor de contenido: **LinkedIn como canal propio y un
sitio donde ver todo listo para publicar.** El resto del repo no cambia. Los guiones de
reels siguen en `contenido/`, los carriles en `carriles/`, la marca en `marca/`, y el video
en `remotion/`.

Lo que se trajo de otro sistema son los motores de `engine/`, que dibujan las cards y arman
el hub. Son agnósticos de marca: leen `marca.config.js` y nada más.

---

## Los dos archivos que abres con doble clic

| Archivo | Qué te da |
|---|---|
| **`hub.html`** | Las 28 piezas del mes con su día, cuenta, hora y texto listo para copiar. Marcas cada una cuando la publicas y el checklist se guarda solo |
| **`cards.html`** | Los visuales de Instagram y los carruseles, en PNG a 1080×1350 |

No hay que instalar ni levantar nada. Doble clic y funcionan.

---

## Antes de publicar la primera pieza

Tres cosas, en este orden. Sin la primera no sirve nada de lo demás.

**1 · El link de WhatsApp.**
Abre `marca.config.js` y reemplaza `[LINK WHATSAPP]` por tu `wa.me/57...` real, en los dos
sitios donde aparece. Con eso queda puesto en las 28 piezas de una vez. Hoy el hub muestra
el marcador, no el link.

**2 · Lee la estrategia y edítala.**
`estrategia-linkedin.md` es una propuesta, no una decisión tomada. Lo que más vale la pena
que revises: el objetivo del mes (20 conversaciones de WhatsApp), el reparto de carriles, y
si el arco de cuatro semanas es el orden que quieres. Cambia lo que no te cuadre antes de
que se produzca nada más.

**3 · Los perfiles.**
La semana 0 del hub tiene el titular y el Acerca de de las tres cuentas, escritos y listos
para pegar. El de David tiene corchetes que solo puede llenar él.

---

## Los tres videos de la semana

El calendario está armado para que **no grabes de cero cada vez**. Los seis videos de
funcionalidad del mes salen de material que ya tienes:

| Semana | Video | De dónde sale |
|---|---|---|
| 1 | El demo completo | `remotion/out/demo-saas.mp4` |
| 1 | La ficha se escribe sola | `captura/clips-raw/04-cockpit-transcribiendo.webm` |
| 2 | La alerta de alergia | `05-alerta-alergia.webm` |
| 2 | El SOAP y el botón de firmar | `06-generar-soap.webm` |
| 3 | WhatsApp con freno | `09-athos-whatsapp.webm` |
| 3 | El día del vet | `02-agenda` + `03-abrir-consulta` + `10-flash-agenda` |
| 4 | De lo recetado a la factura | `07-facturar-recetado` + `08-carrito-emitir` |

Cada uno son 30 a 45 segundos con subtítulos quemados. El demo del lunes 7 va completo.

Si quieres componerlos en Remotion en vez de editarlos a mano, la skill `remotion-tuvetia`
ya tiene las convenciones, y el formato `DemoClip` está pensado exactamente para esto.

---

## La semana, en la práctica

**Domingo o lunes temprano.** Abres `hub.html`, miras las piezas de la semana y llenas los
`[corchetes]` con lo que de verdad pasó: cuántas clínicas visitó David, qué construiste,
qué se descartó. **Si un dato no es real, esa pieza no sale.** Es la regla que sostiene todo
el ángulo de construir en público.

**Cada publicación.** Copias el texto del hub, subes el video, y el link del WhatsApp lo
pegas **en el primer comentario**, nunca en el cuerpo del post. Te quedas la primera hora
respondiendo: es la hora que decide el alcance.

**Antes de dar publicar.** Pasas la pieza por `/revisar`. También los posts de texto y
también los de David. Las líneas rojas de `marca/no-decimos.md` aplican igual en LinkedIn.

**Viernes, 15 minutos.** Llenas `metricas-mes-1.md`: cuál fue el mejor post y por qué, cuál
el peor y por qué, qué repites la semana siguiente.

---

## Cómo se ve una pieza nueva

Si quieres agregar una pieza fuera del plan, se hace en `social/contenido.js`, dentro de la
semana que corresponda:

```js
{
  day: 'JUE 17', platform: 'lu', title: 'De qué trata',
  note: 'Instrucción operativa: qué video usar, qué recordar.',
  blocks: [
    { lbl: 'Post', text: `El texto completo, listo para pegar.` },
    { lbl: 'Primer comentario', text: WA },
  ],
},
```

Las cuentas disponibles son `lu` (Luciano), `pag` (página), `dav` (David) e `ig`. La hora la
pone el hub solo, según el día y la cuenta.

Para un visual nuevo, se compone en `social/cards.js` con los layouts del kit:
`cardStatement`, `cardDimPunch`, `cardNumbered`, `cardList`. Los colores y la tipografía ya
salen de `marca.config.js`, así que no hay que tocar ningún hex.

---

## Lo que decidí y puedes cambiar

**Las cards van en claro, no en oscuro.** Es al revés que casi cualquier marca, pero es lo
que dice tu sistema: el blanco es el centro y el grafito es de Athos. Las únicas cards sobre
grafito son las que hablan de Athos escuchando.

**Los titulares van en Archivo,** la display del sistema, no en Inter Tight. Así una card se
lee como la app.

**El horario está en hora Colombia** porque el público está allá, aunque tú publiques desde
Ginebra. 07:30 en Bogotá son las 14:30 tuyas.

**No incluí generador de logo.** El sistema puede producir avatares y favicons, pero Tuvetia
tiene wordmark y no marca cuadrada, y decidir cómo se ve un avatar cuadrado es una decisión
de marca que te toca a ti, no a mí. Si defines una (una T, un monograma, el wordmark
recortado), se agrega en un rato.

---

## Lo que necesito de ti para seguir

1. **El link de WhatsApp.** Es lo único que bloquea publicar.
2. **Si el arco de cuatro semanas te sirve** tal como está, o qué cambiarías.
3. **Los datos de David:** su LinkedIn, y si va a publicar desde el día uno o entra en la
   semana 2.
4. **La historia real de Athos el bulldog,** para que el post de presentación de David deje
   de tener corchetes. Es probablemente el mejor post del mes y ahora mismo está a medias.
5. **Si Instagram entra este mes o no.** Está armado, pero sostener tres canales con una
   persona y media es lo que más se cae. Si hay que soltar uno, suelta Instagram y quédate
   con LinkedIn.
