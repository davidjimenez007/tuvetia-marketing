# DemoPacientes · notas de producción

Encargo: `prompts/demo-pacientes.md`, leído sobre `prompts/_plantilla-demo-producto.md` y bajo los límites
de `public/app/NOTAS-MAQUETA.md`. Composición `DemoPacientes` (1080×1920 · 30 fps · **1500 frames**),
registrada en `src/Root.tsx` dentro de `<Folder name="Demos">`. Sólo escritorio. Voz: Luciano, carril
producto, sin locución grabada (`CON_VOZ = false`). Construida la noche del 8-sep-2026 sin David
(reglas de la noche: elegir y anotar, no preguntar).

Comandos:

```
npx remotion still DemoPacientes out/qa/pacientes/f0680.png --frame=680 --timeout=90000
node scripts/medir-pt-pacientes.mjs        # mide los PT de guion.ts por CDP (columna puesta, scroll de cada acto)
node scripts/voseo-restante.mjs pacientes  # voseo que queda en las 5 pantallas tras MAPA_TUTEO + TUTEO_EXTRA
bash out/qa/pacientes/determinismo.sh      # f0800 y f1320 en dos procesos → MD5 iguales
bash out/render-pacientes.sh               # render 2× → 1080 → copia web + sondas
npx remotion render DemoPacientes out/demo-pacientes-2x.mp4 --codec=h264 --crf=16 --scale=2 --timeout=90000
npx remotion ffmpeg -i out/demo-pacientes-2x.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a copy out/demo-pacientes.mp4
npx remotion ffmpeg -y -i out/demo-pacientes-2x.mp4 -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -crf 17 -preset medium -profile:v high -level 4.1 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -movflags +faststart out/demo-pacientes-web.mp4
```

---

## Estado al 8-sep-2026, 23:51 (entregada)

Construida esta noche sobre la máquina de `src/pieza/` (misma cadena que DemoVentas: `guion.ts` como datos,
`estado.ts` replay puro, `postproceso.ts` con la columna de lectura y los toasts dentro de lo visible).
`PT` medidos por CDP (`scripts/medir-pt-pacientes.mjs`). Voseo de las cinco pantallas revisado con
`scripts/voseo-restante.mjs pacientes` (limpio). Tres pasadas de stills (§4), las 13 tomas del encargo más
f0640 y f0760 propios; **determinismo**: f0800 → `e4f79ae2d7ec9a148b2ad9290b2dce6b` y f1320 →
`e0734c765f3e7a718c23d0ca2baf7fd2`, cada uno en dos procesos distintos. `/revisar` en §5.

**Entrega (23:41 → 23:51):** `out/render-pacientes.sh` → `out/demo-pacientes-2x.mp4` (2160×3840, 75,6 MB),
`out/demo-pacientes.mp4` (1080×1920, 22,1 MB) y `out/demo-pacientes-web.mp4` (1080×1920, yuv420p tv bt709 +
faststart, 19,2 MB), los tres de 50,05 s con AAC. `out/` está en `.gitignore`.

---

## 0. La cadena de datos, resuelta en el replay

`src/pacientes/estado.ts`, beat 1: Luna por nombre en `DB.pacientes`; sus consultas y notas; la nota que trae
`gateAlergia` (hoy `n-1`, consulta `c-1`) o reventar; la alergia severa registrada (Penicilina) o reventar; el
titular (`getO`) con teléfono (Mariana Osorio, `573104482210`). **Las dos notas de Luna nacen en borrador y
sus consultas en revisión** (ver desviación 1). `UI.gateOk = false`.

---

## 1. Lo que se tocó fuera de `src/pacientes/`

Nada en la maqueta. `src/pieza/columna.ts` (nuevo, compartido): columna de lectura, toasts dentro de lo
que la cámara deja ver (`visibleDe`), dock oculto; DemoVentas pasó a usarlo en la misma noche.

---

## 2. Desviaciones (todas deliberadas, todas verificadas en still)

