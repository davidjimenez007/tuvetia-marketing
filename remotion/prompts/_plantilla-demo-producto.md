# PLANTILLA · Demos de producto de Tuvetia en Remotion

> No es un encargo: es el contrato que comparten todos los demos de producto. Cada pieza tiene su propio archivo (`demo-<modulo>.md`) que dice **qué** se filma; esto dice **cómo**, y no se repite allá.
>
> Destilada de `explainer-rag.md` + `explainer-rag-v2.md` después de entregar la primera pieza. Si algo de acá se contradice con el encargo de una pieza, manda el encargo de la pieza y se anota la desviación.

---

## 1. Lo que se lee antes de escribir código

- `../CLAUDE.md` — la constitución. Manda sobre todo lo demás.
- `../marca/no-decimos.md` — las 10 líneas rojas. §6 de esta plantilla las aterriza.
- `../marca/identidad.md`, `../marca/tokens/tuvetia.ts` — paleta y tipografía, vía `src/marca/tokens.ts`.
- `src/marca/fuentes.ts` — Archivo · Inter Tight · JetBrains Mono. `fuentesListas()` bloquea el render.
- `src/motor/animar.tsx` — `<Entra>`, `estiloEntrada`, `contador`, `formatoNumero`, `easeTuvetia`. Úsalo.
- `src/formatos/Reel.tsx` — `REEL`: 1080×1920, safeTop 220, safeBottom 250, safeX 72.
- `src/explainer/` — la pieza anterior, ya entregada. **De ahí sale casi todo: el replay, las dos superficies, la cámara, el cursor, el toque, la banda, el cierre, el sonido.** Reutiliza; no bifurques.
- `src/explainer/NOTAS.md` — lo aprendido peleando con esto.
- `public/app/NOTAS-MAQUETA.md` — **qué se puede filmar y qué no.** Los límites escritos ahí no se negocian: si el encargo de una pieza pide algo que las notas declaran imposible, para y dilo.
- Skill `remotion-tuvetia` — motor de movimiento y reglas duras.

**El HTML de la app no se lee entero.** Son más de 11.000 líneas. Se localiza todo por `grep` en el momento; los números de línea de cualquier documento están obsoletos por definición.

---

## 2. Arquitectura — no se rediscute

La copia de `public/app/tuvetia-app.html` viene parchada para Remotion: reloj congelado al 3-sep-2026 10:30, `Math.random` con semilla fija, `SIM.after/every/stream` en no-op, transiciones y animaciones CSS apagadas, sin scrollbars, e internos expuestos en `window.app`. **No se toca ninguno de esos parches.**

**Dos superficies, un solo estado.** `<AppEscritorio>` a 1440×900 y `<AppMovil>` a 540×960 escalada ×2, montadas desde el frame 0. `estadoEn(frame)` se aplica a las que estén visibles en ese frame. Una pieza puede usar una sola.

**El replay es puro.** Cada frame se reconstruye desde cero, porque Remotion renderiza en varias pestañas y cada una arranca donde quiere:

```
reseed() → seedDemo() → ACTIONS["login-demo"]()
DB.wa.propuestas = []            // salvo que la pieza las quiera en cámara
for (beat of BEATS) if (beat.desde <= frame) beat.aplicar(app, frame, ctx)
app.nav(ctx.ruta, true) ; #avisos.innerHTML = ""
postProceso(frame)
```

Reglas que ya costaron caro y no se reaprenden:

- **Todo estado se alcanza llamando a la app, no escribiendo HTML.** Si un estado no se alcanza, se expone un interno más en `window.app` y se anota. Portar una pantalla a JSX es el último recurso.
- **Nada de ids escritos a mano.** Los ids dinámicos se resuelven en el replay desde `DB` y se verifica que sigan coincidiendo si el seed cambia.
- **El texto que dice la app lo escribe la app.** Las respuestas salen de `responderVetGPT`, los mensajes de sus plantillas, los rótulos de sus vistas. No se redacta contenido de producto en el guion del video.
- **Tecleo por frame**: en un `input` o `textarea`, cortando por caracteres; en un bloque que pase por `bloquesRicos`, cortando **por palabras** y sin partir un `[n]` ni dejar un `**` abierto.
- **Scroll**: se resuelve el contenedor por `overflow-y` computado en cada documento, nunca por un selector fijo, y se aplica después de `app.nav()`.
- **Los toasts los decide la línea de tiempo**, no la app: `#avisos` se vacía en cada frame y se vuelven a emitir los que la tabla pida. (En esta copia no se borran solos: su temporizador vive en `SIM`.)

