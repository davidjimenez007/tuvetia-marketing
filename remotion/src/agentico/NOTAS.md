# DemoAgentico · notas de producción

Encargo: `prompts/demo-vetgpt-agentico.md`, leído sobre `prompts/_plantilla-demo-producto.md` y bajo los
límites de `public/app/NOTAS-MAQUETA.md` (§C: las tres acciones del copiloto ejecutan de verdad).
Composición `DemoAgentico` (1080×1920 · 30 fps · **1500 frames**), registrada en `src/Root.tsx` dentro de
`<Folder name="Demos">`. Sólo escritorio. Voz: Luciano, carril producto, sin locución grabada
(`CON_VOZ = false`). Construida la noche del 8-sep-2026 sin David (reglas de la noche: elegir y anotar).

Comandos:

```
npx remotion still DemoAgentico out/qa/agentico/f0600.png --frame=600 --timeout=90000
node scripts/medir-pt-agentico.mjs          # mide los PT de guion.ts por CDP, en el estado de cada acto
node scripts/voseo-restante.mjs agentico    # voseo que queda en las pantallas tras MAPA_TUTEO + TUTEO_EXTRA
bash out/qa/agentico/determinismo.sh        # dos frames en dos procesos → MD5 iguales
bash out/render-agentico.sh                 # render 2× → 1080 → copia web + sondas
```

---

## Estado al 9-sep-2026, 08:15 (entregada)

Construida en la madrugada sobre la máquina de `src/pieza/` (misma cadena que DemoVentas y DemoPacientes:
`guion.ts` como datos, `estado.ts` replay puro, `postproceso.ts` con toasts dentro de lo visible, dock y
autonomía ocultos, compositor estirado). `PT` medidos por CDP (`scripts/medir-pt-agentico.mjs`). Voseo de las
seis pantallas revisado con `scripts/voseo-restante.mjs agentico` (limpio con `TUTEO_EXTRA`). Cuatro pasadas de
stills (§4): las diez tomas del encargo más tres propias, y la prueba de la bandeja «antes». `/revisar` en §5.

**Determinismo:** f0760 → `b8e55abea6430f3b659aec98aa2b63f8` y f1180 → `a02801a488a0b2a0e640782ab4cbf0cc`, cada
uno en dos procesos distintos (`out/qa/agentico/determinismo.sh`).

**Entrega (render 02:21 → 02:33; la copia web y las sondas cerraron a las 08:14 porque la máquina se durmió
entre medias):** `out/render-agentico.sh` → `out/demo-agentico-2x.mp4` (2160×3840, 28,2 MB), `out/demo-agentico.mp4`
(1080×1920, 9,7 MB) y `out/demo-agentico-web.mp4` (1080×1920, yuv420p tv bt709 + faststart, 8,6 MB), los tres de
50,05 s con AAC. `out/` está en `.gitignore`.

---

## 0. La cadena de datos, resuelta en el replay

`src/agentico/estado.ts`, beat 1: la factura vencida más vieja de `SEL.porCobrarLista()` (hoy POS-1009, Andrés
Pinilla, $142.800, vencida el 26 ago 2026), su titular y su teléfono (573017742255), y la comprobación de que
**ese teléfono no está en `DB.wa.contactos`** — o reventar con nombre de toma (encargo §3: «para y avisa»).
Beat 3: `responderVetGPT(pregunta)` y la comprobación de que la acción escribe a ese mismo teléfono. La
pregunta no la escribe el guion: la precarga la app al navegar con `?pedir=cobros` (el botón del riel) y el
replay la lee de `CHAT.entrada`. Beat 5: aprobar tiene que dejar contacto +1 y mensaje +1, o revienta.
Beat 7: la cita tiene que dejar cita +1 **y** aviso +1 (los dos pasos que promete la tarjeta), o revienta.

---

## 1. Lo que se tocó fuera de `src/agentico/`

Nada en la maqueta. `src/pieza/columna.ts` gana `ocultarAutonomia(doc)` (compartido con DemoComunicaciones).
`scripts/medir-pt-agentico.mjs` (medidas) y `scripts/voseo-restante.mjs` (pantallas de esta pieza).

---

## 2. Desviaciones (todas deliberadas, todas verificadas en still)

