# ExplainerRAG · notas de producción

Encargo: `prompts/explainer-rag.md` **+ orden de cambio v2** (`prompts/explainer-rag-v2.md`,
que se lee junto con el encargo y manda sobre él en lo que toca). Composición `ExplainerRAG`
(1080×1920 · 30 fps · **1560 frames**), registrada en `src/Root.tsx` dentro de `<Folder name="Explainers">`.
Voz: `marca` (sin locución).

Comandos:

```
npx remotion still ExplainerRAG out/qa/f0760.png --frame=760 --timeout=90000
npx remotion render ExplainerRAG out/explainer-rag-2x.mp4 --codec=h264 --crf=16 --scale=2 --timeout=90000
npx remotion ffmpeg -i out/explainer-rag-2x.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a copy out/explainer-rag.mp4
```

Copia para publicar (`out/explainer-rag-web.mp4`): el máster y la bajada salen en `yuvj420p` (rango completo,
bt470bg), que el reproductor por defecto de Windows no abrió. Se convierte a rango limitado bt709 con
`faststart`, que es lo que esperan Instagram, WhatsApp y LinkedIn:

```
npx remotion ffmpeg -y -i out/explainer-rag-2x.mp4 -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -crf 17 -preset medium -profile:v high -level 4.1 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -movflags +faststart out/explainer-rag-web.mp4
```

Cambiar sólo el audio (lo que se hizo para la pista funk, §2.3) no necesita volver a renderizar frames: se
renderiza la mezcla sola (`--codec=wav`, ~2 min contra ~10 del render 2×) y se pega sobre el video anterior
con el stream de video copiado tal cual (`-c:v copy`; se verificó con md5 del h264 crudo, viejo = nuevo):

```
npx remotion render ExplainerRAG out/explainer-rag-audio.wav --codec=wav --timeout=90000
npx remotion ffmpeg -y -i out/v2-bellini/explainer-rag-2x.mp4 -i out/explainer-rag-audio.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -shortest out/explainer-rag-2x.mp4
# igual para explainer-rag.mp4 (320k) y explainer-rag-web.mp4 (192k, -movflags +faststart)
```

Entrega v2 del 8-sep-2026: `out/explainer-rag.mp4` · 1080×1920 · 30 fps · 52,05 s · H.264 CRF 16 + AAC ·
15.4 MB (el máster 2× de 2160×3840 queda en `out/explainer-rag-2x.mp4`, 44.1 MB;
la copia para redes en `out/explainer-rag-web.mp4`, 14.3 MB; render 2× en ~10 min). La entrega v1 (50 s, 1500 frames) quedó en `out/v1/`. `out/` está en
`.gitignore`: los mp4 y los stills no viajan con el commit.

**Entrega v3 del 8-sep-2026 (misma imagen, otra música):** los mismos tres archivos, ahora con la pista funk
de David (§2.3), mezcla a −23,0 LUFS (Bellini quedaba a −22,4). Los frames son los de la v2, byte a byte;
la v2 con Bellini quedó en `out/v2-bellini/`.

---

## 0. Qué cambió con la orden v2 (resumen)