| # | Dice el encargo | Se hizo | Por qué |
|---|---|---|---|
| 1 | §3: «el replay pone `n-1` en `draft`» | Se ponen en borrador **las dos** notas de Luna (`n-1` y `n-7`) y sus consultas en revisión | El seed trae dos notas aprobadas para Luna. Con sólo `n-1` en borrador, `n-7` (`c-9`) sigue aprobada y el botón «Informe para el titular» de la ficha arranca **activo** (toma la consulta más reciente con nota aprobada): el contraste deshabilitado → activo, que es el argumento del acto 6, no existiría. |
| 2 | §4 acto 4 / §5 beat 640: «el puntero hace clic en aprobar; no aprueba: sale el toast rojo» | El puntero llega a «Revisar y aprobar» y hace el gesto, pero **el botón está deshabilitado** por la guarda (`disabled` cuando `n.gateAlergia && !UI.gateOk`) y la app no reacciona; la cámara pasa a la alerta roja «Alergia severa · bloqueante… bloquea la aprobación de la nota hasta tu revisión» y a la casilla. No se emite ningún toast. | Así frena el producto de verdad: deshabilitando el botón. El toast rojo del handler sólo se dispara si la acción corre (teclado o consola), nunca con un clic real sobre el botón deshabilitado. Simular el toast habría sido filmar algo que la interfaz no hace. La frase del acto («Hasta que no lo confirmes, no aprueba») sigue siendo literal. |
| 3 | §5 beat 760: «`UI.gateOk = true` (equivale a marcar la casilla)» | Igual, en el frame del clic (f750): la casilla no desaparece, así que clic y cambio van juntos | La acción real `gate` lee `el.checked`; poner `UI.gateOk` es lo que ella hace. |
| 4 | §4: cortes internos; §5 beats en frames redondos | Cada clic que cambia la pantalla va **15 frames antes** del beat (`CLIC`/`CORTE` en `guion.ts`): aprobar f870 → aprueba f885; informe f1065 → diálogo f1080; enviar f1275 → envía f1290 | Lo aprendido en DemoVentas: si el botón desaparece en el frame del clic, el anillo queda pintado sobre la pantalla nueva. |
| 5 | Plantilla §3: encuadres | Los de DemoVentas: plano general (acto 1); columna de 820 (historia, ficha de vuelta, diálogo, WhatsApp); columna de lectura de 640 (consulta: badges, nota, guarda, aprobación). Post-proceso compartido (`src/pieza/columna.ts`): `.pagina>*{max-width}`, toasts dentro de lo visible, dock oculto | Mismos motivos que en DemoVentas: un párrafo de 1144 px no cabe legible en 1080 de ancho; el dock comparte rincón con los toasts (el encargo pide que el toast no quede tapado). |
| 6 | Plantilla §3: microrrótulo en la fila del rótulo | Bajo la banda (y 1622), como en DemoVentas | Rótulos largos («LA REDACTÓ VetGPT», «NO ENTRA SIN TI») chocaban con la pastilla. |
| 7 | Plantilla §4: push lento, zoom a la acción (×1.2–1.3) | Pushes de ×1.0 → ×1.05, **uno por acto**, con foco en el centro del encuadre (sin paneo); ×1.2 sólo sobre el diálogo del informe (540 px) y ×1.1 sobre la burbuja del hilo. Los cambios de scroll largos (del botón a la guarda, 1230 px) van por corte. | La columna llena el encuadre (820 en 860, 640 en 680): en la 1.ª pasada de stills, a ×1.2–1.25 la casilla de la guarda quedaba partida en el borde (f0760, f0800), el botón «Guardar cambios» y el rótulo «Historia de consultas» se cortaban (f0900, f0990). A ×1.05 la columna cabe entera y el cuerpo queda en ≈ 25 px (lectura) y ≈ 20 px (columna). |
| 8 | Plantilla §3: encuadre columna para todo lo que no es plano general | El hilo de WhatsApp (acto 7) lleva su propio encuadre `hilo` (x 700→1440, y 100→840, ×1.46): la bandeja no es una `.pagina` sino lista + hilo a todo el ancho, y la burbuja del informe (x 746→1408) quedaba cortada por el borde derecho de la columna (f1320 de la 1.ª pasada). | El informe es lo que hay que leer; el encuadre lo deja entero y la lista de conversaciones queda fuera, que en este acto no aporta. |
| 9 | §5 beat 120: «la historia arriba, scroll hasta el plan» | Un solo scroll en f120 que centra la primera consulta de la historia, abierta y entera (431 px caben en el encuadre); sin el segundo scroll al plan. | El scroll animado «desde arriba» de la primera versión saltaba la página al tope en f240 (still: la cabecera de la ficha en vez de la historia). La consulta entera ya muestra S/O/A/P con sus marcadores de cita. |
| 10 | §4 acto 1: «Todo lo de tu paciente, en una sola pantalla.» | «Todo lo de tu paciente, en una pantalla.» (8 palabras) | `/revisar`: el hook en pantalla lleva máximo 8 palabras (skill `guionista`); la frase del encargo tiene 9. Se quitó «sola», que no aporta sentido. Es la misma regla que tumbó el hook de DemoVentas. |
| 11 | Plantilla §3: encuadre lectura y0 134 | y0 96 (misma altura, 680) | La cabecera de la consulta («Luna · Perro · Prurito y otitis recurrente») quedaba partida por el borde superior en f0420. |

