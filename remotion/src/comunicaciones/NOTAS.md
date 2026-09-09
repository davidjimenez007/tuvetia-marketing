# DemoComunicaciones · notas de producción

Encargo: `prompts/demo-comunicaciones.md`, leído sobre `prompts/_plantilla-demo-producto.md` y bajo los límites
de `public/app/NOTAS-MAQUETA.md`. Composición `DemoComunicaciones` (1080×1920 · 30 fps · **1500 frames**),
registrada en `src/Root.tsx` dentro de `<Folder name="Demos">`. Sólo escritorio. Voz: Luciano, carril
producto, sin locución grabada (`CON_VOZ = false`). Construida en la madrugada del 9-sep-2026 sin David
(reglas de la noche: elegir y anotar).

Comandos:

```
npx remotion still DemoComunicaciones out/qa/comunicaciones/f0500.png --frame=500 --timeout=90000
node scripts/medir-pt-comunicaciones.mjs        # mide los PT de guion.ts por CDP, en el estado de cada acto
node scripts/voseo-restante.mjs comunicaciones  # voseo que queda en las pantallas tras MAPA_TUTEO + TUTEO_EXTRA
bash out/qa/comunicaciones/determinismo.sh      # dos frames en dos procesos → MD5 iguales
bash out/render-comunicaciones.sh               # render 2× → 1080 → copia web + sondas
```

---

## Estado al 9-sep-2026, 17:33 (entregada)

Construida en la madrugada sobre la máquina de `src/pieza/` (`guion.ts` como datos, `estado.ts` replay puro,
`postproceso.ts` con la columna de lectura, el hilo angostado, toasts dentro de lo visible, dock y autonomía
ocultos). `PT` medidos por CDP (`scripts/medir-pt-comunicaciones.mjs`). Voseo de las cinco pantallas revisado
con `scripts/voseo-restante.mjs comunicaciones` (limpio tras el `TUTEO_EXTRA`). Dos pasadas de stills (§4) más
la repetición de f1200 tras el «por vos» de la cursiva (desviación 11). `/revisar` en §5.

**Determinismo:** f0500 → `622652b3d11fb4168fce5f54bdc0a259` y f1360 → `da80864bbbfa96942edcb724e24ffaa6`, cada
uno en dos procesos distintos (`out/qa/comunicaciones/determinismo.sh`).

**Entrega (17:19 → 17:33, tras dos intentos colgados por la suspensión de la máquina a las 08:45 y a las 11:20):**
`scripts/render-despierto.sh out/render-comunicaciones.log out/render-comunicaciones.sh` (mantiene la máquina despierta
mientras el render corre) → `out/demo-comunicaciones-2x.mp4` (2160×3840, 42,5 MB), `out/demo-comunicaciones.mp4`
(1080×1920, 13,2 MB) y `out/demo-comunicaciones-web.mp4` (1080×1920, yuv420p tv bt709 + faststart, 11,3 MB), los tres
de 50,05 s con AAC. El log registra un «browser crashed while rendering frame 1011, retrying» que Remotion resolvió
solo (el frame es determinista: los MD5 de arriba) y dos pasadas completas del render 2× seguidas (17:19→17:25 y
17:25→17:30); los tres mp4 salen de la segunda. `out/` está en `.gitignore`.

---

## 0. La cadena de datos, resuelta en el replay

`src/comunicaciones/estado.ts`, beat 1: la conversación con **dos entrantes sin responder** y una propuesta
pendiente en `DB.wa.propuestas` para ese teléfono (hoy Julián Betancur, 573156629034, `ac-1`), o reventar. Se
comprueba además que el hilo pregunta por la hora («las 3») y el ayuno, y que la propuesta contesta las dos (la
hora y «ayuno» en su texto): si el seed cambiara, el replay para con nombre de toma (encargo §3). Beat 4: aprobar
tiene que dejar un mensaje saliente **con `entregado`** (doble check) en ese hilo, o revienta.

---

## 1. Lo que se tocó fuera de `src/comunicaciones/`

Nada en la maqueta. `src/pieza/columna.ts` (`ocultarAutonomia`, compartido con DemoAgentico).
`scripts/medir-pt-comunicaciones.mjs` (medidas) y `scripts/voseo-restante.mjs` (pantallas de esta pieza).

---

## 2. Desviaciones (todas deliberadas, todas verificadas en still)