| Orden v2 | Hecho |
|---|---|
| §A `CORPUS = 120000`, rótulo `FUENTES VETERINARIAS` | `src/explainer/guion.ts` y `Esquema.tsx`. `../CLAUDE.md` actualizado («120.000 fuentes veterinarias»). `contenido/2026-07/006-corpus-61540/` **no se tocó** (ver §2, desviación v2-13). |
| §B La repregunta en la maqueta | Cinco parches a `public/app/tuvetia-app.html` (ver §1.3), verificados a mano en un navegador real antes del replay (§1.4). |
| §C Línea de tiempo nueva, 1560 frames | `guion.ts` (actos, cámara, cursor, toques, scroll, tecleo), `estado.ts` (beats), `Titulo.tsx` (nuevo), `Esquema.tsx`, `MarcoEscritorio.tsx`, `ExplainerRAG.tsx`, `Banda.tsx`, `Sonido.tsx`. |
| §C.1 Título | `Titulo.tsx`: dos líneas, Archivo 700 108 / 52, cascada `<Entra>` gap 4 · y 24 · d 26, sale por opacidad f110–120. La línea 2 cabe en una sola línea a 52 px (still f0060). |
| §C.2 El contexto | Chip y diálogo reales, por sus acciones (`selector-contexto`, `elegir-contexto`); contexto **antes** de la pregunta. Paciente de la nota citada verificado = `p-1` Luna (consulta `c-1`, nota `n-1`). |
| §C.3 El replay de la repregunta | Beats 600/630/690/735/960 en `estado.ts`; el mensaje de repregunta se queda en el hilo. |
| §D Líneas rojas | §5 de estas notas. |
| §E QA | 14 stills nuevos + 4 líneas de checklist, §4. |

---

## 1. Parches a la copia de la app (`public/app/tuvetia-app.html`)

Los del demo anterior (reloj congelado, mulberry32, `SIM` no-op, animaciones apagadas, `nav` síncrono,
`window.app`) no se tocaron. Todas las anclas se localizaron por grep en el momento de parchar: los
números de línea de los prompts están corridos (el archivo crece con cada cambio).

### 1.1 `window.app` expone `responderVetGPT` y `repintarChat` (encargo §2.2.1)

Con comentario `PARCHE DEMO (ExplainerRAG)`. El replay arma las respuestas del asistente con lo que
devuelve `responderVetGPT(pregunta)`; `repintarChat` queda expuesto como pide el encargo, aunque el
replay no lo necesita: cada frame pinta una sola vez con `app.nav(ruta, true)`.

### 1.2 `marcarTexto` resuelve `*itálica*` (encargo §2.2.2)

`s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')`, después de las negritas y antes de las citas. Sin esto
`*Malassezia*` salía a cámara con los asteriscos crudos.

### 1.3 La repregunta (orden v2 §B) — función real, con los patrones de la maqueta

| Pieza | Dónde quedó (l. al parchar) | Qué |
|---|---|---|
| §B.1 datos | l. 8120, justo antes del comentario «El motor de respuestas» | `const REPREGUNTAS = { malassezia: { texto, campos: [especie, recurrencia] } }`. `responderVetGPT` **no se modificó**. |
| §B.3 render | l. 7948, en `MensajeChat`, entre el bloque de `m.texto` y `m.accion` | El bloque `.repreguntas` con `.rotulo`, `.filaw` y botones `.sug` (`data-act="repregunta" data-arg="id:opción"`), `.elegida` sobre la opción elegida. |
| §B.3 CSS | l. 3967, al final del `<style>`, antes del `PARCHE DEMO` | `.repreguntas { … }` y `.sug.elegida { … }`. Sólo esas dos clases nuevas. |
| §B.4 acción | l. 10323, junto a `"chat-sug"` en `ACTIONS` | `"repregunta"`: parte `id:opción`, marca `m.elegidas[id]` en el último mensaje y repinta. |
| §B.5 exponer | l. 11058, `window.app` | `responderVetGPT, repintarChat, REPREGUNTAS,`. |

Las dos preguntas (especie y recurrencia) son las que cambian el manejo en la rama
`/malassezia|otitis/`: la respuesta real dice «casi siempre hay una causa de base» y «tratar sólo el
hongo garantiza la recaída».

### 1.4 Verificación a mano (§B.6), antes del replay

Sin Playwright: se abrió la copia en el `chrome-headless-shell` que trae Remotion
(`node_modules/.remotion/…`) por el protocolo de depuración de Chrome (script de sesión, fuera del
repo), viewport 1440×900, `login-demo`, `/dashboard/asistente`, pregunta enviada, mensaje de repregunta
empujado y **clics reales** (`element.click()`, por el listener delegado de la app) sobre «Perro» y
«Recurrente». Resultado:

- Se pintan los dos rótulos («¿Especie?», «¿Primer episodio o recurrente?») y los cuatro botones.
- Tras los clics: `m.elegidas = { especie: "Perro", recurrencia: "Recurrente" }`, dos `.sug.elegida`,
  fondo `rgb(230,242,238)` (`--accent-soft`), borde `rgb(18,133,106)` (`--accent`), peso 500.
- A 540×960 el bloque cabe en la burbuja (0 botones fuera) y el chip sigue diciendo «Luna».
- Capturas: `out/qa/mano-dialogo.png`, `mano-repregunta.png`, `mano-elegidas.png`, `mano-movil.png`.

La misma sesión midió los puntos fijos del guion: la fila de Luna en el diálogo abierto
(centro en 0.5, 0.4069 del viewport) y el botón de enviar del hero con el chip en «Luna»
(0.6743, 0.5496: **no se movió** respecto a la primera versión).

---

## 2. Desviaciones (todas deliberadas, todas verificadas en still)

### 2.1 Nuevas con la orden v2

| # | Dice la orden / el encargo | Se hizo | Por qué |
|---|---|---|---|
| v2-1 | §C acto 2: encuadre de columna, cursor al chip, clic, diálogo, clic en Luna (sin cámara) | Push 1.0 → **1.2** sobre el diálogo (f155–175), quieto hasta f238, vuelta a 1.0 en f240–260 | A escala 1 del encuadre el cuerpo del diálogo queda en ~16 px sobre el lienzo. El diálogo mide 720 de los 888 px del encuadre: 1.2 es el máximo que lo deja entero (still f0180). |
| v2-2 | §C acto 2: «hace clic en f240; el diálogo se cierra» | Clic en f240 **sin** `active-sim`; la fila lleva punto de repuesto (0.5, 0.4069) | `elegir-contexto` cierra el diálogo en el mismo frame: la fila ya no existe cuando se aplica el clic (mismo recurso que `PT.enviarHero`, encargo §4.1). El puntero viaja a la fila real (f165–200) mientras el diálogo está abierto. |
| v2-3 | §3 del encargo: banda entre y 1370 y y 1670 | Banda en **y 1330–1610** (280 px); relleno del hilo móvil 150 px de app | En móvil el compositor (y 1615–1685) quedaba bajo el scrim y el chip «Luna» que pide la checklist §E (f0620) no se veía. Con la banda 40 px más arriba, el compositor y su chip quedan libres en todos los actos de móvil (stills f0620, f0760, f1080, f1400). Sigue dentro de la zona segura. |
| v2-4 | §4.5: frase de la banda en Archivo 700 62 | Cuerpo **adaptativo**: 62 hasta 54 caracteres, 56 hasta 68, 50 más largas | Las dos frases nuevas de §C («Antes de responder, pregunta. Así la respuesta le queda a tu caso.» y «Evitamos las alucinaciones: cada respuesta se apoya en fuentes que puedes abrir.») no caben a 62 en las tres líneas que admite la banda. Comprobado en f0700/f0760 (56) y f0880 (50). |
| v2-5 | §C.3: en f600 `push { rol, texto, repregunta }`; `CHAT.estado = "libre"` | El texto de la repregunta **se escribe** f600–630 (por palabras, con caret); los dos campos aparecen y el estado pasa a «libre» en f630 | Es como entra todo lo que dice VetGPT en la pieza (respuesta, abstención): un mensaje que aparece entero de golpe rompía la gramática. 30 frames de diferencia; el toque en «Perro» (f690) ya tiene los botones desde f630. |
| v2-6 | §C acto 8 (120 frames): toque, scroll hasta «Referencias citadas», zoom 1.4; §E: en f1260 la tarjeta con título, revista, año | Toque en **f1245**, ruta a la consulta en **f1260** con la tarjeta ya centrada (scroll sin animar), zoom 1.4 f1275–1305, vuelta a 1.0 f1305–1320 | Encargo §4.5: sin clics mientras un texto entra; la banda «Título, revista, año…» termina de entrar en f1243. Con 120 frames y el still f1260 exigiendo la tarjeta, el scroll animado no cabía: se llega con la tarjeta centrada. |
| v2-7 | Encargo §3.2: push de tecleo con foco en el compositor | Foco en `PT.compositorAlEnviar` (0.503, 0.5496) durante **todo** el push (f310–430), no sólo al enviar | Con foco en el textarea el botón de enviar quedaba cortado (primera pasada v2, f0430). El punto intermedio deja ver el inicio de la pregunta y el botón (still f0430). |
| v2-8 | §C: «el cursor va al chip… clic en f150» | Además, `.hover-sim` sobre el chip f142–150 y sobre el botón de enviar f438–450 | `.ctx-chip:hover` y `.redondo.enviar:hover` existen en la copia (sólo cambian el fondo, sin lift). Encargo §4.3. |
| v2-9 | §C.2: «expón `abrirSelectorContexto` en `window.app` si te hace falta» | No se expuso: el replay llama `ACTIONS["selector-contexto"]()` y `ACTIONS["elegir-contexto"](id)` | Ya estaban al alcance por `ACTIONS`, y así el replay pasa por el mismo código que un clic real (incluido el vaciado del hilo). |
| v2-10 | §C.2: el paciente es Luna (`p-1`) | `PACIENTE_CONTEXTO = "p-1"`; el replay resuelve la nota con citas → consulta → paciente y usa **ese** id para el contexto, la lista filtrada y la fila del cursor (`tramosCursor(ctx)`) | Verificado: nota `n-1` → consulta `c-1` → `p-1` Luna. Si el seed cambiara, manda la nota (se avisa por consola) y el cursor la sigue; sólo el punto de repuesto del clic quedaría medido para la fila de Luna. |
| v2-11 | Encargo §4.3: caret `frame % 30 < 15` | `CARET_F0 = 600` y módulo positivo | Con `%` de JS un frame anterior a `CARET_F0` da negativo y el caret queda fijo. 990 − 600 = 13·30 y 1330 − 600 ≡ 10: la respuesta y la abstención arrancan con el caret encendido. |
| v2-12 | §C: acto 4 f480–500 «vuelta al plano general» | Corte seco al plano general en f480 (la cámara de columna ya volvió a 1.0 en f450–470) | Igual que el encargo §3.2 («corta, no hace zoom desde el plano general»); la ventana se encoge f500–530, el celular sube f530–600, la ventana sale por opacidad f588–600. |
| v2-13 | §A: `contenido/2026-07/006-corpus-61540/` no se toca | No se tocó. Tampoco `calendario.md`, `publicacion/estrategia-linkedin.md`, `publicacion/social/cards.js` y `contenido.js`, `contenido/lote-00-voz/lote-00.md` ni `src/demo/GUION-ESCENA-ATHOS.md`, que también dicen 61.540 | La orden sólo pide `CLAUDE.md`. Quedan listados para que David decida; el calendario enlaza la carpeta 006 por nombre. |

