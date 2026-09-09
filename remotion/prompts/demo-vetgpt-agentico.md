# ENCARGO · `DemoAgentico` — VetGPT no sólo responde: hace. Y no sale sin que aprietes aprobar

> Se lee **después** de `_plantilla-demo-producto.md`. Antes de nada, `public/app/NOTAS-MAQUETA.md`: las tres acciones del copiloto se arreglaron ahí y ahora ejecutan de verdad. Sus límites mandan.

---

## 1. La promesa

> Le pides algo, lo prepara con los datos a la vista, tú lo editas y apruebas, y lo hace de verdad en la app.

La pieza tiene que sostener las dos mitades a la vez. Sólo la primera («hace cosas») da miedo. Sólo la segunda («pide permiso») da pereza. Juntas son el producto: **agencia con el vet en el lazo**.

Y la app ya lo dice con sus palabras. Localiza por `grep` la respuesta de la rama «cómo funciona» de `responderVetGPT` —«Cuando algo hay que **hacer** … no lo ejecuto: te lo propongo … Nada sale sin que aprietes «Aprobar»»— y el pie del compositor —«VetGPT propone — vos aprobás. Ninguna acción se ejecuta sin tu confirmación.» Ese pie sale en cámara solo, en cada plano del asistente. No lo tapes con la banda.

---

## 2. Superficies

**Sólo escritorio.**

---

## 3. La cadena: una acción que crea algo que antes no existía

**La acción central es el mensaje de cobranza.** De todas las del motor es la única con doble mutación verificable: escribe el mensaje **y crea el contacto**. El titular de la factura más vencida **no está en la lista de conversaciones del seed**, así que al aprobar, la bandeja de WhatsApp **gana una fila que antes no estaba**. Esa es la prueba: no cambió un número, apareció una conversación.

Resuélvelo en el replay: la factura más vieja de `SEL.porCobrarLista()` con vencimiento pasado, su titular, y comprobar **antes de aprobar** que ese teléfono no está en `DB.wa.contactos`. Si ya estuviera, la prueba se cae — **para y avisa**.

**Segunda acción, para mostrar que no todo es mandar mensajes: la cita.** Ahora que `create_appointment` fue arreglada y sus pasos dicen sólo lo que ocurre, se puede filmar: se crea en la agenda y —si la maqueta quedó con la opción 1 del arreglo— el titular recibe su aviso. Verifica en `NOTAS-MAQUETA.md` cuál de las dos opciones quedó y **ajusta la frase del acto a lo que el código hace**, no al revés.

**El punto de entrada es de la propia app**: el riel de la clínica trae «Resolverlo con VetGPT», que navega al asistente **con la pregunta ya escrita en el compositor**. Empieza ahí: es el producto proponiendo el trabajo, no un guion escribiendo una pregunta cómoda.

---

## 4. Línea de tiempo — 1500 frames (50 s)

| Frames | Acto | Qué pasa | Rótulo | Frase |
|---|---|---|---|---|
| 0–120 | 1 · Lo que hay que hacer | Plano general en `/dashboard/tablero`. El riel derecho muestra «Requiere atención» con la cartera vencida y su monto. Corte al encuadre del riel. | `LA CLÍNICA HOY` | Hay plata sin cobrar. Alguien tiene que escribir. |
| 120–300 | 2 · Se lo pides | Clic en «Resolverlo con VetGPT». Corte al asistente: la pregunta **ya está escrita** en el compositor. Clic en enviar. | `SE LO PIDES` | Se lo pides como se lo pedirías a alguien del equipo. |
| 300–540 | 3 · Lee la cartera | La respuesta se escribe palabra por palabra: nombra **las facturas vencidas reales, con sus montos**, y dice por cuál empezaría. Scroll siguiendo el texto. | `MIRA TUS DATOS` | No inventa: lee la cartera que tienes. |
| 540–840 | 4 · La propuesta | Entra la tarjeta de acción: encabezado «Acción propuesta · Mensaje de WhatsApp», el destinatario, el mensaje **en un campo editable**, los dos pasos, y los botones. El puntero **edita el texto**: añade una frase corta al final. Encuadre cerrado sobre el campo. | `TÚ MANDAS` | Te lo deja escrito. Y lo puedes cambiar antes de que salga. |
| 840–1020 | 5 · Aprobar | Clic en «Aprobar y enviar». La tarjeta pasa a «✓ Ejecutada» con sus pasos hechos. Toast. | `APROBAR` | Nada sale hasta que aprietas esto. |
| 1020–1260 | 6 · La prueba | Corte a `/dashboard/comunicaciones`. En la lista hay **una conversación que antes no existía**, y dentro está el mensaje **con la frase que tú añadiste**. | `NO EXISTÍA` | Le escribió. Con lo que tú escribiste. |
| 1260–1380 | 7 · Y no sólo mensajes | Corte breve: segunda petición, la cita. La tarjeta con la fecha y la hora editables, aprobar, y la cita en el calendario. | `TAMBIÉN AGENDA` | *(la frase se ajusta a lo que la acción hace de verdad — ver §3)* |
| 1380–1500 | Cierre | §5 de la plantilla. | — | — |