---

## 3. Lienzo

1080×1920 · 30 fps. Duración en múltiplos de 60 frames. Registro en `src/Root.tsx` dentro de `<Folder name="Demos">`.

**Ritmo:** 120 BPM. 1 beat = 15 frames, 1 compás = 60. Los cortes caen en múltiplos de 15; los cambios de acto, en múltiplos de 60.

**Regla madre:** el producto es lo único con color y movimiento. Fondo nieve con grano, tipografía en grafito, cero degradados, cero brillos, cero partículas. El menta sólo como acción; el grafito oscuro sólo para esquemas.

**Capas**, de atrás hacia adelante: fondo + grano → superficie de escritorio en su marco → superficie móvil a sangre → cámara (envuelve superficie + cursor) → cursor o toque → capa propia de la pieza (esquemas, anuncios) → banda de texto → microrrótulo → cierre.

**El marco de escritorio.** Ventana de 1440×900 a escala 0.65 → 936 de ancho más la barra de 24 px, en `left: 72`. Radio 16, borde `TV.border`, sombra `TV.shadowPopover`, tres puntos grises y el rótulo mono `TUVETIA`. Recorta con `overflow: hidden` — es la única excepción permitida a la regla del overflow, porque es un marco de dispositivo.

**Legibilidad del escritorio.** A 0.65 el cuerpo de la app queda en 9,75 px: no se lee, y en el plano general no tiene que leerse. Cuando algo sí debe leerse, se **corta** a un encuadre de la columna que importa, escalado para llenar los 1080 de ancho, y la cámara empuja hasta que el cuerpo quede en ~30 px. Si se ve blando, se renderiza con `--scale=2`; no se baja el zoom.

**La banda de texto.** Abajo, scrim `TV.surface2` a 0.94 con borde superior, entre y 1370 y y 1670. Rótulo mono 26 px uppercase en `TV.muted`; frase Archivo 700 62 px en `TV.text`, máximo dos líneas. Entrada en cascada palabra por palabra con `<Entra>` (`gap 3`, `y 18`, `d 22`), salida a opacidad 0 en 8 frames. Mientras un texto entra no hay clics.

**El microrrótulo.** `DEMO · DATOS DE EJEMPLO`, arriba a la derecha, mono 22 px, sobre pastilla de `TV.surface` a 0.9. Permanente hasta el cierre. Es la línea roja 2 en pantalla: no hay clínicas usando Tuvetia y se dice.

**Zonas seguras:** nada legible arriba de y 220 ni debajo de y 1670, ni fuera de los 72 px laterales.

---

## 4. Sistemas por frame

**Cursor y toque.** En escritorio, puntero de 26 px con la gramática de `src/demo/Cursor.tsx`: trayectoria con arco leve, `easeTuvetia`, pausa de 4 a 8 frames antes del clic, anillo de clic en `TV.accent`, `.active-sim` 4 frames. En móvil, un toque: círculo de 64 px en `TV.accent` a 0.25 que entra y sale en 10 frames. **No se mezclan las dos gramáticas en una misma superficie**, y fuera de sus ventanas no se dibuja nada.

Un blanco se declara por selector y lleva coordenadas de repuesto. Si un selector deja de resolver, se lanza un error con el nombre de la toma: no se tapa.

**Cámara.** Keyframes `{f, s, foco}` con `spring({damping: 200})`, `transform-origin: 0 0`. Push lento 1.0 → 1.06 en toma quieta; push de tecleo hasta 1.62; zoom a la acción 1.25 – 1.45; reset a 1.0 en 20 frames al cambiar de acto. Nada de pans por deporte. Los keyframes terminan exactamente en el frame del corte que hace desaparecer su blanco.

**Lo vivo.** Las animaciones CSS están apagadas, así que lo que se mueva lo mueve el replay: spinners por `rotate(frame * 12deg)`, cursores de escritura por paridad de frame, puntos de espera por seno desfasado, entradas de diálogo y cajón por escala y opacidad interpoladas.

**Tuteo.** `src/demo/tuteo.ts` exporta `MAPA_TUTEO` y `aplicarTuteo(doc)`. Se llama después de cada `render()`, en todos los documentos visibles, y se **completa el mapa** con el voseo que aparezca en las pantallas de la pieza. Línea roja 6: si queda un voseo en un still, la pieza no sale.

**Sonido.** Música desde `src/demo/audioData.ts` como data-URI, a 0.35, fade-in 20 frames y fade-out en los últimos 60. Tecleo a 0.30 bajo los tramos que teclean. Nada más, salvo que la pieza lo pida.