### 2.2 Del encargo original, que siguen vigentes (frames actualizados)

| # | Dice el prompt | Se hizo | Por qué |
|---|---|---|---|
| 1 | §4.2: keyframes `{f, fx, fy, s}` | `{f, s, foco: Blanco}` | Es la forma real de `src/demo/Camara.tsx` (`Blanco = {sel?, texto?, x?, y?}`). |
| 2 | §3.1: ventana 936×585 con barra | 936×609: app a 0.65 (585) + barra 24 | §2.1 fija el viewport en 1440×900. |
| 3 | §0 mp4 1080×1920 · §10 `--scale=2` | Render 2× y bajada con `npx remotion ffmpeg` (lanczos, CRF 16) | Sólo así se cumplen las dos líneas. |
| 4 | §3.2: la cámara vuelve a 1.0 en 20 frames al enviar | f450–470 | El envío es f450. |
| 5 | §2.4: «corta por palabras» | Pregunta por caracteres; repregunta, respuesta y abstención por palabras seguras | El textarea no pasa por `bloquesRicos`; el corte seguro no parte `[n]`, `**`, `*` ni viñetas. |
| 6 | §2.4: escribir `CHAT.mensajes`, no `enviarChat` | El mensaje del vet va por `app.enviarChat` (las dos preguntas) | Fija `PENSANDO_DESDE`; sin eso, con el reloj congelado, la fila dice «Sigo en ello…». |
| 7 | §4.1: clic con `.active-sim` sobre el botón | Clic en punto fijo `PT.enviarHero` (0.6743, 0.5496), sin `.active-sim` | El compositor se muda del hero al pie en el frame del clic. Re-medido con el chip en «Luna»: igual. |
| 8 | §5: «toque sobre la consulta que tiene nota con citas» | Antes del toque, `FL.consultasQ` = «Luna» | La lista agrupa por paciente y sólo abre el primer grupo. |
| 9 | §4.3: hover con lift | `.hover-sim` sin lift | Las reglas reales sólo cambian el fondo. |
| 10 | §2.4: `seedDemo()` + `login-demo` | Sólo `login-demo` | Ya siembra; la doble siembra era el costo más alto del frame. |
| 11 | §3.3: `staticFile` de audio | `MUSICA` y `SFX_TECLEO` como data-URI (`src/demo/audioData.ts`) | Windows: `localhost` → `::1`. |
| 12 | §9: textarea móvil sin clip | Ya no aplica: la segunda pregunta no se teclea (orden v2 §C) | El único tecleo es en escritorio, a 1.62. |
| 13 | §3 capa 8: microrrótulo arriba a la derecha (y 240) | A la derecha, en la fila del rótulo de la banda (y ≈ 1364) | En y 240 tapaba la burbuja de la pregunta. |
| 14 | §5: celular con `easeTuvetia` | `Easing.inOut(Easing.cubic)` | Simétrica: a mitad de la subida el celular está a mitad de lienzo. |
| 15 | — | En móvil `#hilo-chat` gana `padding-bottom` (150 px de app) | Lo último que se escribe queda por encima de la banda. |
| 16 | §5: zoom 1.4 sobre la primera entrada | Foco en el ordinal (`li .av`) | Centrado en el `li` se cortaba el inicio del título. |

