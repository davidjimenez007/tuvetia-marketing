# PROMPT · Explainer del copiloto con literatura citada (VetGPT) en Remotion

> Encargo completo. Se ejecuta con Claude Code abierto **en `tuvetia-marketing/remotion/`** (no en la raíz del repo: las rutas de abajo son relativas a esa carpeta). Lee todo antes de escribir una línea de código.

---

## 0. Encargo

Construye en este proyecto Remotion una composición llamada **`ExplainerRAG`**: un reel vertical de **50 segundos** que explica cómo VetGPT responde una pregunta clínica **citando literatura que se puede abrir y verificar** — y cómo se abstiene cuando no tiene fuente.

La pieza arranca **en el escritorio** y a mitad de camino se pasa **al celular**, sin cortar el hilo: la pregunta se escribe en el computador de la clínica y la respuesta se lee en el teléfono, en la misma conversación. Ese salto es un beat del guion, no un recurso de montaje.

Seis actos: la pregunta en el escritorio → «también desde tu celular» → la búsqueda en el corpus (único momento esquemático) → la respuesta con marcadores de cita → la prueba (título, revista, año) → el límite (cuando no sabe, lo dice). Cierre a WhatsApp.

Sin narración grabada. El texto en pantalla es la narración. Sin clips grabados, sin Playwright: **todo lo que se ve lo produce Remotion cuadro a cuadro**, y la app real es el motor de las pantallas.

Entregables:

1. `out/explainer-rag.mp4` — 1080×1920, 30 fps, 1500 frames, H.264 CRF 16.
2. Stills de control en `out/qa/` (lista en §9).
3. `src/explainer/NOTAS.md` con todo lo que no pudiste hacer exactamente como dice este prompt y por qué, más los parches que le hiciste a la copia de la app.

Trabaja hasta el final. Si algo se traba, resuélvelo o documéntalo en NOTAS.md, pero entrega el mp4 completo.

---

## 1. Lee antes de empezar (obligatorio)

- `../CLAUDE.md` — la constitución del contenido. Manda sobre todo lo demás.
- `../marca/no-decimos.md` — las 10 líneas rojas. §8 de este prompt las aterriza a esta pieza.
- `../marca/identidad.md` y `../marca/tokens/tuvetia.ts` — paleta y tipografía. Se importan desde `src/marca/tokens.ts`.
- `src/marca/fuentes.ts` — Archivo · Inter Tight · JetBrains Mono vía `@remotion/google-fonts`. `fuentesListas()` bloquea el render hasta que cargan.
- `src/motor/animar.tsx` — `<Entra>`, `estiloEntrada`, `progresoEntrada`, `contador`, `formatoNumero`, `easeTuvetia`. **Úsalo; no reinventes la cascada ni el contador.**
- `src/formatos/Reel.tsx` — `REEL` (1080×1920, safeTop 220, safeBottom 250, safeX 72) y el wrapper `<Reel>`.
- `src/demo/AppEmbebida.tsx`, `src/demo/Camara.tsx`, `src/demo/Cursor.tsx`, `src/demo/Cierre.tsx`, `src/demo/Texto.tsx`, `src/demo/Sonido.tsx`, `src/demo/tuteo.ts` — **la pieza anterior ya resolvió el replay determinista, la cámara, el cursor y el sonido. Reutiliza lo que sirva; no lo copies a ciegas: acá el lienzo es vertical y hay dos superficies, no una.**
- `src/demo/NOTAS.md` y `src/demo/EXAMEN-Y-PATRONES.md` — lo que ya se aprendió peleando con esto.
- `prompts/demo-saas.md` — el encargo hermano. Sus §2 (replay), §4.1–4.3 (cursor, hover, cámara) y §4.7 (tuteo) aplican igual acá y no se repiten completos abajo.
- Skill `remotion-tuvetia` (`../.claude/skills/remotion-tuvetia/SKILL.md`) — motor de movimiento y reglas duras.
- El HTML de la app, `public/app/tuvetia-app.html`. No lo leas entero: usa grep. Puntos de entrada de esta pieza: `CHAT` ~l.2020; `marcarTexto` ~l.3980; `bloquesRicos` ~l.3994; `VETGPT_FRASE` ~l.4811; `MensajeChat` ~l.4819; `Compositor` ~l.4834; `PropuestasPendientes` ~l.4978; `responderVetGPT` ~l.4992; `enviarChat` ~l.5103; `repintarChat` ~l.5140; «Referencias citadas» ~l.4257; `window.app` ~l.7843. El bloque `@media (max-width:900px)` (~l.892) es el layout móvil, y el `PARCHE DEMO` (~l.928 en CSS, ~l.943 en JS) ya está aplicado.