| # | Dice el encargo | Se hizo | Por qué |
|---|---|---|---|
| 1 | §4 acto 1: «plano general en `/dashboard/tablero`; el riel derecho muestra “Requiere atención”» | Plano general en `/dashboard/asistente`: el riel de la clínica (`.riel-clinica`, con «La clínica hoy», «Agenda» y «Requiere atención» → «Resolverlo con VetGPT») **vive en el asistente**, no en el tablero (`VistaAsistente`, l. 7904). | Es donde está el botón que el encargo pide como punto de entrada; el tablero no tiene riel. Medido por CDP: riel x 1120→1440, «Requiere atención» y 614→792. |
| 2 | §5: comandos canónicos de NOTAS-MAQUETA (`preguntar`) | Igual, pero repartido en beats: el mensaje del vet entra en f240 (estado «pensando»), la respuesta en f300 con «Consultando la cartera de la clínica…», el texto por palabras de f330 a f540, la tarjeta en f540. | La secuencia real de `enviarChat` (pensando → consultando → escribiendo), sin `SIM`. |
| 3 | — | `DB.wa.propuestas = []` en el replay | Las dos propuestas del seed (Julián, Ana) pintarían un bloque «Propuestas pendientes» con dos tarjetas al pie del hilo, ajenas a esta pieza. Mismo criterio que DemoVentas y DemoPacientes. |
| 4 | §4 acto 2: «la pregunta ya está escrita en el compositor» | El compositor (textarea de una fila) se estira a la altura de su texto por post-proceso (`estirarCompositor`). | La app sólo agranda el textarea al teclear (`chat-input` guarda el valor; no hay auto-ajuste en render): precargada por `?pedir=cobros`, la pregunta de 83 caracteres quedaba cortada en una línea. Así queda como después de escribirla. |
| 5 | §6: prohibido hablar de la barra de autonomía | `ocultarAutonomia`: la tarjeta `.autonomia` de Integraciones y la línea «número · nivel de autonomía: …» de la cabecera de la bandeja (y 103→121, dentro del encuadre de la lista) van ocultas. | El nivel no lo lee ninguna lógica de la app (NOTAS-MAQUETA, deuda); mostrarlo sugeriría un envío automático que no existe. |
| 6 | §4 acto 7: «la frase se ajusta a lo que la acción hace» | «Crea la cita y le avisa al titular. Tú apruebas.» | NOTAS-MAQUETA §C: opción 1 — `DB.citas.push` + aviso por WhatsApp al titular si `confirmacionCitas` (true en el seed) y hay teléfono. `pasos`: «Crear la cita en la agenda», «Avisarle al titular por WhatsApp»; `pasosHechos`: «Cita creada en la agenda», «Aviso por WhatsApp enviado al titular». El replay revienta si falta cualquiera de los dos. |
| 7 | §4 acto 7: «la cita en el calendario» | Agenda en vista **Semana** (la de la app por defecto), llevada a la semana de la cita (`CAL.fecha = inicio`); cámara ×1.2 sobre el `.ev` «Control» del jueves 10. | La cita cae la semana siguiente (`dias(7, 9, 30)`): en la semana de hoy no se ve. En la prueba por CDP la vista Día no pintó la cita; la Semana sí (x 947→1061, y 374→392). |
| 8 | §5 beat 1260: «segunda petición y su acción, análogo» | La petición se escribe en tuteo («Agéndame un control para Luna la próxima semana.») y entra ya respondida en f1260, sin tecleo; clic en «Aprobar» f1290, corte a la agenda f1305. | El comando canónico de NOTAS-MAQUETA está en voseo («Agendame»); la rama de cita matchea por «control» + «Luna». 120 frames de acto no dan para otro tecleo. |
| 9 | §4 acto 4: «añade una frase corta al final» | « Si necesitas un plazo, escríbeme y lo cuadramos.», por caracteres de f700 a f760. | El mensaje de la app ya dice «Si ya la pagaste, avísanos y la cerramos»: una frase sobre «si ya pagaste» sería redundante. Tuteo. Se comprueba carácter por carácter en f0760 y f1180. |
| 10 | §4: cortes internos | Cada clic va **15 frames antes** del beat que cambia la pantalla (`CLIC`/`CORTE` en `guion.ts`). | Lo aprendido en DemoVentas. |
| 11 | Plantilla §4: push lento, zoom a la acción | Pushes ×1.0 → ×1.05 en el riel, el compositor, la lista y el hilo de WhatsApp; ×1.1 sobre la sección del riel y ×1.2 sobre la cita en la agenda. **Cámara fija** en el hilo del asistente y sobre la tarjeta (actos 3–5 y 7a). | Los encuadres van justos (tarjeta de 607 px en 660): más zoom recorta (DemoPacientes, desviación 7). Y el encargo quiere el pie «VetGPT propone — tú apruebas» en cámara en cada plano del asistente: los encuadres `chat` y `tarjeta` van anclados al borde inferior (y 876) y cualquier push lo recortaba (1.ª pasada, f0450 y f0600 sin el pie). |
| 12 | — | El toast de la cita («Acción ejecutada · Cita creada en la agenda · Aviso por WhatsApp enviado al titular») se mantiene sobre la agenda hasta el cierre (ventana f1305→1380). | Es el toast que la app deja al aprobar; en la app real sigue en pantalla al navegar. Dice, con palabras de la app, los dos pasos hechos. |
| 13 | Plantilla §3: microrrótulo en la fila del rótulo | Bajo la banda (y 1622), como en DemoVentas. | Rótulos largos chocaban con la pastilla. |
| 14 | — | La leyenda de la tarjeta «VetGPT no le escribe al titular hasta que usted apruebe» sale como «…hasta que tú apruebes» (`TUTEO_EXTRA`). | La maqueta trata de usted en esa línea y de tú en el pie del compositor, a 20 px de distancia; el CLAUDE.md manda tuteo. |