Refactors al demo (sin cambiar su comportamiento; `DemoSaaS` f990 antes/después del refactor v1 y tras el
parche v2 del HTML: **mismo MD5 `f9e84397…`**):

- `src/demo/Camara.tsx`: `tramoCamara`, `escalaCamara`, `transformCamara({kfs, app, vista})`.
- `src/demo/Cursor.tsx`: `resolverBlanco(…, dims)` y `estadoCursorDe(frame, doc, {tramos, clics, dims})`.
- `src/demo/Cierre.tsx`: props `logo/claim/cta/micro/gap`. `src/demo/estado.ts`: `resetEstado` exportada.
- `Grano` en `src/motor/Grano.tsx`.

### 2.3 Cambio de pista (8-sep, tarde, pedido de David)

David cambió la música por `prompts/Musica/alexguz-funk-amp-breakbeat-upbeat-advertising-happy-cook-541097.mp3`
(alexguz, Pixabay 541097; 124,8 s, 256 kbps, sin etiqueta de BPM). Sólo cambia el audio: los frames
no se tocaron (la entrega anterior quedó en `out/v2-bellini/`).

| # | Dice el encargo | Se hizo | Por qué |
|---|---|---|---|
| v3-1 | §3.3: `public/musica/pista-corta.mp3` | `public/musica/pista-funk-120.mp3`: la pista nueva recortada a 58 s (`-t 56` antes del atempo) y a 192 kbps; el data-URI vive en `src/explainer/audioData.ts` (`MUSICA_FUNK`, 1.8 MB), generado por `scripts/audiodata-explainer.mjs`. `src/demo/audioData.ts` no se toca: `DemoSaaS` sigue con Bellini. | Pedido de David. Se recorta por lo mismo que la vieja (la pieza dura 52 s; 125 s completos serían 5.3 MB de string en el bundle). |
| v3-2 | §3.3: 120 BPM, cortes en múltiplos de 15 frames | La pista está a **125,0 BPM** (medida por autocorrelación de onsets, validada con Bellini = 120,0). Se lleva a 120 con `atempo=0.96` (estira 4 %, sin cambiar el tono). Verificado sobre el mp3 final: golpe principal a 6 ms del múltiplo de 15 frames (Bellini: 11 ms). | Sin esto los cortes y los cambios de acto (múltiplos de 60) caen fuera del beat durante toda la pieza. Si David prefiere el tempo original, quitar `-af atempo=0.96` en el comando del script y regenerar. |
| v3-3 | §3.3: `<Audio>` a 0.35 | `VOL_MUSICA = 0.21` | La pista funk suena a −9,0 LUFS integrados (pico real +1,3 dBTP: clipea al decodificar); Bellini a −13,2. 0.21 compensa los 4,2 dB y deja la música en la mezcla a ≈ −22,5 LUFS, como estaba (−22,3), con el tecleo por encima. Para que suene más presente, subir la constante, no el mp3. |