| # | Dice el encargo | Se hizo | Por qué |
|---|---|---|---|
| 1 | §4: acto 3 de 300 frames, cierre «comprimido a 60 frames, o se corre la tabla 60 frames y el cierre va completo. Decide con el still» | Se corre la tabla: acto 3 de **240** frames (360–600), 4 600–780, 5 780–1020, 6 1020–1260, 7 1260–1380, cierre 1380–1500 completo. | El cierre compartido anima logo, claim y CTA en 120 frames; a 60 el CTA a WhatsApp no llega a asentarse (regla absoluta del CTA). Los 60 frames se le quitan al acto 3, que a 240 sigue dejando leer la propuesta entera. |
| 2 | §3: «las cinco conversaciones del seed llegan todas sin responder, con su badge» | El replay pone `leido = null` a todos los entrantes en el beat 1. | El seed marca leídos los entrantes (`m()` en `seedComunicaciones`: `leido: dias(0, 9, 0)`), así que la bandeja del seed no trae badges. Con `leido = null` los badges salen del propio `SEL.conversaciones()` (Julián 2, Mariana 2, las demás 1) y `wa-abrir` los marca leídos de verdad al abrir el hilo. |
| 3 | §4 acto 1: «Los titulares te escriben por WhatsApp. Eso no va a cambiar.» | «Te escriben por WhatsApp. Eso no cambia.» (7 palabras) | `/revisar`: el hook en pantalla lleva máximo 8 palabras (skill `guionista`); la frase del encargo tiene 10. Misma regla que en DemoVentas y DemoPacientes. |
| 4 | §4 acto 1: «plano general… cinco conversaciones, todas con badge» | Plano general con cromo 45 frames y corte al encuadre de la lista (x 232→832) para el resto del acto. | A 0,65 los badges de 17 px quedan en 11 px: se ven como puntos, no se leen. En el encuadre de la lista (×1.8) se leen el nombre, la última línea y el número del badge. |
| 5 | Plantilla §3: encuadre columna | El hilo de WhatsApp se **angosta a 730 px** por post-proceso (`.inbox .col-hilo{max-width:730px}`) y se encuadra x 560→1300, y 143→883 (×1.46). | Es la columna de lectura de las otras piezas aplicada al hilo: a 860 px el texto de la propuesta quedaba en 17 px; a 730 en 20 px, con las dos burbujas entrantes, la tarjeta y el compositor en un solo cuadro. |
| 6 | §6: prohibido mostrar la barra de autonomía | `ocultarAutonomia`: la tarjeta «Autonomía de VetGPT» de Integraciones y la línea «número · nivel de autonomía» de la cabecera de la bandeja van ocultas. | El nivel no lo lee ninguna lógica de la app (NOTAS-MAQUETA, deuda). |
| 7 | §4 acto 5: «Clic en la pestaña de Correo… Corte al encuadre de la cabecera» | En f765 corte al **plano general** (la bandeja entera con cromo, como al abrir), el puntero va a la pestaña «Correo» y hace clic en f780; corte a la bandeja del correo en f795; en f900 push ×1.2 sobre la cabecera «valentina@laarboleda.co · Gmail». La banda cambia a «Y TU CORREO» en f780. | Las pestañas (y 48→86, x 260→390) no caben en el encuadre del hilo ni en el del correo junto al doble check; en la 1.ª pasada el corte iba en f720 y en f760 (still del encargo) ya no se veía el acuse. El plano general de un segundo muestra el gesto entero. |
| 8 | §4 acto 7: «encuadre sobre el aviso verde… literal» | La columna de Integraciones se angosta a 640 en el acto 7 (el aviso pasa a tres líneas) y la cámara hace ×1.3 sobre él. La banda lleva su primera oración literal: «VetGPT no responde solo, salvo que tú lo habilites.» | A 820 px el aviso ocupa el ancho entero y a ×1.3 se cortaba; a 640 cabe (832 < 860) y el texto queda en 21 px. El «vos» del aviso sale tuteado por `TUTEO_EXTRA`, igual que en pantalla. |
| 9 | §4: cortes internos | Cada clic va **15 frames antes** del beat que cambia la pantalla (`CLIC`/`CORTE` en `guion.ts`). | Lo aprendido en DemoVentas. |
| 10 | Plantilla §4: push lento, zoom a la acción | Pushes ×1.05 en lista e Integraciones; ×1.15 sobre el texto de la propuesta (acto 3) y ×1.2 sobre la cabecera del correo; **cámara fija** en el hilo (actos 2 y 4) y en la bandeja del correo. | Los encuadres van justos: un push recortaba las burbujas o el compositor (DemoPacientes, desviación 7). |
| 11 | — | La leyenda de la tarjeta «VetGPT no le escribe al titular hasta que usted apruebe» sale como «…hasta que tú apruebes»; «que ya usás» → «que ya usas»; «para que VetGPT escriba por vos» → «por ti» (`TUTEO_EXTRA`; en la tarjeta «Facturas y cobranza» va en cursiva y el patrón tiene que ser sólo «por vos», porque la cursiva parte el texto en dos nodos: 1.ª y 2.ª pasada lo dejaron pasar). | Tuteo (CLAUDE.md); la maqueta mezcla usted y vos en esas líneas. |
| 12 | Plantilla §3: microrrótulo en la fila del rótulo | Bajo la banda (y 1622), como en DemoVentas. | Rótulos largos chocaban con la pastilla. |