**El acto 4 es el corazón.** El plano del vet **editando el texto antes de aprobar** es lo que separa esta pieza de cualquier demo de agente. Si hay que recortar, se recorta del 3.

---

## 5. Beats del replay

`SIM` es no-op, así que `enviarChat` empuja el mensaje del vet y se queda pensando: la respuesta y la tarjeta las arma el replay con lo que devuelve `responderVetGPT`, y la acción se registra en `ACCIONES_VIVAS` para que el botón de aprobar la encuentre. Los comandos canónicos están en `NOTAS-MAQUETA.md`.

| desde | beat |
|---|---|
| 0 | resolver la factura vencida más vieja, su titular y su teléfono; **verificar que ese teléfono no esté en `DB.wa.contactos`** o abortar con nombre de toma; ruta tablero |
| 150 | la acción del riel: navega al asistente con la pregunta precargada en el compositor |
| 240 | empujar el mensaje del vet (la mitad de `enviarChat` que no depende de `SIM`) para que la fila de espera diga lo correcto |
| 300 | `r = responderVetGPT(pregunta)`; push del mensaje del asistente con `escribiendo: true`; registrar `r.accion` en `ACCIONES_VIVAS` |
| 320 | escribir `m.texto` por palabras hasta 540 |
| 540 | texto completo; la tarjeta de acción visible |
| 700 | editar el payload del mensaje: añadir la frase al final, como hace la acción de editar campo |
| 870 | aprobar la acción; guardar en `ctx` el teléfono y el texto final |
| 1020 | ruta comunicaciones; abrir el hilo del teléfono nuevo |
| 1260 | segunda petición y su acción, análogo |

**No filmes** las ramas que `NOTAS-MAQUETA.md` marque como no arregladas, ni ninguna acción cuyos `pasosHechos` no correspondan a una mutación real. Si al ejecutar ves un paso que no ocurre, **para y avisa**: eso es un bug de producto, no un detalle de encuadre.

---

## 6. Lo que la pieza afirma

| Frase | Qué la sostiene |
|---|---|
| «No inventa: lee la cartera que tienes.» | Los nombres y montos de la respuesta coinciden con la pantalla de cartera. Verificable comparando dos stills. |
| «Lo puedes cambiar antes de que salga.» | El campo editable y la edición en cámara. |
| «Nada sale hasta que aprietas esto.» | El pie del compositor lo dice solo, y la tarjeta no ejecuta hasta el clic. |
| «Le escribió. Con lo que tú escribiste.» | La conversación nueva en la lista y la frase añadida dentro del mensaje. |

**Prohibido:** decir o insinuar que VetGPT responde solo, o hablar de la barra de autonomía. El nivel se guarda pero **ninguna lógica de la app lo lee**: no hay envío automático en ningún nivel, y afirmarlo sería vender algo que no existe. Tampoco tiempos, porcentajes ni «ahorra X».

---

## 7. QA — stills

| Frame | Qué tiene que verse |
|---|---|
| 0060 | Riel con la cartera vencida y su monto. |
| 0200 | El asistente con la pregunta **ya escrita** en el compositor. |
| 0450 | La respuesta a medio escribir, con las facturas nombradas, sin marcadores partidos. |
| 0600 | La tarjeta de acción completa: encabezado, destinatario, campo editable, pasos, botones y la leyenda. |
| 0760 | El campo con la frase añadida, legible. |
| 0900 | «✓ Ejecutada» con los pasos hechos. |
| 1100 | La lista de conversaciones con la fila nueva. |
| 1180 | El mensaje dentro del hilo, con la frase añadida. |
| 1320 | La cita en el calendario. |
| 1440 | Cierre. |

Propias:

- [ ] Un still del acto 1 o 2 que muestre la lista de conversaciones **sin** la fila nueva, para que f1100 tenga contra qué compararse. Si no cabe en la línea de tiempo, guárdalo en `out/qa/` como prueba y anótalo.
- [ ] La frase añadida en f0760 es la misma que en f1180, carácter por carácter.
- [ ] En ningún frame aparece la barra de autonomía.
- [ ] El pie «VetGPT propone — vos aprobás» queda visible y **tuteado** en los planos del asistente.

---

## 8. Parámetros

Música y cierre como `DemoVentas`. `CON_VOZ = false`. 1500 frames.