---

## 3. Locución (opcional, `CON_VOZ = false`)

Cableado listo en `ExplainerRAG.tsx`. Si se activa: subtítulos quemados y el mp3 a data-URI en Windows.
Texto cuadrado a los nueve actos, en tuteo, sin afirmar nada que no esté en pantalla:

| Acto | Frames | Locución |
|---|---|---|
| 1 | 0–120 | VetGPT: una IA especializada para veterinarios, dentro de tu historia clínica. |
| 2 | 120–300 | Le preguntas en general, o sobre un paciente tuyo. |
| 3 | 300–480 | Como le preguntarías a un colega: qué dice la literatura sobre otitis por Malassezia. |
| 4 | 480–600 | Y la misma conversación te sigue al celular. Es el mismo hilo. |
| 5 | 600–780 | Antes de responder, pregunta: especie, primer episodio o recurrente. Así la respuesta le queda a tu caso. |
| 6 | 780–960 | Busca en ciento veinte mil fuentes veterinarias. Cada respuesta se apoya en fuentes que puedes abrir. |
| 7 | 960–1200 | Lo que se apoya en literatura trae su marca. |
| 8 | 1200–1320 | Y la marca lleva a la referencia: título, revista, año. Puedes ir al artículo. |
| 9 | 1320–1440 | Cuando no tiene fuente, lo dice. Prefiere abstenerse antes que inventar una. |
| Cierre | 1440–1560 | Ningún veterinario debería volver a escribir una ficha. Escríbenos al WhatsApp. |

---

## 4. QA (orden v2 §E) — los 14 stills, en `out/qa/`

Dos pasadas. La primera reventó dos cosas (el botón de enviar cortado en f0430; el compositor móvil, y
con él el chip «Luna», bajo la banda en f0620): las desviaciones v2-3 y v2-7 son sus arreglos. La
segunda pasada, con el mismo comando por frame, pasa completa:

| Still | Qué se ve | Estado |
|---|---|---|
| f0060 | Título completo sobre la ventana de escritorio, grafía `VetGPT`; la ventana en plano general con el hilo vacío. | ✓ |
| f0180 | Diálogo «Contexto de la conversación» abierto, «Consulta general» marcada y la lista de pacientes (Luna primera); puntero en camino a Luna; tuteo en la bajada («Elige con qué paciente quieres…»). | ✓ (v2-1) |
| f0270 | El chip del compositor diciendo **Luna** con el hilo vacío (hero), sugerencias tuteadas («Resume la ficha de Luna», «Agenda un control…»). | ✓ |
| f0430 | La pregunta completa en el compositor, legible (~30 px), el botón de enviar entero y el puntero en camino. | ✓ (v2-7) |
| f0555 | Ventana encogida arriba (hilo con la pregunta y «VetGPT está pensando…»), frase y `EL MISMO HILO` en el centro, celular subiendo por abajo. | ✓ |
| f0620 | Móvil a sangre: la pregunta en el hilo, la repregunta escribiéndose, el chip **Luna** en el compositor, debajo de la banda. | ✓ (v2-3) |
| f0700 | Bloque de repregunta con los dos campos y sus cuatro opciones; «Perro» ya marcada (toque f690). | ✓ |
| f0760 | «Perro» y «Recurrente» en menta con borde `--accent`; las no elegidas en blanco. | ✓ |
| f0880 | Esquema: retícula completa, contador corriendo (119.472 → 120.000), rótulo `FUENTES VETERINARIAS`, las dos marcas en menta, `ESQUEMA — NO ES LA INTERFAZ`; banda de tres líneas a 50 px. | ✓ (v2-4) |
| f1080 | Respuesta a medio escribir con caret; *Malassezia* en itálica; `[1]` en pastilla; sin `[` ni `**` partidos; la repregunta elegida arriba en el hilo. | ✓ |
| f1170 | Zoom 1.35 sobre la pastilla `[1]`. | ✓ |
| f1260 | «Referencias citadas (2)» con título, revista, año, locus y «Abrir artículo», completos; «Recuerda el contexto de **Luna**» debajo. | ✓ (v2-6) |
| f1400 | Abstención completa con las tres sugerencias («Ponte al día con los cobros», tuteado), chip Luna en el compositor. | ✓ |
| f1520 | Cierre: logo 620, claim en dos líneas, pastilla de WhatsApp, `BUSCAMOS 10 VETERINARIOS · 0/10`. | ✓ |

Checklist, todo o nada:

- [x] Ningún texto **nuestro** legible por encima de y 220 ni por debajo de y 1670 (título 300–600, banda 1330–1610, microrrótulo 1364, anuncio 880–1100, esquema 315–1130, cierre centrado).
- [x] f0430 se lee sin esfuerzo en un teléfono (cuerpo de la app a ~30 px).
- [x] f0620 trae la pregunta en el hilo del móvil.
- [x] Cero asteriscos crudos en las dos superficies.
- [x] Cero voseo en la UI ni en los textos (la bajada del diálogo y las sugerencias con paciente pasan por `aplicarTuteo`).
- [x] `DEMO · DATOS DE EJEMPLO` de f0 a f1440.
- [x] Ninguna cifra **nuestra** salvo `CORPUS`, los años y el locus.
- [x] «VetGPT» en todas partes, grafía exacta en el título.
- [x] Sin Bricolage: display Archivo, mono JetBrains Mono.
- [x] **§E** En f0270 el chip dice «Luna» **y** el hilo está vacío.
- [x] **§E** En f0620 el chip sigue diciendo «Luna» en el layout móvil.
- [x] **§E** En f0760 las dos opciones elegidas se distinguen claramente de las no elegidas.
- [x] **§E** En ningún frame aparece la cifra 61.540 (`grep` sobre `src/explainer/` y la copia de la app: 0 resultados fuera de estas notas).

Determinismo: f0760 renderizado dos veces en procesos distintos (`out/qa/f0760.png` y
`out/qa/determinismo-f0760-b.png`) → MD5 idéntico (`b4e7574e…`).

Regresión del demo: `DemoSaaS` f990 tras el parche v2 del HTML → MD5 `f9e84397…`, idéntico al baseline.

---

## 5. `/revisar` — líneas rojas, punto por punto