---

## 3. Locución (opcional, `CON_VOZ = false`)

| Acto | Frames | Locución |
|---|---|---|
| 1 | 0–120 | Todo lo de Luna en una sola pantalla: alergias, medicación, vacunas y su historia. |
| 2 | 120–360 | Cada consulta queda escrita en S, O, A y P, con la literatura que la respalda. |
| 3 | 360–600 | Esta nota la redactó VetGPT con lo que se dijo en la consulta. Es un borrador. |
| 4 | 600–840 | Luna es alérgica a la penicilina, y el sistema lo sabe: no te deja aprobar hasta que confirmes que revisaste el plan. |
| 5 | 840–1020 | Tú firmas. Recién ahí la nota entra a la historia clínica. |
| 6 | 1020–1260 | Y lo que el dueño necesita saber ya está escrito, en lenguaje llano. |
| 7 | 1260–1380 | Le llega por WhatsApp, sin que copies nada. |
| Cierre | 1380–1500 | Ningún veterinario debería volver a escribir una ficha. Escríbenos al WhatsApp. |

---

## 4. QA — stills (`out/qa/pacientes/`)

Tres pasadas (`pasada1.sh` → `pasada3.sh`, ~33 s por still). La 1.ª tumbó la cámara (pushes ×1.2–1.25 cortaban la
columna: desviación 7), el scroll del acto 2 (desviación 9) y el encuadre del hilo (desviación 8); la 2.ª confirmó
los actos 2–5 y dejó ver la cabecera partida en la lectura (desviación 11) y el hook de 9 palabras (desviación 10);
la 3.ª cerró. Todos los stills se miraron uno por uno.

| Frame | Pide el encargo | Se ve | Veredicto |
|---|---|---|---|
| 0060 | Ficha de Luna completa, con la banda roja de alergia | Plano general con cromo: cabecera, banda «Alergia severa: Penicilina…», Alergias / Medicación / Vacunas, plan, adjuntos, citas. «Informe para el titular» **deshabilitado** (gris). Hook de 8 palabras. | ✓ |
| 0240 | Bloques S/O/A/P legibles, con marcadores de cita | La primera consulta de la historia abierta y entera: S, O, A (con `[1]` `[2]`), P; badge «Borrador» en las dos consultas. | ✓ |
| 0420 | Los dos badges «Redactada por VetGPT» y «Borrador» | «Borrador — requiere aprobación» · «Redactada por VetGPT» · «Evidencia alta»; debajo, la alerta roja «ALERGIA SEVERA · BLOQUEANTE» con la casilla vacía. Cabecera «Luna · Perro · Prurito y otitis recurrente» entera. | ✓ |
| 0640 | — (propio) | El puntero sobre «Revisar y aprobar» **deshabilitado**; el plan y la línea roja de alergias registradas, legibles. Es el freno (desviación 2). | ✓ |
| 0680 | El toast rojo de la guarda, legible | No hay toast (desviación 2): mismo plano que f0640, el botón sigue deshabilitado y la frase de la banda ya completa. | ✓ (desv.) |
| 0760 | — (propio) | La casilla marcada con el anillo del clic, la alerta entera. | ✓ |
| 0800 | La casilla de la guarda marcada | Casilla ✓, puntero al lado, alerta y badges enteros. | ✓ |
| 0900 | Toast «Nota aprobada y añadida a la historia clínica» | Toast entero abajo a la derecha de la columna; el botón pasó a «Nota aprobada», «Informe para el titular» activo, aparece «Facturar lo recetado». Plan con «penicilina» resaltada. | ✓ |
| 0990 | La ficha con la consulta en badge «Aprobada» | Historia de consultas (2): la primera con badge verde «Aprobada» y sus S/O/A/P; la segunda sigue «Borrador». | ✓ |
| 1060 | El botón «Informe para el titular» **activo** | Cabecera de la ficha con los tres botones; el puntero sobre «Informe para el titular», activo. | ✓ |
| 1180 | El diálogo con el texto en lenguaje llano, legible | «Informe para el titular»: «Hola Mariana. Te cuento cómo le fue a Luna…», «Qué encontramos», «Qué creemos que tiene», «Qué hay que hacer en casa»; texto generado por la app (`#informe-texto`). Botón «Enviar por WhatsApp». | ✓ |
| 1320 | El mensaje en el hilo de WhatsApp de la titular | El hilo de Mariana: la burbuja del informe (la última, «mía») entera, «Ver ficha del titular» arriba, toast «Informe enviado por WhatsApp · Ver». | ✓ |
| 1440 | Cierre | Logo, claim, CTA «Escríbenos al WhatsApp», «Buscamos 10 veterinarios · 0/10». | ✓ |