---

## 2. Arquitectura: dos superficies, un solo estado

### 2.1 Por qué así

La copia de `public/app/tuvetia-app.html` ya viene parchada para Remotion por la pieza anterior: reloj congelado al 3-sep-2026 10:30, `Math.random` → mulberry32 con semilla fija, `SIM.after/every/stream` convertidos en no-ops, transiciones y animaciones CSS apagadas, sin scrollbars, display en Archivo, e internos expuestos en `window.app`. **No rehagas ese trabajo y no toques esos parches.**

Lo nuevo de esta pieza es que hay **dos iframes de la misma app**, montados los dos desde el frame 0 para que ninguno cargue a mitad de render:

| | Viewport CSS | Escala | Layout que activa |
|---|---|---|---|
| `<AppEscritorio>` | 1440×900 | 0.65 en el plano general (§3.1) | escritorio: barra lateral, riel derecho con agenda y cartera |
| `<AppMovil>` | 540×960 | ×2 → 1080×1920 a sangre | móvil (`max-width:900px`): tabbar abajo, sin barra lateral |

Los dos están verificados sobre esta copia: a 1440×900 la pantalla del asistente pinta hilo, riel derecho y compositor sin desbordes; a 468×832 pinta el hilo, el compositor y la tabbar, también sin errores de consola. A 540×960 el móvil tiene más aire.

**El estado es uno solo.** `estadoEn(frame)` se aplica a los iframes que estén visibles en ese frame — durante la transición del acto 2 los dos lo están, y ahí se aplica a ambos. Esa es justamente la gracia del beat: el hilo que quedó escrito en el escritorio es el mismo que aparece en el teléfono, porque es el mismo replay, no dos pantallas maquilladas para que coincidan.

### 2.2 Parches nuevos a la copia (y sólo estos)

Anótalos todos en NOTAS.md.

1. **Exponer el motor de respuestas.** `window.app` **no** expone `responderVetGPT` ni `repintarChat`, y el replay los necesita porque `enviarChat` depende de `SIM.after`, que es no-op. Agrégalos al objeto `window.app` junto a los demás internos (una línea).
2. **Itálicas en el texto del chat.** `marcarTexto` resuelve `**negrita**` y `[n]`, pero no `*itálica*`: la respuesta real de Malassezia sale a cámara con los asteriscos crudos (`*Malassezia*`). Agrega una sustitución `\*([^*\n]+)\*` → `<em>$1</em>` **después** de la de negritas y antes de la de citas. Es un arreglo de render, no un retoque del contenido: **el texto de la respuesta no se toca**.
3. Nada más. Ni textos, ni datos, ni layout.

### 2.3 Los dos componentes de app

Ambos siguen el mismo contrato:

- `<IFrame>` de `remotion` con `src={staticFile("app/tuvetia-app.html")}` y el viewport de la tabla, dentro de un contenedor con `transform: scale(...)` y `transformOrigin: "0 0"`.
- Al cargar: `delayRender()` con etiqueta propia (`"app-escritorio"`, `"app-movil"`) hasta que existan `contentWindow.app` **y** `contentDocument.fonts.ready`. Recién ahí `continueRender`.
- **En cada frame** (`useLayoutEffect` dependiente de `frame`): `const h = delayRender("estado-<cual>")` → `aplicarEstado(app, estadoEn(frame))` → post-proceso DOM (§4) → `continueRender(h)`. Nada de `setState` en ese camino.
- Cuando un iframe **no** es visible en ese frame, sáltate el `aplicarEstado` completo. No lo desmontes: sólo no le apliques estado. Así el coste sigue siendo el de una app por frame salvo en los 60 frames de la transición.

### 2.4 `estadoEn(frame)` es un replay puro

Remotion renderiza en varias pestañas y cada una arranca en un frame arbitrario, así que **cada frame se reconstruye desde cero** (misma disciplina que `prompts/demo-saas.md` §2.4):