---

## 3. Locución (opcional, `CON_VOZ = false`)

| Acto | Frames | Locución |
|---|---|---|
| 1 | 0–120 | Hay plata sin cobrar. Alguien tiene que escribir. |
| 2 | 120–300 | Se lo pides como se lo pedirías a alguien del equipo. |
| 3 | 300–540 | No inventa: lee la cartera que tienes, con nombres y montos. |
| 4 | 540–840 | Te deja el mensaje escrito. Y lo puedes cambiar antes de que salga. |
| 5 | 840–1020 | Nada sale hasta que aprietas aprobar. |
| 6 | 1020–1260 | Le escribió. Con lo que tú escribiste. |
| 7 | 1260–1380 | Y también agenda: crea la cita y le avisa al titular. Tú apruebas. |
| Cierre | 1380–1500 | Ningún veterinario debería volver a escribir una ficha. Escríbenos al WhatsApp. |

---

## 4. QA — stills (`out/qa/agentico/`)

Los diez frames del encargo más tres propios (f0100 el clic en el riel, f0720 la frase a medio escribir, f1290 el
clic en «Aprobar» de la cita). ~45 s por still. Tres pasadas: la 1.ª reventó desde f0450 (`Replay · 2: la app no
precargó la pregunta`: con el render mudo la vista del asistente no corre y no precarga `CHAT.entrada`; se pinta una
vez dentro del beat), la 2.ª dejó ver el tecleo aplastando las viñetas, el pie del compositor fuera de cuadro y la
fila de autonomía partida en el hilo (desviaciones 11 y 14, encuadres `hilo` y `agenda` ajustados), la 3.ª cerró.
Todos mirados uno por uno. Prueba propia del encargo: `out/qa/agentico/prueba-bandeja-antes.png` (captura de la
maqueta por CDP, 1440×900): la lista de conversaciones **antes** de aprobar, sin la fila de Andrés Pinilla.

| Frame | Pide el encargo | Se ve | Veredicto |
|---|---|---|---|
| 0060 | Riel con la cartera vencida y su monto | Encuadre del riel: agenda del día y «REQUIERE ATENCIÓN» con «Cartera vencida · $397.460», «Citas de hoy sin confirmar · 2», «Ítems agotados · 1» y el botón «Resolverlo con VetGPT». | ✓ |
| 0100 | — (propio) | El puntero sobre «Resolverlo con VetGPT», con el hover. | ✓ |
| 0200 | El asistente con la pregunta **ya escrita** en el compositor | Bienvenida («Buenos días, Restrepo, ¿en qué trabajamos?», «Jueves 3 de septiembre · 5 citas · 2 consultas registradas · cartera vencida») y el compositor con «Ponte al día con los cobros vencidos: dime a quién le escribirías y qué le dirías.» entera, en dos líneas (desviación 4), tuteada. Puntero al lado. | ✓ |
| 0450 | La respuesta a medio escribir, con las facturas nombradas, sin marcadores partidos | «Hay 2 facturas vencidas por $397.460:» y las dos viñetas (**Andrés Pinilla** · POS-1009 · $142.800 · vencida el 26 ago 2026; **Sara Villamizar** · FV-1020 · $254.660), el caret al final; los mismos nombres y montos que el riel de f0060. Arriba, la pregunta del vet en tuteo; abajo, el compositor y el pie «VetGPT propone — tú apruebas. Ninguna acción se ejecuta sin tu confirmación.» | ✓ |
| 0600 | La tarjeta completa: encabezado, destinatario, campo editable, pasos, botones y leyenda | «ACCIÓN PROPUESTA · Mensaje de WhatsApp», «Escribirle a Andrés Pinilla por el saldo de POS-1009.», Para +57 301 774 2255, el textarea con el mensaje (tuteado: «Tienes pendiente…», «avísanos»), pasos 1–2, «Aprobar y enviar» / «Descartar», leyenda «VetGPT no le escribe al titular hasta que tú apruebes.» (desviación 14). Debajo, el compositor y el pie entero. | ✓ |
| 0720 | — (propio) | La frase a medio escribir («…¡Gracias! Si necesitas un») dentro del campo; el puntero apartado a la derecha de los pasos. | ✓ |
| 0760 | El campo con la frase añadida, legible | El mensaje termina en «¡Gracias! Si necesitas un plazo, escríbeme y lo cuadramos.», idéntico carácter por carácter al de f1180. | ✓ |
| 0900 | «✓ Ejecutada» con los pasos hechos | La tarjeta pasa a «✓ Ejecutada» con «Mensaje enviado por WhatsApp» y «Contacto registrado en el seguimiento» y el botón «Ver la conversación»; el toast «Acción ejecutada · …» abajo a la derecha, dentro del cuadro. | ✓ |
| 1100 | La lista de conversaciones con la fila nueva | «Andrés Pinilla · 10:30 · Tú: Hola Andrés, te escribimos…» **primera** y resaltada; debajo las cinco del seed (Ana, Paula, Julián, Sara, Mariana). Comparar con `prueba-bandeja-antes.png`. Sin la línea de autonomía. | ✓ |
| 1180 | El mensaje dentro del hilo, con la frase añadida | El hilo de Andrés Pinilla: cabecera con «Ver ficha del titular», la burbuja «mía» con el mensaje completo y la frase añadida, «10:30 ✓✓», y el compositor debajo. | ✓ |
| 1290 | — (propio) | La tarjeta «Nueva cita»: «Agendar un control de Luna para el jueves 10 de septiembre a las 09:30.», Paciente/Titular/Duración/Veterinario, Motivo y Fecha y hora editables, pasos «Crear la cita en la agenda» y «Avisarle al titular por WhatsApp»; el puntero sobre «Aprobar». Texto de VetGPT tuteado («revísala y apruébala»). | ✓ |
| 1320 | La cita en el calendario | Agenda, vista Semana «7 Sep — 13 Sep 2026», la cita nueva «09:30 Lun…» en la columna del jueves 10 (la etiqueta la trunca la app por el ancho de la columna), el toast «Acción ejecutada · Cita creada en la agenda · Aviso por WhatsApp enviado al titular». | ✓ |
| 1440 | Cierre | Logo, claim, CTA «Escríbenos al WhatsApp», «Buscamos 10 veterinarios · 0/10». | ✓ |