Propias del encargo: el botón del informe se ve deshabilitado en f0060 y activo en f1060 ✓; en f0680 no hay
toast que tapar (desviación 2), y el dock va oculto en toda la pieza ✓; el texto de f1180 lo genera la app ✓.

---

## 5. `/revisar` — líneas rojas, punto por punto

Sobre `TEXTOS` y `MICRORROTULO` de `guion.ts`, el cierre compartido (`src/demo/Cierre.tsx`) y la locución del §3.

| # | Línea roja | Veredicto | Nota |
|---|---|---|---|
| 1 | VetGPT nunca diagnostica ni firma | PASA | «La escribe él» (la nota, en borrador); «Tú firmas. Recién ahí entra a la historia»; «NO ENTRA SIN TI». El vet aprueba; el badge «Borrador — requiere aprobación» sale en cámara. |
| 2 | Cero métricas, testimonios o clínicas inventadas | PASA | Ningún número en la banda; los de la app salen del seed. |
| 3 | Nunca atacar la facturación | PASA | No se menciona. |
| 4 | Nunca nombrar competidores | PASA | Ninguno. |
| 5 | Nunca burlarse de lo clínico ni sugerir atajos | PASA | La pieza muestra lo contrario: la guarda de alergia frena la aprobación. |
| 6 | Tuteo, a la persona | PASA | «tu paciente», «confirmes», «Tú firmas», «copies». «El dueño» en el acto 6 es el titular, no el vet. |
| 7 | Grafía «Tuvetia» | PASA | Sólo en el cierre, correcta. |
| 8 | Privacidad en serio | PASA | No se menciona. |
| 9 | El sufrimiento del vet no es el gancho | PASA | El gancho es la ficha completa. |
| 10 | CTA a WhatsApp | PASA | Cierre compartido: «Escríbenos al WhatsApp». |

Además: **hook** — «Todo lo de tu paciente, en una sola pantalla.» son 9 palabras en pantalla (máx. 8, skill
`guionista`) → **REVIENTA** → se quitó «sola» (desviación 10): «Todo lo de tu paciente, en una pantalla.» (8).
Voseo en las pantallas de la pieza: `node scripts/voseo-restante.mjs pacientes` → las cinco pantallas
limpias tras MAPA_TUTEO + TUTEO_EXTRA (los dos «candidatos» que lista, «revisé» y «guardará», no son voseo).
**Veredicto: LISTO PARA PUBLICAR** con el hook corregido.

---

## 6. Para una segunda pasada

- Locución de Luciano + subtítulos quemados.
- Si el producto quiere que el clic sobre «aprobar» con la guarda pendiente muestre el toast rojo (en vez
  de un botón deshabilitado), es un cambio de maqueta, no de video.

## BLOQUEOS - noche del 8-sep

(ninguno hasta ahora)