```
reseed()
seedDemo()
ACTIONS["login-demo"]()          // Dra. Valentina Restrepo, admin
DB.wa.propuestas = []            // sin esto, «Propuestas pendientes» mete una tarjeta
                                 // de WhatsApp al pie del hilo y roba la pantalla
CHAT.hiloId = "general"; CHAT.pacienteId = null
for (beat of GUION.beats)        // en orden, sólo los que tengan beat.desde <= frame
  beat.aplicar(app, frame)
app.nav(rutaDelFrame, true)
avisos.innerHTML = ""            // esta pieza no usa toasts
postProceso(frame)               // spinner, cursor, cámara, tuteo, scroll
```

Reglas del replay:

- **El hilo se arma escribiendo `CHAT.mensajes`, no llamando a `enviarChat`** (depende de `SIM`). La forma del mensaje del asistente es la que consume `MensajeChat`: `{ rol: "assistant", texto, citas, herramienta, escribiendo, opciones, accion }`.
- **El texto de las respuestas sale de `responderVetGPT(pregunta)`, no lo escribes tú.** Llámalo en el replay con la pregunta exacta del guion y usa su `texto`, sus `citas`, su `herramienta` y sus `opciones` tal cual. Si alguna vez difiere de lo que dice este prompt, manda la app y lo anotas en NOTAS.md.
- **Tecleo por frame**: la pregunta se escribe en `CHAT.entrada` cortando la cadena por frame; la respuesta se escribe cortando `m.texto` por frame con `m.escribiendo = true` (la app pinta el cursor `.cursor` sola). Corta **por palabras, no por caracteres**, para que `bloquesRicos` no parta un `[1]` a la mitad ni deje un `**` abierto: recorta al último límite de palabra que no rompa un marcador ni un par de asteriscos.
- **Ids dinámicos**: nunca escribas a mano el id de una consulta o de una nota. Para el acto 5, resuelve en el replay `const n = app.DB.notas.find(x => x.citas?.length)` y arma la ruta con `n.consultaId`. Verificado sobre el seed actual: hay al menos una nota con dos citas y el campo se llama `consultaId`.
- **Scroll**: el hilo del asistente es el contenedor con `overflow-y:auto`; interpola su `scrollTop` por frame para que la respuesta larga se vaya revelando. No scrollees `window`. Ojo: el contenedor **no es el mismo nodo** en escritorio y en móvil — resuélvelo por `overflow-y` computado en cada documento, no por un selector fijo.

### 2.5 Si algo no se deja

Si un estado no se alcanza desde el replay ni exponiendo un interno más, porta **esa pantalla** a JSX copiando su template y su CSS. Es el último recurso, no el primero, y va documentado.

---

## 3. Lienzo y estilo

**Formato:** 1080×1920 · 30 fps · **1500 frames** (50 s). Regístrala en `src/Root.tsx` dentro de `<Folder name="Explainers">` con id `ExplainerRAG`.

**Regla madre (skill `remotion-tuvetia`):** *el producto es lo único con color y movimiento.* En los actos de escritorio hay fondo visible, y ahí la disciplina es literal: nieve con grano, tipografía en grafito, cero degradados, cero brillos, cero partículas. En los actos de móvil la app va a sangre y la disciplina se aplica a lo que pongas encima. El menta sólo como acción; el grafito oscuro sólo para el esquema del acto 3.

**Capas, de atrás hacia adelante:**

1. **Fondo**: `TV.surface2` con grano de papel (SVG `feTurbulence fractalNoise baseFrequency .9 numOctaves 2`, opacidad 0.18, `mix-blend-mode: multiply`). Estático, no cambia por frame. Sólo se ve en los actos 1 y 2.
2. **`<AppEscritorio>`** dentro de su marco de ventana (§3.1), visible en los actos 1 y 2.
3. **`<AppMovil>`** a sangre, 1080×1920, visible desde el acto 2 en adelante.
4. **Cámara** (§4.2): transforma la superficie activa y la capa de cursor juntas.
5. **Cursor** (§4.1), sujeto a la cámara. Sólo en los actos 1, 5 y 6.
6. **Esquema del corpus** (§5.1, acto 3): capa propia por encima de la app, con scrim.
7. **Banda de texto**, abajo: scrim de `TV.surface2` a 0.94 con borde superior de 1px `TV.border`, desde y 1370 hasta y 1670 (dentro de la zona segura). Dentro, alineado a x 72: rótulo mono 26 px 500 uppercase `TRACKING.rotulo` en `TV.muted`, y debajo la frase en Archivo 700 **62 px** `TRACKING.titular` en `TV.text`, máximo dos líneas.
8. **Microrrótulo de honestidad**, arriba a la derecha (x hasta 1008, y 240): `DEMO · DATOS DE EJEMPLO`, mono 22 px 500 uppercase `TRACKING.rotulo`, `TV.muted`, sobre una pastilla de `TV.surface` a 0.9 con radio `RADIUS.xxl`. Permanente durante los seis actos. Línea roja 2: no hay clínicas usando Tuvetia, La Arboleda es ficción coherente y se dice.
9. **Cierre** (§6): sustituye a todo lo anterior.