---

## 5. El cierre

Reusa `Cierre.tsx` parametrizado a 9:16: fondo nieve sin fundido a negro, logo a 620 px, claim en Archivo 700 a 72 px («Ningún veterinario debería / volver a escribir una ficha.»), pastilla de CTA en `PRIMITIVOS.whatsapp` con el glifo blanco y «Escríbenos al WhatsApp» — **el único bloque de color del cierre** — y el microrrótulo mono `BUSCAMOS 10 VETERINARIOS · 0/10`. Cascada con `<Entra>` `gap 8`, `y 26`, `d 26`. 120 frames.

Línea roja 10: el CTA es WhatsApp, siempre.

---

## 6. Las líneas rojas, aterrizadas

- **1 — VetGPT sugiere, el vet decide.** Ninguna frase puede decir que diagnostica, firma o resuelve solo. Cuando la pieza muestre una acción del copiloto, el gesto de aprobar entra en cámara.
- **2 — Cero métricas, clínicas o testimonios inventados.** Los únicos números que pueden salir son los que la app calcula de su propio seed, o una cifra de producto declarada como constante y verificada antes de publicar. El microrrótulo va en pantalla toda la pieza.
- **3 y 4 — Ni facturación ajena ni competidores.** Ni nombres, ni logos, ni «los otros». El enemigo es el papeleo, lo manual y el software viejo.
- **6 — Tuteo colombiano**, al vet como persona, nunca a «tu clínica».
- **7 — Tuvetia**, una palabra. **VetGPT**, una palabra con esa capitalización.

Y la regla propia de esta serie: **cada frase de la banda tiene que ser cierta en el frame en que aparece.** Si el cuadro no la sostiene, se cambia la frase, no el cuadro. Cuando la app ya dice en su propia interfaz lo que la pieza quiere afirmar, se usa esa frase: es la que no se puede desmentir.

---

## 7. QA — el protocolo, igual en todas las piezas

Stills con `npx remotion still <Id> out/qa/f####.png --frame=####`, **y se miran uno por uno**. Cada encargo trae su tabla de frames; este checklist es común y es todo o nada:

- [ ] Nada legible fuera de la zona segura.
- [ ] Lo que la pieza pide leer, se lee sin esfuerzo en una pantalla de teléfono.
- [ ] Cero voseo, en todas las superficies.
- [ ] Cero asteriscos crudos ni marcadores partidos en texto que pase por `bloquesRicos`.
- [ ] `DEMO · DATOS DE EJEMPLO` visible en todos los actos.
- [ ] Ningún número en pantalla que no venga del seed o de una constante verificada.
- [ ] `VetGPT` y `Tuvetia` con su grafía. Ni un «Athos» suelto.
- [ ] Display Archivo, mono JetBrains Mono. Bricolage no aparece.
- [ ] El dock flotante no tapa nada que la pieza necesite mostrar.
- [ ] Determinismo: un frame del medio renderizado dos veces en procesos distintos da PNG idénticos.

Y `/revisar` sobre todos los textos publicables, con el resultado punto por punto en las notas.

---

## 8. Entrega

```
npx remotion render <Id> out/<nombre>-2x.mp4 --codec=h264 --crf=16 --scale=2
npx remotion ffmpeg -i out/<nombre>-2x.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a copy out/<nombre>.mp4
```

Más `src/<pieza>/NOTAS.md` con: parches nuevos a la copia, desviaciones del encargo y por qué, el texto de locución por acto para cuando se grabe, el resultado de `/revisar`, y lo que quedaría para una segunda pasada.

---

## 9. Lo que cada encargo de pieza tiene que aportar

Sólo esto. Todo lo demás ya está acá arriba.

1. **La promesa en una frase.** Qué tiene que entender el vet al final. Decide la estructura más que el módulo.
2. **Qué superficies** y por qué. Una pieza puede ser sólo escritorio si el trabajo que muestra es de escritorio; forzar el móvil sería una postal falsa.
3. **La línea de tiempo**: tabla de actos con frames, qué pasa, rótulo y frase.
4. **El estado de partida de cada acto**: ruta, contexto, qué datos, qué se toca. El replay lo reconstruye por frame, así que se declara por acto.
5. **Los beats del replay**: la tabla `desde → qué aplica`, con los puntos de entrada reales de `window.app`.
6. **Lo que la pieza afirma y cómo se sostiene**, frase por frase, contra el frame donde aparece.
7. **Su tabla de stills de QA.**