Textos auditados: el título, las siete frases de la banda, el anuncio del acto 4, los rótulos del
esquema, el microrrótulo, el cierre, la locución de §3, la repregunta (§B.1) y lo que la app pone en
pantalla (diálogo de contexto, las dos preguntas, la respuesta de Malassezia, la abstención).

| # | Línea roja | Veredicto |
|---|---|---|
| 1 | VetGPT nunca diagnostica ni firma | **PASA.** La repregunta pide datos, no concluye; la respuesta real dice «sugiere», «casi siempre», «sólo si»; el acto 9 muestra la abstención. «Así la respuesta le queda a tu caso» describe lo que se ve (afinar sobre lo elegido), no promete acierto. |
| 2 | Cero métricas, testimonios o clínicas inventadas | **PASA.** El único número nuestro es `CORPUS` (120.000, confirmado por David en la orden v2); nada de porcentajes ni «acierta más». `DEMO · DATOS DE EJEMPLO` los nueve actos. |
| 3 | Nunca atacar la facturación | **PASA.** |
| 4 | Nunca nombrar competidores | **PASA.** |
| 5 | Nunca burlarse de lo clínico ni sugerir atajos | **PASA.** |
| 6 | Tuteo colombiano, nunca «tu clínica» | **PASA.** Título, banda, anuncio, locución y cierre en tuteo. La UI pasa por `aplicarTuteo` (diálogo: «Elige con qué paciente quieres que VetGPT trabaje.»; sugerencias: «Resume…», «Agenda…», «Ponte al día…»). |
| 7 | Grafía «Tuvetia» / «VetGPT» | **PASA.** |
| 8 | Privacidad en serio | **PASA.** No se toca el tema. |
| 9 | El sufrimiento del vet no es el gancho | **PASA.** El gancho es «una IA especializada para veterinarios». |
| 10 | CTA siempre a WhatsApp | **PASA.** |

**Sobre las dos frases que la orden v2 §D pide sostener contra el still:**

- «Evitamos las alucinaciones: cada respuesta se apoya en fuentes que puedes abrir.» Se sostiene
  al nivel de la respuesta: la del acto 7 cita `[1]` y `[2]`, el acto 8 las abre, el acto 9 muestra qué
  pasa cuando no hay fuente. No se escribió «ninguna afirmación queda sin fuente» ni «cero
  alucinaciones» (en la respuesta hay viñetas sin `[n]`, still f1400). Vista en f0880 sobre el
  esquema, no queda grande; si a David le parece que sí, la alternativa que la orden deja lista es
  «Respuestas con fuente. Y cuando no la hay, te lo dice.» (cabe a 62 px).
- «Antes de responder, pregunta. Así la respuesta le queda a tu caso.» Describe lo que se ve en
  f0700–f0760. Sin «acierta más», sin porcentaje.

**Veredicto: LISTO PARA PUBLICAR.** La cifra del corpus ya está confirmada (orden v2 §A).

---

## 6. Para una segunda pasada

- **Las otras menciones de 61.540** (v2-13): decidir si el calendario, la estrategia de LinkedIn, las
  cards y el post del corpus cambian a 120.000 o se quedan con la cifra de su momento.
- **Locución de Luciano** (§3) + subtítulos quemados; el mp3 va a data-URI en Windows.
- **El dock flotante** de la app se pinta en la lista y en la ficha de consulta (f1260, abajo a la
  derecha). No molesta, pero es un botón sin función en la pieza: decidir si se oculta por estado.
- **Versión de 30 s** (actos 1 → 3 → 5 → 7 → 9 → cierre) para TikTok.
- **Ver la pieza en un teléfono real**: el diálogo a 1.2 (acto 2), el push 1.62 (acto 3) y el zoom
  1.4 (acto 8) son los que cargan la legibilidad.
- **La verificación §B.6** vive en un script de sesión (chrome-headless-shell por CDP). Si se vuelve a
  parchar la maqueta, vale la pena traerlo al repo como `scripts/verificar-maqueta.mjs`.