**Zonas seguras:** nada legible por encima de y 220 ni por debajo de y 1670, y 72 px a cada lado (`REEL`). La app móvil sí puede ocupar todo el lienzo; los textos no.

### 3.1 El marco de ventana del escritorio

Sólo para `<AppEscritorio>`. Ventana de 1440×900 escalada a 0.65 → **936×585**, centrada en x (left 72) y con el borde superior en y 700. Radio 16, borde 1px `TV.border`, sombra `TV.shadowPopover`. Barra superior de 24 px (36 × 0.65) en `TV.surface` con tres puntos de 7 px en `TV.borderStrong` a la izquierda — grises, no semáforo: nada de color fuera del producto — y centrado el rótulo mono 8 px uppercase `TRACKING.rotulo` `TV.muted` que dice `TUVETIA`.

**La ventana recorta con `overflow: hidden`.** Es la única excepción permitida a la regla «ningún overflow hidden alrededor de algo que se traslada», porque es un marco de dispositivo y no un texto entrando.

### 3.2 Legibilidad del escritorio — el problema real y su solución

A escala 0.65 el cuerpo de la app (15 px) queda en 9,75 px sobre el lienzo: **no se lee, y no tiene que leerse**. El plano general del acto 1a existe para que se entienda la forma —barra lateral, riel de agenda y cartera, es software de escritorio de verdad— y la banda de texto dice lo que hay que saber.

Lo único que sí tiene que leerse en el escritorio es la pregunta mientras se escribe. Para eso, el acto 1b **corta** (no hace zoom desde el plano general) a un encuadre de la columna del chat:

- Región del escritorio que se encuadra: x 232 → 1120, y 48 → 880 (888×832 px del área de app; medido sobre esta copia).
- Se escala 1.216 para llenar los 1080 px de ancho del lienzo, y queda 1080×1012, colocada con el borde superior en y 250.
- Sobre ese encuadre, la cámara hace un push de 1.0 a 1.62 con foco en el compositor mientras se teclea, y vuelve a 1.0 en 20 frames al enviar. En el pico, el cuerpo de la app queda en ~30 px sobre el lienzo: legible en un teléfono.

Si el zoom se ve blando, renderiza con `--scale=2`; no bajes el zoom.

### 3.3 Sonido y ritmo

**Música:** `public/musica/pista-corta.mp3` con `<Audio>` a 0.35, fade-in en 20 frames y fade-out en los últimos 60. Copia el patrón de `src/demo/Sonido.tsx`. SFX: sólo `public/sfx/tecleo.wav` bajo los dos tramos de tecleo, a 0.30, con el mismo envolvente. Nada más.

**Ritmo:** 120 BPM. 1 beat = 15 frames, 1 compás = 60 frames. Todos los cortes caen en múltiplos de 15 y los cambios de acto en múltiplos de 60.

---

## 4. Sistemas de efectos (todo por frame, todo determinista)

### 4.1 Cursor

Reusa `CapaCursor`, `estadoCursorEn` y `resolverBlanco` de `src/demo/Cursor.tsx`; mismas reglas que `prompts/demo-saas.md` §4.1 (flecha, hotspot en la punta, trayectoria con arco leve, `easeTuvetia`, pausa de 4 a 8 frames antes del clic, anillo de clic en `TV.accent`, clase `.active-sim` 4 frames).

Dos tamaños y dos gramáticas: **puntero de 26 px sobre el escritorio**, porque es un mouse; y sobre el móvil, **un toque**: círculo de contacto de 64 px en `TV.accent` a 0.25 que aparece y se desvanece en 10 frames, sin flecha. No mezcles las dos en una misma superficie.