---

## 3. Locución (opcional, `CON_VOZ = false`)

| Acto | Frames | Locución |
|---|---|---|
| 1 | 0–120 | Los titulares te escriben por WhatsApp. Eso no va a cambiar. |
| 2 | 120–360 | Y ahora te llegan aquí, junto a la ficha del paciente. |
| 3 | 360–600 | VetGPT leyó el hilo y la ficha, y dejó la respuesta lista: la hora de la cita y el ayuno. |
| 4 | 600–780 | Nada sale hasta que tú lo apruebas. |
| 5 | 780–1020 | El correo de la clínica, en la misma pantalla. |
| 6 | 1020–1260 | Tu número, tu correo y tu calendario. Los que ya usas. |
| 7 | 1260–1380 | VetGPT no responde solo, salvo que tú lo habilites. |
| Cierre | 1380–1500 | Ningún veterinario debería volver a escribir una ficha. Escríbenos al WhatsApp. |

---

## 4. QA — stills (`out/qa/comunicaciones/`)

Los ocho frames del encargo más tres propios (f0165 el clic en la conversación, f0645 el clic en «Aprobar y
enviar», f0780 el clic en la pestaña «Correo»). ~50 s por still. Dos pasadas: la 1.ª dejó ver que en f0760 el
corte a las pestañas llegaba antes que el doble check (desviación 7) y el «por vos» de Integraciones
(desviación 11); la 2.ª cerró. Todos mirados uno por uno.

| Frame | Pide el encargo | Se ve | Veredicto |
|---|---|---|---|
| 0060 | Las cinco conversaciones con sus badges de sin leer | Encuadre de la lista: Ana (1, badge WA), Paula (1), Julián (2), Sara (1), Mariana (2). La app abre la primera conversación al entrar (Ana), con su propuesta pendiente asomando a la derecha. Sin la línea de autonomía. | ✓ |
| 0165 | — (propio) | El puntero sobre la fila de Julián, con el hover; los badges siguen. | ✓ |
| 0300 | El hilo con las dos preguntas entrantes, legibles | Hilo de Julián Betancur a 730 px: «Hola, ¿la limpieza dental de Rocco es hoy a las 3?» y «Y otra cosa, ¿tiene que llegar en ayunas?»; debajo, «PROPUESTAS DE VETGPT PENDIENTES» con la tarjeta y el compositor (placeholder tuteado). | ✓ |
| 0500 | La propuesta con el mensaje editable, legible, respondiendo las dos | Push ×1.15 sobre el campo: «Hola Julián. Sí, la limpieza dental de Rocco es hoy a las 3:00 p. m. Debe llegar con 12 horas de ayuno de comida; agua puede tomar hasta 2 horas antes. Te esperamos.»; la segunda pregunta sigue en cuadro, la primera en f0300. | ✓ |
| 0645 | — (propio) | El puntero sobre «Aprobar y enviar», con el hover. | ✓ |
| 0760 | La burbuja saliente en el hilo con **doble check** | El hilo de Julián: las dos preguntas y, debajo, la burbuja «mía» con la respuesta aprobada y «10:30 ✓✓»; el bloque de propuestas desapareció; el compositor abajo. | ✓ |
| 0780 | — (propio) | Plano general con cromo: la bandeja entera (Julián primero, sin badge; el resto con badge) y el puntero sobre la pestaña «Correo» (desviación 7). | ✓ |
| 0800 | — (propio) | La bandeja del correo recién abierta: pestañas, «valentina@laarboleda.co · Gmail», los cuatro correos y el abierto. | ✓ |
| 0900 | — (propio, la bandeja del correo entera) | Pestañas WhatsApp / **Correo**, «valentina@laarboleda.co · Gmail», Bandeja · 1 sin leer, los cuatro correos (VetLab, Mariana, Vetcol, Tuvetia) y el correo abierto. | ✓ |
| 0960 | La cabecera del correo con la cuenta y el proveedor | Push ×1.2 sobre «valentina@laarboleda.co · Gmail» (≈ 24 px) con las pestañas y la bandeja. | ✓ |
| 1200 | Las tarjetas de Integraciones con los logos a color y los estados | WhatsApp (Conectado, +57 320 555 0119), Facturas y cobranza (Incluido), Correo de VetGPT (Conectado · Gmail · valentina@laarboleda.co), Calendario (Conectado · Google Calendar). Sin la tarjeta de autonomía. | ✓ |
| 1360 | El aviso verde, legible y literal | Columna a 640 y ×1.3: «VetGPT no responde solo, salvo que tú lo habilites. Por defecto sugiere y espera tu aprobación; lo clínico nunca sale sin que lo apruebes, en ningún nivel.» (≈ 21 px), encima de «Integraciones». | ✓ |
| 1470 | Cierre | Logo, claim, CTA «Escríbenos al WhatsApp», «Buscamos 10 veterinarios · 0/10». | ✓ |