---

## 5. `/revisar` — líneas rojas, punto por punto

Sobre `TEXTOS` y `MICRORROTULO` de `guion.ts`, el cierre compartido (`src/demo/Cierre.tsx`) y la locución del §3.

| # | Línea roja | Veredicto | Nota |
|---|---|---|---|
| 1 | VetGPT nunca diagnostica ni firma | PASA | Lo que VetGPT hace es redactar un cobro y proponer una cita; nada clínico, y nada sale sin «Aprobar» (el pie de la app lo dice en cámara: «VetGPT propone — tú apruebas»). |
| 2 | Cero métricas, testimonios o clínicas inventadas | PASA | Ningún número en la banda; los montos y nombres de la respuesta salen del seed y coinciden con la cartera (f0450 vs riel de f0060). |
| 3 | Nunca atacar la facturación | PASA | La pieza usa la cartera de la app a favor; no compara ni ataca. |
| 4 | Nunca nombrar competidores | PASA | Ninguno. |
| 5 | Nunca burlarse de lo clínico ni sugerir atajos | PASA | No hay contenido clínico. |
| 6 | Tuteo, a la persona | PASA | «pides», «tienes», «puedes», «aprietas», «escribiste», «apruebas»; «plata» es registro colombiano de colega. El pie de la app y el mensaje de cobro van tuteados por MAPA_TUTEO + TUTEO_EXTRA. |
| 7 | Grafía «Tuvetia» | PASA | Sólo en el cierre, correcta. |
| 8 | Privacidad en serio | PASA | No se menciona. |
| 9 | El sufrimiento del vet no es el gancho | PASA | El gancho es la plata sin cobrar, no el agotamiento. |
| 10 | CTA a WhatsApp | PASA | Cierre compartido: «Escríbenos al WhatsApp». |

Prohibiciones propias del encargo (§6): ni «responde solo», ni barra de autonomía (oculta: desviación 5),
ni tiempos, porcentajes o «ahorra X» ✓. **Hook**: «Hay plata sin cobrar. Alguien tiene que escribir.» = 8
palabras ✓ (skill `guionista`). Voseo: `node scripts/voseo-restante.mjs agentico` → limpio en las seis pantallas
(«miré», «Camila» son falsos positivos del escáner). **Veredicto: LISTO PARA PUBLICAR.**

---

## 6. Para una segunda pasada

- Locución de Luciano + subtítulos quemados.
- Si el producto quiere que el compositor auto-ajuste su altura al precargar, es un cambio de maqueta.

## BLOQUEOS - noche del 8-sep

(ninguno hasta ahora)