Tres interacciones en toda la pieza: enviar la pregunta (escritorio, acto 1), entrar a la consulta (móvil, acto 5) y enviar la segunda pregunta (móvil, acto 6). Fuera de esos momentos no se dibuja nada — el puntero no se queda parqueado en una esquina.

### 4.2 Cámara

Reusa `Camara`, `escalaCamaraEn` y `transformCamaraEn` de `src/demo/Camara.tsx`, con la tabla de keyframes de esta pieza. Igual que `prompts/demo-saas.md` §4.3: keyframes `{f, fx, fy, s}` con foco relativo y `spring({damping: 200})` estirado al tramo, `transform-origin: 0 0`, sin `will-change`.

Movimientos permitidos: push lento 1.0 → 1.06 en una toma quieta, push de tecleo 1.0 → 1.62 (acto 1b), zoom a la acción 1.25 – 1.45 (la pastilla `[1]`, la tarjeta de referencias) y reset a 1.0 en 20 frames al cambiar de acto. Nada de pans por deporte. En los actos de móvil la app llena el lienzo, así que no hace falta clamp; en los de escritorio, la ventana recorta.

### 4.3 Lo vivo dentro de la app

- **Spinner** `.girando` de la fila «Consultando la literatura veterinaria…»: `rotate(frame * 12deg)`.
- **Cursor de escritura** `.cursor` del mensaje que se está escribiendo: opacidad `frame % 30 < 15 ? 1 : 0`.
- **Hover simulado** sobre el botón de enviar y sobre la fila de la consulta, con la técnica de `prompts/demo-saas.md` §4.2 (duplicar las reglas `:hover` a `.hover-sim` por regex sobre el CSS de la copia, e interpolar a mano `translateY` y `box-shadow` en los primeros 8 frames). Aplícala a los dos documentos. En móvil el hover no existe: ahí sólo va el `.active-sim` del toque.
- Las animaciones CSS están apagadas por el parche: todo lo que se mueva lo mueves tú.

### 4.4 Tuteo en la UI

La maqueta tiene voseo suelto — en la pantalla del asistente sale «VetGPT propone — vos aprobás» al pie del compositor, tanto en escritorio como en móvil. Reusa `src/demo/tuteo.ts` tal cual — exporta `MAPA_TUTEO` (pares `[RegExp, string]`) y `aplicarTuteo(doc)` — y **completa el mapa** con lo que veas en las pantallas de esta pieza. Llama a `aplicarTuteo` después de cada `render()`, **en los dos documentos**.

Línea roja 6: tuteo colombiano, siempre. Si un texto queda en voseo en un still de QA, la pieza no sale.

### 4.5 Banda de texto

Entrada en cascada palabra por palabra con `<Entra>`: `gap 3`, `y 18`, `d 22`; el rótulo entra primero (`i 0`) y luego cada palabra (`i 1…n`). Salida a opacidad 0 en 8 frames. Mientras un texto está entrando no hay clics: el texto acompaña a un plano quieto o a una pasada.

---

## 5. Línea de tiempo