---

## 5. `/revisar` — líneas rojas, punto por punto

Sobre `TEXTOS` y `MICRORROTULO` de `guion.ts`, el cierre compartido (`src/demo/Cierre.tsx`) y la locución del §3.

| # | Línea roja | Veredicto | Nota |
|---|---|---|---|
| 1 | VetGPT nunca diagnostica ni firma | PASA | VetGPT redacta la respuesta a dos preguntas logísticas (hora y ayuno) y el vet aprueba; el acto 7 lleva literal el aviso de la app: no responde solo salvo que el vet lo habilite. |
| 2 | Cero métricas, testimonios o clínicas inventadas | PASA | Ningún número en la banda; los del seed (hora de la cita, 12 horas de ayuno) son datos de la ficha. |
| 3 | Nunca atacar la facturación | PASA | No se menciona (la tarjeta «Facturas y cobranza» de Integraciones sale como una más, sin comentario). |
| 4 | Nunca nombrar competidores | PASA | Ninguno. WhatsApp, Gmail y Google Calendar son canales que el vet ya usa, no competidores. |
| 5 | Nunca burlarse de lo clínico ni sugerir atajos | PASA | No hay contenido clínico. |
| 6 | Tuteo, a la persona | PASA | «te escriben», «te llegan», «tú lo apruebas», «los que ya usas», «tú lo habilites». El aviso, la leyenda de la tarjeta y las descripciones de Integraciones van tuteados por MAPA_TUTEO + TUTEO_EXTRA. |
| 7 | Grafía «Tuvetia» | PASA | Sólo en el cierre, correcta. |
| 8 | Privacidad en serio | PASA | No se menciona. |
| 9 | El sufrimiento del vet no es el gancho | PASA | El gancho es que el WhatsApp ya está donde trabaja. |
| 10 | CTA a WhatsApp | PASA | Cierre compartido completo (por eso se corrió la tabla: desviación 1). |

Prohibiciones propias del encargo (§6): no se afirma que VetGPT responda solo (el aviso literal dice lo
contrario), la barra de autonomía va oculta (desviación 6), no se filman automatizaciones ni el correo
respondiendo (la bandeja del correo se muestra y ahí para), ni competidores, tiempos o volúmenes ✓.
**Hook**: «Te escriben por WhatsApp. Eso no cambia.» = 7 palabras ✓ (la del encargo tenía 10: desviación 3).
Voseo: `node scripts/voseo-restante.mjs comunicaciones` → limpio en las cinco pantallas.
**Veredicto: LISTO PARA PUBLICAR.**

---

## 6. Para una segunda pasada

- Locución de Luciano + subtítulos quemados.
- Si el producto quiere que el seed traiga los entrantes sin leer, es un cambio de maqueta (`seedComunicaciones`).

## BLOQUEOS - noche del 8-sep

(ninguno hasta ahora)