| Frames | Acto | Qué pasa en pantalla | Rótulo | Frase |
|---|---|---|---|---|
| 0–120 | 1a · El escritorio | Plano general de la ventana (§3.1) en `/dashboard/asistente`, hilo vacío. Cámara 1.0 → 1.04. No se lee el texto de la app: se lee la forma. | `EN LA CLÍNICA` | El copiloto vive dentro de tu historia clínica. |
| 120–300 | 1b · La pregunta | Corte al encuadre de la columna del chat (§3.2). Del f130 al f250 se escribe la pregunta en `CHAT.entrada` con push de cámara 1.0 → 1.62 sobre el compositor. f260 el puntero llega al botón de enviar, f270 clic. | `LA PREGUNTA` | Le preguntas como le preguntarías a un colega. |
| 300–360 | 1c · Se envía | La cámara vuelve a 1.0 en 20 frames y la pregunta aparece en el hilo como mensaje del vet. | — | — |
| 360–480 | 2 · También en el celular | f360–390 vuelta al plano general de ventana. f390–420 la ventana se encoge de 0.65 a 0.30 y sube a y 520; entra la frase del anuncio, centrada, en cascada. f420–480 la pantalla de móvil entra desde abajo (`translateY` 1920 → 0, `easeTuvetia`) y tapa todo; ventana y frase salen por opacidad en los últimos 12 frames. **El hilo que se ve en el teléfono ya trae la pregunta**: es el mismo replay. | `EL MISMO HILO` | También lo puedes usar desde tu celular. |
| 480–660 | 3 · La búsqueda | Scrim grafito (`TV_DARK.surface` a 0.92) sobre la app móvil en 20 frames. Encima, el esquema del corpus (§5.1). Al f640 el scrim se va en 20 frames. | `ESQUEMA` | De todo el corpus, la respuesta se apoya en dos fuentes. |
| 660–1020 | 4 · La respuesta | f660–700 la fila «Consultando la literatura veterinaria…» con el spinner. f700–940 la respuesta se escribe palabra por palabra con `escribiendo: true`, y el hilo hace scroll para seguirla. f940–1020 zoom 1.35 sobre la pastilla `[1]` del primer párrafo. | `LA RESPUESTA` | Lo que se apoya en literatura trae su marca. |
| 1020–1200 | 5 · La prueba | Toque sobre la consulta que tiene nota con citas y la vista entra. Scroll hasta la tarjeta «Referencias citadas» y zoom 1.4 sobre la primera entrada: título, revista, año, locus y «Abrir artículo». | `LA PRUEBA` | Título, revista, año. Puedes ir al artículo. |
| 1200–1380 | 6 · El límite | Vuelta al asistente. f1200–1290 se escribe la segunda pregunta y se envía; f1300–1380 entra la respuesta de abstención con sus tres sugerencias. Cámara 1.0. | `EL LÍMITE` | Cuando no tiene fuente, lo dice. |
| 1380–1500 | Cierre | §6. | — | — |

**El anuncio del acto 2 (literal):**

> También lo puedes usar desde tu celular.

En Archivo 700 **72 px**, centrado, `TV.text`, dos líneas si hace falta, cascada palabra por palabra con `<Entra>` (`gap 4`, `y 22`, `d 24`). Va sobre el fondo nieve, **no** dentro de la banda inferior: este beat es el único de la pieza en el que el texto ocupa el centro. Debajo, el rótulo mono `EL MISMO HILO` en `TV.muted`, que es lo que la transición está probando.

**La pregunta del acto 1 (literal, no la cambies):**

> ¿Qué dice la literatura sobre otitis por Malassezia?

Es una de las sugerencias que la propia app ofrece y cae en la rama `/malassezia|otitis/` de `responderVetGPT`, que devuelve la respuesta con `herramienta: "la literatura veterinaria"` y estas dos citas reales:

1. *Malassezia dermatitis in dogs and cats* — Veterinary Dermatology, 2020, 31(1):27-e4
2. *Otitis externa: a practical approach* — In Practice, 2019, 41(6):258-267

Está formulada como consulta de literatura, no como «diagnostícame este caso». Línea roja 1: VetGPT piensa contigo, no diagnostica. **No la reformules.**

**La pregunta del acto 6 (literal):**

> ¿Cuánto vive un perro con soplo grado III?

Tiene que caer en la rama por defecto de `responderVetGPT` — la que contesta «No tengo con qué responder eso con precisión, y prefiero decirlo antes que inventar una fuente» y ofrece tres sugerencias. Verificado contra las ramas de la función sobre esta copia: no la captura ninguna. **Vuelve a verificarlo en el replay**; si algún día una rama nueva la captura, cámbiala por otra pregunta de pronóstico que sí caiga en la rama por defecto y anótalo en NOTAS.md. Que se abstenga en una pregunta de pronóstico no es una debilidad que estemos tapando: es exactamente la línea roja 1 funcionando a cámara.

### 5.1 El esquema del corpus (acto 3)

Es el único momento de la pieza que no es la app, y por eso es el más fácil de arruinar. Reglas:

- **Rotulado como esquema.** Arriba, mono 22 px uppercase `TV_DARK.muted`: `ESQUEMA — NO ES LA INTERFAZ`. Sin esto no se publica.
- **El campo.** Una retícula de marcas de 3×3 px en `TV_DARK.borderStrong` a opacidad 0.35, 40 columnas × 25 filas, centrada, con `gap` de 14 px. Entran en cascada con `<Entra>` por columnas (`gap 1`, `y 8`, `d 14`) entre f500 y f560. **Son una representación, no un conteo**: no digas ni des a entender que hay una marca por documento.
- **El contador.** Debajo del campo, `contador({frame, desde: 0, hasta: CORPUS, inicio: 500, d: 90})` con `formatoNumero`, en JetBrains Mono 700 96 px `TV_DARK.text`, y debajo el rótulo mono 22 px `TV_DARK.muted`: `DOCUMENTOS EN EL CORPUS`.
- **`CORPUS` es una constante que hay que verificar el día de producción.** `CLAUDE.md` dice 61.540. Déjala en `src/explainer/guion.ts` como `export const CORPUS = 61540` con un comentario que diga de dónde salió y que se confirma antes de publicar. Si no la puedes confirmar, no inventes una cifra nueva: usa la de `CLAUDE.md` y anótalo en NOTAS.md.
- **Las dos fuentes.** Entre f570 y f610, dos marcas del campo (posiciones fijas, elegidas a mano, no aleatorias) pasan a `TV_DARK.accent` y crecen a 9×9 px. Entre f610 y f640 bajan en trayectoria recta con `easeTuvetia` hasta el borde inferior del esquema y se convierten en dos pastillas `[1]` y `[2]` con la misma forma que la clase `.cita` de la app.
- **Prohibido en este esquema:** cronómetros, porcentajes, «0,8 s», «precisión», barras de relevancia, embeddings dibujados como nubes de puntos con distancias, o cualquier número que no sea `CORPUS`. Línea roja 2: no hay métricas medidas y no se inventan. Lo único que el esquema afirma es que el corpus es grande y que **esta** respuesta se apoya en dos fuentes, que es verdad y se comprueba en el acto 5.

---

## 6. El cierre (f1380–1500)

Reusa `src/demo/Cierre.tsx` adaptado a 9:16 — no lo dupliques a mano si puedes parametrizarlo:

- Fondo `TV.surface2`, sin fundido a negro.
- Logo `staticFile("marca/logo-horizontal.svg")` a 620 px de ancho.
- Claim en Archivo 700 **72 px**, centrado, dos líneas: `Ningún veterinario debería` / `volver a escribir una ficha.`
- Pastilla de CTA en `PRIMITIVOS.whatsapp` con el glifo de WhatsApp en blanco y el texto `Escríbenos al WhatsApp`, Inter Tight 600 34 px. **Es el único bloque de color del cierre.**
- Microrrótulo mono `BUSCAMOS 10 VETERINARIOS · 0/10`, 22 px, `TRACKING.beta`, `TV.muted`.
- Todo en cascada con `<Entra>` `gap 8`, `y 26`, `d 26`.

Línea roja 10: el CTA es WhatsApp. Nunca la landing, nunca «link en bio» como CTA hablado.

---

## 7. Locución opcional

La pieza se entrega **sin voz**. Deja en `src/explainer/guion.ts` una constante `CON_VOZ = false` y el cableado listo (`<Audio src={staticFile("voz/explainer-rag.mp3")} />` dentro de un `<Sequence>` desde el frame 0) para cuando Luciano grabe. Deja también en NOTAS.md el texto de locución, cuadrado a los actos, en tuteo, sin ninguna afirmación que no esté ya en pantalla.

Si algún día se activa `CON_VOZ`, hay que agregar subtítulos quemados (skill `remotion-tuvetia`: siempre, el 80 % ve sin audio). Sin voz, la banda de texto de §3 cumple esa función y no se duplica.

---

## 8. Líneas rojas aterrizadas a esta pieza

Antes de dar por terminada la composición, pasa `/revisar` y deja el resultado en NOTAS.md, punto por punto. Los tres que esta pieza pisa de cerca:

- **1 — VetGPT nunca diagnostica ni firma.** La pregunta es de literatura. La respuesta que sale a cámara dice «sugiere» y «casi siempre», no cierra un diagnóstico. El acto 6 muestra la abstención. Ninguna frase de la banda de texto puede decir «te dice qué tiene», «resuelve el caso» ni nada equivalente.
- **2 — Cero métricas inventadas.** El único número de la pieza es `CORPUS`. No hay tiempos de respuesta, ni porcentajes, ni clínicas, ni testimonios. El microrrótulo `DEMO · DATOS DE EJEMPLO` está en pantalla los seis actos.
- **4 — Nunca competidores.** Ni «no es un chat genérico» con nombre propio, ni logos, ni comparaciones. El enemigo es el papeleo, no un producto.

Y dos reglas propias de esta pieza:

- **Cada frase de la banda de texto tiene que ser cierta en el frame en que aparece.** «Lo que se apoya en literatura trae su marca» es verdad; «ninguna afirmación queda sin fuente» no lo es, porque en la respuesta real hay viñetas sin `[n]`. Si cambias una frase, compruébala contra el still.
- **El anuncio del celular tiene que ser cierto.** Se afirma porque la app tiene layout móvil real y se está viendo funcionar, no un mockup. Si en algún momento el layout móvil se rompe en la pantalla que se muestra, el beat sale de la pieza — no se maquilla.

---

## 9. QA — stills obligatorios en `out/qa/`

Renderiza con `npx remotion still ExplainerRAG out/qa/f####.png --frame=####` estos frames, y míralos:

| Frame | Qué tiene que verse |
|---|---|
| 0060 | Ventana de escritorio completa con barra lateral y riel derecho. Sin tarjeta de «Propuestas pendientes». |
| 0240 | Encuadre de la columna del chat con la pregunta escrita en el compositor, **legible**, sin texto clipeado. |
| 0330 | La pregunta ya en el hilo del escritorio como mensaje del vet. |
| 0405 | El anuncio: ventana encogida arriba y la frase «También lo puedes usar desde tu celular.» centrada. |
| 0450 | Transición a medio camino: la pantalla de móvil subiendo, la de escritorio todavía visible. |
| 0490 | Móvil a sangre con la tabbar abajo **y la pregunta ya en el hilo**. |
| 0560 | Esquema: campo, contador corriendo, rótulo `ESQUEMA — NO ES LA INTERFAZ`. |
| 0620 | Las dos marcas en menta, ya separadas del campo. |
| 0680 | Fila «Consultando la literatura veterinaria…» con el spinner. |
| 0860 | Respuesta a medio escribir, con el cursor y sin ningún `[` ni `**` partido. |
| 0980 | Zoom sobre la pastilla `[1]`. |
| 1140 | Tarjeta «Referencias citadas» con título, revista, año y «Abrir artículo». |
| 1340 | Respuesta de abstención con las tres sugerencias. |
| 1460 | Cierre completo con la pastilla de WhatsApp. |

Checklist sobre esos stills, todo o nada:

- [ ] Ningún texto legible por encima de y 220 ni por debajo de y 1670.
- [ ] En f0240 la pregunta se lee sin esfuerzo en una pantalla de teléfono. Si no, sube el push de cámara antes de tocar cualquier otra cosa.
- [ ] En f0490 el hilo del móvil trae la pregunta. Si viene vacío, el estado no se está aplicando a los dos iframes.
- [ ] Cero asteriscos crudos en pantalla (parche §2.2.2 aplicado), en las dos superficies.
- [ ] Cero voseo (`vos`, `-á`/`-é` imperativos) en la UI ni en la banda de texto, en las dos superficies.
- [ ] `DEMO · DATOS DE EJEMPLO` visible en f0060, f0490, f0860 y f1340.
- [ ] Ninguna cifra en pantalla salvo `CORPUS`, los años de las citas y el locus bibliográfico.
- [ ] El nombre del asistente es **VetGPT** en todas partes; ni un «Athos» suelto.
- [ ] Bricolage Grotesque no aparece: display es Archivo, mono es JetBrains Mono.
- [ ] El texto del compositor no queda clipeado verticalmente en móvil (a viewport chico se cortaba: si sigue pasando a 540×960, dilo en NOTAS.md en vez de taparlo con un zoom).

Y un chequeo de determinismo: renderiza dos veces el frame 0860 en procesos distintos y compara los PNG byte a byte. Si difieren, hay estado que sobrevive entre frames — arréglalo antes de renderizar el video.

---

## 10. Entrega

```
npx remotion render ExplainerRAG out/explainer-rag.mp4 --codec=h264 --crf=16 --scale=2
```

En `src/explainer/NOTAS.md`: los parches que le hiciste a la copia, lo que no salió como dice este prompt y por qué, el texto de locución de §7, el resultado de `/revisar` punto por punto, y la lista de lo que dejarías para una segunda pasada.

Si el render tarda demasiado por el coste de `seedDemo` en cada frame —y con dos iframes en la transición cuesta el doble— mide antes de optimizar y nunca sacrifiques el determinismo (`prompts/demo-saas.md` §2.4 tiene la nota sobre cachear con `structuredClone`).