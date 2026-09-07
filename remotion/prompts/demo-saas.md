# PROMPT · Demo SaaS de Tuvetia en Remotion

> Pégalo tal cual en Claude Code abierto en `tuvetia-content/remotion/`. Es un encargo completo: lee todo antes de escribir una línea de código.

---

## 0. Encargo

Construye desde cero, en este proyecto Remotion, una composición llamada **`DemoSaaS`**: un video demo clásico de producto SaaS, 16:9, 80 segundos, que recorre la app de Tuvetia con cursor, clics, hovers, zooms de cámara, toasts y textos en pantalla. Sin narración. Sin subtítulos. Sin Playwright, sin clips grabados, sin nada de sesiones anteriores: **todo lo que se ve lo produce Remotion cuadro a cuadro**.

La base visual es la maqueta funcional de la app: `C:\Users\Luciano\Desktop\tuvetia-content\captura\tuvetia-app-rediseno-full.html`. Es un solo archivo HTML (566 KB) con toda la app corriendo en memoria: router por hash, datos de una clínica demo ("La Arboleda", siete meses de historia), y el copiloto Athos. No es un mockup estático: es la app. La vas a usar **como motor de render** dentro de Remotion, no como referencia para redibujarla.

Entregables:
1. `out/demo-saas.mp4` (1920×1080, 30 fps, 2400 frames, H.264 CRF 16).
2. Stills de control en `out/qa/` (lista en §9).
3. `src/demo/NOTAS.md` con todo lo que no pudiste hacer exactamente como dice este prompt y por qué.

Trabaja hasta el final. Si algo se traba, resuélvelo o documéntalo en NOTAS.md, pero entrega el mp4 completo.

---

## 1. Lee antes de empezar (obligatorio)

- `../CLAUDE.md` — la constitución del contenido. Manda sobre todo lo demás.
- `../marca/no-decimos.md` — las 10 líneas rojas. `/revisar` revienta si pisas una.
- `../marca/identidad.md` — paleta, tipografía, logo, lo que no se hace.
- `../marca/tokens/tuvetia.ts` — tokens tipados. Se importan desde `src/marca/tokens.ts` (ya existe).
- `src/marca/fuentes.ts` (ya existe) — Archivo · Inter Tight · JetBrains Mono vía `@remotion/google-fonts`.
- `src/motor/animar.tsx` (ya existe) — `<Entra>`, `estiloEntrada`, `contador`, `easeTuvetia`. Úsalo; no reinventes la cascada.
- Skill `remotion-tuvetia` (`../.claude/skills/remotion-tuvetia/SKILL.md`) — motor de movimiento y reglas duras.
- Skill `remotion-best-practices` — lee al menos `rules/animations.md`, `timing.md`, `sequencing.md`, `transitions.md`, `fonts.md`, `images.md`, `measuring-dom-nodes.md`.
- El HTML de la app. No lo leas entero de una: usa grep. Puntos de entrada útiles (números de línea aproximados): tokens CSS `:root` ~l.130; `nav()`/`render()` ~l.2083–2130; `abrirOverlay`/`dialogo` ~l.2168; `toast()` ~l.2203; barra lateral `NAV_*` ~l.2236; `seedDemo()` ~l.1181; `VIVO` ~l.1982; `Cockpit()` ~l.4420; `transcripcionHTML()` ~l.4340; `iniciarGrabacion` ~l.4532; `terminarGrabacion` ~l.4619; `generarNotaSOAP` ~l.4644; `abrirCajonConsulta` ~l.7605; `ACTIONS` ~l.6820–7200; `window.app = {…}` ~l.7806.

---

## 2. Arquitectura: la app real como motor, Remotion como director

### 2.1 Por qué así
Portar 12 pantallas a JSX a mano pierde fidelidad y tarda días. Grabar con Playwright da framerate variable y cero control por frame. La app ya es una función `estado → HTML`: se le fija el estado para cada frame y se le pide que pinte. Remotion pone encima el cursor, la cámara, los textos y el cierre. Resultado: pixel-perfect con el producto real y 100 % determinista.

### 2.2 Copia parchada de la app
Copia el HTML a `public/app/tuvetia-app.html`. **Es una copia: puedes tocarla.** Aplica exactamente estos parches y anótalos en NOTAS.md:

1. **Sin temporizadores.** La app agenda cosas con `SIM.after`, `SIM.every` y `SIM.stream` (cronómetro de la grabación, transcripción palabra a palabra, toasts que se borran solos). Convierte esos tres en no-ops que devuelven un id y nunca disparan. `SIM.clear` se queda como está.
2. **Navegación síncrona.** `nav(ruta, reemplazar)` usa `location.hash =` cuando `reemplazar` es falso, y eso pinta después, en el evento `hashchange`, fuera de tu control. Fuerza `reemplazar = true` siempre dentro de `nav` (una línea) para que `render()` corra en el mismo tick. Quita también el listener de `hashchange` si existe.
3. **Azar determinista.** Reemplaza `Math.random` por un mulberry32 con semilla fija, y expón `window.app.reseed()` para volver a la semilla al inicio de cada replay. `uid()` y la cadencia interna dependen de esto.
4. **Exponer internos.** `window.app` ya expone `DB`, `UI`, `VIVO`, `CARRITO`, `CAL`, `COM`, `FL`, `ACTIONS`, `render`, `nav`, `toast`, `seedDemo`, `generarNotaSOAP`, `getC/getP/getO`, `renderFlotantes`. Agrega lo que te haga falta (por ejemplo `pedirConsentimiento`, `abrirOverlay`, `cerrarOverlay`, `OV`, `abrirInforme`, `repintarVivo`, `SEL`). Una línea por función; lista completa en NOTAS.md.
5. **Tipografía de marca.** El `<link>` de Google Fonts de la copia trae Bricolage Grotesque. Cámbialo por `family=Archivo:wght@600;700&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500` y agrega al final del `<style>`: `:root{--display:"Archivo",system-ui,sans-serif}`. Bricolage está prohibida (marca vieja).
6. **CSS de captura**, al final del `<style>`:
   ```css
   *,*::before,*::after{transition:none!important;animation:none!important;cursor:none!important;caret-color:transparent!important}
   ::-webkit-scrollbar{width:0!important;height:0!important} html{scrollbar-width:none!important}
   ```
   Las animaciones que la app necesita (`pulso` del punto de grabación, barras `.eq`, entrada de toasts, hover que levanta) las vas a reproducir tú por frame (§4).

No cambies nada más del HTML. Ni textos, ni datos, ni layout.

### 2.3 `<AppEmbebida>`
- Renderiza la copia en un `<IFrame>` de `remotion` (`src={staticFile("app/tuvetia-app.html")}`), tamaño exacto del área de app de la ventana (§3): **1600×864**. Mismo origen → puedes tocar `iframe.contentWindow.app` y `contentDocument`.
- Al cargar: `delayRender("app")` hasta que exista `contentWindow.app` **y** `contentDocument.fonts.ready` resuelva. Recién ahí `continueRender`.
- **En cada frame** (`useLayoutEffect` dependiente de `frame`): `const h = delayRender("estado")` → `aplicarEstado(app, estadoEn(frame))` → post-proceso DOM (§4) → `continueRender(h)`. Nada de `setState` en ese camino: cursor y cámara se posicionan por `ref`, imperativamente. Así el frame N produce exactamente lo mismo en cualquier pestaña del render paralelo.

### 2.4 `estadoEn(frame)` es un replay puro
Remotion renderiza en varias pestañas y cada una empieza en un frame arbitrario. Por eso **cada frame se reconstruye desde cero**:

```
reseed()
seedDemo()                       // DB limpio de la clínica demo
ACTIONS["login-demo"]()          // sesión Dra. Valentina Restrepo (u-1, admin)
for (accion of GUION.acciones)   // en orden, sólo las que tengan accion.desde <= frame
  accion.aplicar(app, frame)
app.nav(rutaDelFrame, true)      // pintado síncrono final
avisos.innerHTML = ""            // los toasts los decide la línea de tiempo, no la app
for (t of toastsVisiblesEn(frame)) app.toast(t.texto, t.opts)   // y luego se animan por frame
postProceso(frame)               // hover-sim, scroll, pulso/eq, tuteo, cursor, cámara
```

Reglas del replay:
- Las acciones son las **acciones reales de la app** (`ACTIONS[...]`, `nav`, mutaciones directas de `VIVO`/`UI`/`DB`). No simules una pantalla con HTML propio: si un estado no se puede provocar, expón una función interna (§2.2.4).
- **Ids dinámicos**: la consulta nueva se crea con `uid("c")`. Nunca escribas su id a mano: después de `crear-consulta`, léelo de `app.DB.consultas[0].id` (la app hace `unshift`) y construye la ruta `/dashboard/consultas/<id>` con eso. Igual con el número de factura (`app.DB.facturas[0].numero`).
- La grabación **no** usa `iniciarGrabacion`/`terminarGrabacion` (dependen de temporizadores). Escribe `VIVO` directo: `fase`, `consultaId`, `pacienteNombre: "Luna"`, `segundos`, `estable`, `provisional`, `guion`, `idx`, `notas`, `sugerencias`, `alergias: ["Penicilina"]`, `alerta`, `tabCockpit`, `pensando`. La tira "Se está oyendo" pinta `VIVO.estable` (texto asentado) + `VIVO.provisional` (gris). Con eso haces la transcripción palabra a palabra por frame.
- El cierre de la grabación lo haces tú en tres pasos con los mismos efectos que `terminarGrabacion`: `fase="subiendo"` → `fase="transcribiendo"` → (`DB.transcripciones[id] = guion.join("\n")`, `c.estado="review"`, `c.audioSeg=segundos`, `generarNotaSOAP(id)`, `fase="terminada"`).
- Coste: `seedDemo` + unas pocas acciones + un `render()` por frame. Está bien. Si un frame tarda más de 150 ms, mide y optimiza (por ejemplo cachea el resultado de `seedDemo` clonando con `structuredClone`), pero nunca a costa del determinismo.

### 2.5 Si algo no se deja
Si una pantalla o estado no se puede alcanzar desde el replay ni exponiendo internos, porta **esa pantalla** a JSX copiando su template y usando el mismo CSS de la app (extráelo del `<style>` a `src/demo/app.css`). Documéntalo. Es el último recurso, no el primero.

---

## 3. Lienzo y estilo del video

**Formato:** 1920×1080 · 30 fps · 2400 frames (80 s). Registrar en `src/Root.tsx` dentro de `<Folder name="Demos">` con id `DemoSaaS`.

**Regla madre (skill remotion-tuvetia):** *el producto es lo único con color y movimiento.* Fondo sobrio, tipografía grande, la pantalla del producto es la protagonista cromática. Nada de degradados, brillos, partículas ni "glow".

**Capas, de atrás hacia adelante:**
1. **Fondo**: `TV.surface2` (#f5f8f7, nieve) con grano de papel (SVG `feTurbulence fractalNoise baseFrequency .9 numOctaves 2`, opacidad 0.18, `mix-blend-mode: multiply`). El grano es estático (no cambia por frame).
2. **Ventana de la app**: 1600×900 en (160, 60). Radio 16, borde 1px `TV.border`, sombra `TV.shadowPopover`. Barra superior de 36 px en `TV.surface` con tres puntos de 10 px en `TV.borderStrong` a la izquierda (grises, no semáforo: nada de color fuera del producto) y, centrado, el rótulo mono `TUVETIA` 11 px 500 uppercase tracking .15em `TV.muted`. Debajo, el iframe 1600×864. **La ventana recorta el zoom de cámara (`overflow: hidden`)**: es la única excepción permitida a la regla "ningún overflow hidden alrededor de algo que se traslada", porque es un marco de dispositivo, no un texto entrando.
3. **Cámara** (§4.3): transforma el contenido de la ventana (iframe + capa de cursor), no la ventana.
4. **Cursor** (§4.1): dentro del área de la ventana, encima del iframe, sujeto a la cámara.
5. **Banda inferior** (y 960–1080, sobre el fondo, fuera de la ventana): a la izquierda los textos en pantalla (§4.5); a la derecha, permanente durante los actos 1–3, el microrrótulo mono `DEMO · DATOS DE EJEMPLO` 13 px 500 uppercase tracking .15em `TV.muted`. Esto es honestidad de marca (línea roja 2: no hay clínicas usando Tuvetia; La Arboleda es ficción coherente y se dice).
6. **Cierre** (§6, acto 4.2): sustituye a todo lo anterior.

**Tipografía:** display Archivo 700 (frases), Inter Tight (nada en este video salvo el CTA), JetBrains Mono 500 (rótulos, uppercase, tracking .15em). Ninguna fuente por defecto. Bricolage prohibida.

**Color fuera del producto:** grafito `TV.text` para texto, `TV.muted` para rótulos, `TV.border`/`TV.borderStrong` para marcos. Menta sólo como acción: el anillo del clic (§4.1) y el CTA del cierre. WhatsApp `PRIMITIVOS.whatsapp` sólo en la pastilla del CTA.

**Música:** opcional. Si existe `public/musica/pista.mp3`, ponla con `<Audio>` a volumen 0.35 con fade-out en los últimos 60 frames. Si no existe, el video va sin audio. No inventes un tono ni uses un placeholder. La línea de tiempo está cuadrada a 120 BPM: 1 beat = 15 frames, 1 compás = 60 frames; todos los cortes caen en múltiplos de 15 y los cambios de acto en múltiplos de 60.

---

## 4. Sistemas de efectos (todo por frame, todo determinista)

### 4.1 Cursor
- SVG tipo flecha macOS, 26 px de alto, relleno `#0c1613`, contorno blanco 1.5 px, sombra `0 2px 6px rgba(12,22,19,.28)`. Hotspot en la punta. Dibujado en un `<div>` absoluto encima del iframe, posicionado por `ref` (no por estado React).
- **Viajes**: cada viaje declara `desde` y `hasta` como **selector CSS dentro del iframe** o punto relativo `{x: 0..1, y: 0..1}` del área de app, más `f0`/`f1`. Ambos extremos deben resolverse **en el DOM del mismo frame** (después del replay): si la pantalla cambió, `desde` es un punto fijo o un selector que existe en la pantalla nueva. Nunca cachees posiciones entre frames. Si un selector no resuelve, lanza un error con el nombre de la toma: no lo tapes.
- Trayectoria: recta con un ligero arco (punto de control desplazado 6 % de la distancia, perpendicular), easing `easeTuvetia` (bezier .2,0,0,1). Ni rebote ni overshoot. Al llegar, el cursor se queda quieto entre 4 y 8 frames antes de hacer clic (regla "1 s de aire": el cursor no actúa en los primeros ni en los últimos ~15 frames de cada toma).
- **Clic**: cursor `scale` 1 → 0.86 en 3 frames y vuelve en 4. Anillo centrado en el hotspot: radio 0 → 44 px, borde 2 px `TV.accent`, opacidad .6 → 0, 14 frames. Al elemento clicado se le pone la clase `active-sim` durante 4 frames (§4.2). La acción de la app se aplica en el replay en el frame del clic (`accion.desde = frame del clic`), así el cambio de pantalla ocurre exactamente ahí.
- Cuando el cursor "sale de cuadro" (ráfaga, cierre), no lo dibujes; no lo dejes parqueado en una esquina.

### 4.2 Hover y active simulados
- Extrae del `<style>` de la copia todas las reglas que contengan `:hover` y `:active`, duplícalas reemplazando por `.hover-sim` y `.active-sim`, e inyéctalas al iframe al cargar (regex sobre el texto del CSS; no las escribas a mano).
- En cada frame, el elemento bajo el hotspot (resuelto por el selector de la toma, no por `elementFromPoint`) recibe `.hover-sim`. Como las transiciones están apagadas, suaviza tú lo importante: en los primeros 8 frames de hover interpola inline `transform: translateY(0 → -2px)` y `box-shadow: sm → md` con `easeTuvetia`; al salir, lo inverso en 6 frames. Las cards del tablero y las citas de la agenda "se levantan" así.
- No inventes hovers que la app no tiene. Si el selector no tiene regla `:hover`, no pasa nada visible salvo el cursor.

### 4.3 Cámara
- `<Camara>` envuelve iframe + cursor. Keyframes `{f, fx, fy, s}` con foco `(fx, fy)` en coordenadas relativas del área de app y escala `s` (1.0 – 1.6). Entre keyframes interpola con `spring({damping: 200})` estirado a la duración del tramo; `transform-origin: 0 0` fijo y `translate` calculado para que el foco quede centrado, con clamp para no enseñar el borde del iframe. Nunca `will-change` en este wrapper (queremos que Chrome re-rasterice al escalar; si el zoom se ve borroso, la solución es renderizar con `--scale=2`, no bajar el zoom).
- Movimientos permitidos: **push** lento (1.0 → 1.05 durante una toma quieta), **zoom a la acción** (1.2 – 1.4 sobre el diálogo, la lista de sugerencias, la marca de Penicilina, el carrito), **reset** a 1.0 en 20 frames al cambiar de pantalla. Nada de pans por deporte.

### 4.4 Toasts
- Se crean con `app.toast(texto, opts)` del propio motor (misma tipografía, icono y sombra que la app) en los frames de su ventana (§5). Como la animación CSS está apagada, anima tú el nodo `.toast`: entrada 5 frames `translateY(8px) → 0` + opacidad 0 → 1; salida 6 frames a opacidad 0. Un toast dura 126 frames (4.2 s, como en la app) salvo que la tabla diga otra cosa.
- Los toasts que la app emite sola durante el replay ("Consulta iniciada", etc.) se borran con `avisos.innerHTML = ""` y sólo vuelven si están en la tabla.

### 4.5 Textos en pantalla
- Bloque inferior izquierdo (x 160, baseline ≈ y 1035): rótulo mono 14 px 500 uppercase tracking .15em `TV.muted` (nombre del acto) y debajo la frase Archivo 700 44 px `TV.text` tracking -.022em, una sola línea.
- Entrada en cascada palabra por palabra con `<Entra>`: `gap 3`, `y 18`, `d 22`. El rótulo entra primero (`i 0`), luego cada palabra (`i 1…n`). Salida: opacidad a 0 en 8 frames. Todo en **tuteo**.
- Mientras un texto está visible no hay clics: el texto acompaña a una pasada o a un plano quieto.

### 4.6 Lo vivo dentro de la app
- Punto de "Grabando" (`.cockpit .fila > span[style*="pulso"]`, `.notch .vivo`): opacidad `0.35 + 0.65 * (0.5 + 0.5 * sin(2π · frame / 48))`.
- Barras `.eq i` (si aparecen en el notch): `scaleY` entre .4 y 1 con fases distintas por barra (`sin(2π·(frame/30 + k/5))`).
- Spinner `.girando` (estado "Guardando el audio" / "Transcribiendo"): `rotate(frame * 12deg)`.
- Cronómetro: `VIVO.segundos = floor((frame − frameInicioGrabacion) / 30)`; la app lo pinta como `mm:ss`.
- Diálogos y cajón: al abrirse, 10 frames de `scale .96 → 1` + opacidad sobre `.dialogo` / `.cajon` y el velo de 0 → su opacidad. Aplicado inline por frame.
- Scroll: `scrollTop` del contenedor interpolado por frame (la tabla dice cuánto y cuándo). Encuentra el contenedor scrolleable real (`overflow-y: auto`) de cada pantalla; no scrollees `window`.

### 4.7 Tuteo en la UI
La maqueta está escrita en voseo ("Revisala, editala y aprobala", "vos aprobás", "Confirmá", "Acordate"). El contenido de Tuvetia es tuteo colombiano, siempre (CLAUDE.md, línea roja 6). Después de cada `render()`, recorre los nodos de texto visibles del iframe y aplica `src/demo/tuteo.ts`, un mapa `RegExp → string`. Arranca con estos y completa lo que veas en las pantallas del guion (busca imperativos en -á/-é/-í y "vos"):

| Voseo | Tuteo |
|---|---|
| Revisala, editala y aprobala | Revísala, edítala y apruébala |
| Revisala y aprobala | Revísala y apruébala |
| vos aprobás | tú apruebas |
| Confirmá que revisaste | Confirma que revisaste |
| revisá antes del plan | revisa antes del plan |
| Acordate | Acuérdate |
| me llamás | me llamas |
| Iniciá | Inicia |
| Armá tu tablero | Arma tu tablero |
| Podés | Puedes |
| escribí libre | escribe libre |
| Probá / Empezá / Abrí / Evitá / Conectalo / Preguntale | Prueba / Empieza / Abre / Evita / Conéctalo / Pregúntale |
| Seguí hablando del cuadro y volvé a buscar | Sigue hablando del cuadro y vuelve a buscar |

No toques nombres propios, datos clínicos ni cifras. Lo que quede en voseo tras la pasada, listado en NOTAS.md.

---

## 5. Guion frame a frame

Convenciones: `f` = frame (30 fps). Selectores son del DOM del iframe. "Viaje A→B (f0–f1)" mueve el cursor; "clic fN" incluye anillo + `active-sim` + acción del replay en ese frame. La cámara parte en 1.0 salvo indicación. Todo texto de UI que se cite abajo está verificado en la maqueta; si al ejecutar encuentras otro, manda la maqueta y anótalo.

### Datos fijos del guion
- Sesión: `ACTIONS["login-demo"]` → Dra. Valentina Restrepo (u-1, admin), clínica La Arboleda, Bogotá.
- Paciente: **Luna** (`p-1`, Golden Retriever, 28.4 kg). Titular: **Mariana Osorio** (`o-1`, +57 310 448 2210). Alergia severa registrada: **Penicilina** (`a-1`, "Angioedema facial y urticaria a los 20 minutos").
- Cita de hoy: `ap-1` "Control de dermatitis", Luna, 9:00, confirmada.
- Consulta nueva: paciente Luna, motivo **"Vómito y decaimiento"**, "Empezar a grabar enseguida" marcado. Su transcripción es `GUION_POR_DEFECTO` (9 líneas, el caso de vómito) porque la consulta es nueva y no trae transcripción propia:
  1. Titular: Buenos días doctora, vengo porque lo noto decaído desde el fin de semana.
  2. Veterinario: ¿Ha comido normal?
  3. Titular: Come menos, y ayer vomitó una vez.
  4. Veterinario: Vamos a revisarlo. Mucosas rosadas, tiempo de llenado capilar de dos segundos.
  5. Veterinario: El abdomen está blando, no le duele a la palpación profunda.
  6. Titular: ¿Puede ser algo que comió?
  7. Veterinario: Es lo más probable. Vamos a dejar dieta blanda y un antiemético, y lo controlamos mañana.
  8. Titular: Perfecto. ¿Le sigo dando el agua normal?
  9. Veterinario: Sí, agua a voluntad. Si vuelve a vomitar más de dos veces, me llamas.
- Notas en vivo (tras la línea 5): `- Abdomen depresible, sin dolor a la palpación profunda.`
- Sugerencias (tras la línea 7): `- Si el vómito persiste 24 h, considerar ecografía para descartar cuerpo extraño.` · `- Registrar el antiemético en la ficha para que quede en la historia.` · `- Evitar Penicilina y su clase: alergia severa en la ficha.` → `VIVO.alerta = true` (punto ámbar en la pestaña Sugerencias).
- Nota SOAP (`generarNotaSOAP`): S "Titular refiere vómito y decaimiento…", O "Mucosas rosadas, TLLC 2 s. El abdomen está blando…", A "Cuadro **compatible con** vómito y decaimiento… **No hay evidencia suficiente** para cerrar un diagnóstico…", P "Dieta blanda… Evitar Penicilina y su clase: alergia severa registrada en la ficha de Luna.", cita [1] *Acute vomiting in dogs: a diagnostic approach*, Journal of Small Animal Practice, 2021, 62(5):331-342. `gateAlergia: true` → bloque rojo "Alergia severa · bloqueante" y botón "Revisar y aprobar" (`[data-act="aprobar-nota"]`) deshabilitado hasta marcar el check `[data-act="gate"]`. En el plan, la palabra Penicilina va en `<mark>`.
- Propuestas de Athos pendientes en WhatsApp: `ac-1` (Julián, limpieza dental de Rocco, ayuno) y `ac-2` (Ana, exóticos, consulta $120.000). Están `proposed` desde el seed.

### ACTO 1 · La clínica — f0–f420 (0:00–0:14) · rótulo `LA CLÍNICA`

| Toma | Frames | Pantalla / estado | Cursor | Cámara | Texto / toast |
|---|---|---|---|---|---|
| 1.1 Login | 0–90 | `#/login` (sin sesión). | Aparece en `{0.55, 0.72}` f0. Viaje → `[data-act="login-demo"]` (f12–48). Hover f48–58. **Clic f60** → `ACTIONS["login-demo"]` → `/dashboard/tablero`. | 1.0 | — |
| 1.2 Tablero | 90–255 | `/dashboard/tablero` con los widgets por defecto. | Quieto f90–150 (2 s). Pasada lenta: → pastilla "Citas (próx. 7 días)" o "Citas de hoy", la que esté visible (f150–170, hover) → "Facturado este mes" (f178–196, hover) → "Notas por revisar" (f204–220, hover) → dona de ventas (f228–245, hover). | Push 1.0 → 1.04 (f90–255) | Texto f105–245: **Toda tu clínica en una pantalla.** |
| 1.3 Agenda | 255–420 | Clic en la barra lateral → `/dashboard/calendario`; en el replay fija `CAL.vista = "Semana"` justo después (la app expone `CAL`; el botón real es `[data-act="cal-vista"][data-arg="Semana"]`). | Viaje dona → `.nav-item[data-arg="/dashboard/calendario"]` (f255–272). **Clic f276.** Viaje → la cita "Control de dermatitis · Luna 9:00" (búscala por texto dentro de la grilla de la semana; f290–330). Hover f330–405. **No hacer clic** (abre un formulario). | Zoom 1.25 al foco de la cita (f335–405) | — |

### ACTO 2 · La consulta — f420–f1560 (0:14–0:52) · rótulo `LA CONSULTA`

| Toma | Frames | Pantalla / estado | Cursor | Cámara | Texto / toast |
|---|---|---|---|---|---|
| 2.1 Iniciar consulta | 420–615 | Cajón "Nueva consulta" (`ACTIONS["nueva-consulta"]`). En el DOM del cajón: `select#cpp` (paciente), `input#cmm` (motivo), `input[name="grabar"]` (marcado por defecto), botón `button[form="form-cons"]` "Iniciar consulta". | Reset cámara. Viaje cita → `[data-act="nueva-consulta"][title="Iniciar consulta"]` de la barra (f425–450). **Clic f456** → cajón (entrada §4.6). Viaje → `select#cpp` (f470–482), **clic f486** y en ese frame `#cpp.value = "p-1"` (se ve "Luna · Perro · Mariana Osorio"). Viaje → `input#cmm` (f496–508), **clic f512**; tipeo "Vómito y decaimiento" 1 carácter cada 2 frames (f514–556) escribiendo `#cmm.value` por frame. Pasada breve sobre el check (f560–572, sin clic: ya está marcado). Viaje → botón "Iniciar consulta" (f574–588). **Clic f592** → `ACTIONS["crear-consulta"]` (pásale un evento con `preventDefault` y el `form#form-cons` real) → la app crea la consulta y, como Mariana no tiene consentimiento (`o-1.consentimiento` falsy; fuérzalo a `false` en el replay si hiciera falta), abre el diálogo. | Zoom 1.15 al cajón (f460–600) | Toast opcional f594–700: "Consulta iniciada". |
| 2.2 Consentimiento | 615–720 | Diálogo "Consentimiento del titular" (Ley 1581). **No lo cortes: vende confianza.** | Viaje → `[data-act="consentir"]` "El titular autoriza — empezar a grabar" (f640–678). Hover f678–688. **Clic f690** → cierra el diálogo y navega a `/dashboard/consultas/<idNuevo>`; en el replay, desde f690: `VIVO` en `fase: "grabando"`, `consultaId: idNuevo`, `pacienteNombre: "Luna"`, `guion: GUION_POR_DEFECTO`, `alergias: ["Penicilina"]`, `tabCockpit: "consulta"`, `pensando: true`. | Zoom 1.3 al diálogo (f615–640), reset en f690–710 | — |
| 2.3 Cockpit escuchando | 720–930 | Cockpit: cabecera "Consulta · Luna", pastilla "Grabando mm:ss" con punto menta pulsando, pestañas Consulta / Transcripción / Casos parecidos / Sugerencias, paneles "Notas en vivo" y "Mi cuaderno", tira "Se está oyendo". Transcripción palabra a palabra: cada línea del guion aparece como `provisional` (gris) a 5 palabras/s y al completarse pasa a `estable`; pausa de 12 frames entre líneas. Empieza en f735. Con ese ritmo la línea 5 termina ≈ f880 → `VIVO.notas` aparece ahí; la línea 7 termina ≈ f1000 (cae en la toma siguiente). Para que el punto ámbar exista antes del clic de 2.4, fija `VIVO.sugerencias` (las tres) y `VIVO.alerta = true` en **f900**. | Sale de cuadro (no se dibuja) desde f700 hasta f930. | Push 1.0 → 1.12 con foco en la tira "Se está oyendo" (f760–920) | Texto f740–905: **Athos escucha en modo fantasma.** |
| 2.4 Sugerencias | 930–1035 | Sigue grabando; la transcripción continúa (líneas 6–8). | Aparece en `{0.62, 0.55}` f930. Viaje → `[data-act="cockpit-tab"][data-arg="sugerencias"]` (f935–958). **Clic f962** → `VIVO.tabCockpit = "sugerencias"`, `VIVO.alerta = false`. Se ven las tres viñetas; la de **Penicilina** es la que importa. | Zoom 1.35 a la lista de sugerencias (f966–1000), sostener | — |
| 2.5 Acabar y organizar | 1035–1200 | Línea 9 termina ≈ f1060. **Clic** en "Acabar y organizar con Athos". Estados: f1072–1115 `fase: "subiendo"` (pastilla "Guardando el audio", spinner); f1115–1170 `fase: "transcribiendo"` ("Transcribiendo"); **f1170** cierre: `DB.transcripciones`, `c.estado = "review"`, `generarNotaSOAP`, `fase: "terminada"` → la ruta pinta el detalle con la nota en borrador. | Reset cámara f1035–1055. Viaje → `[data-act="terminar-grabacion"]` (f1040–1064). **Clic f1072.** Luego sale de cuadro hasta f1200. | 1.0 | Toast f1170–1296: "Consulta transcrita — Athos redactó la nota", detalle "Revísala y apruébala; nada entra a la historia sin tu aprobación.", acción "Abrir". |
| 2.6 Nota SOAP bloqueada | 1200–1395 | `/dashboard/consultas/<idNuevo>`: badges "Borrador — requiere aprobación" y "Redactada por Athos"; arriba el bloque rojo "Alergia severa · bloqueante"; "Revisar y aprobar" gris (`[data-act="aprobar-nota"]` deshabilitado). | Aparece en `{0.7, 0.5}` f1215 y se queda quieto; el scroll baja despacio (`scrollTop` 0 → hasta ver la cita [1], f1215–1370, easing suave) pasando por S, O, A ("compatible con" en negrita), P y la cita del *Journal of Small Animal Practice*. | Push 1.0 → 1.15 siguiendo la zona de lectura | Texto f1230–1390: **La nota está lista. Pero no entra sin ti.** |
| 2.7 Aprobar | 1395–1560 | Scroll vuelve arriba (f1395–1420). | Viaje → `[data-act="gate"]` "Confirmo que revisé el plan considerando esta alergia severa" (f1422–1440). **Clic f1447** → `UI.gateOk = true`; "Revisar y aprobar" pasa a menta. Viaje → `[data-act="aprobar-nota"]` "Revisar y aprobar" (f1460–1485). **Clic f1492** → `ACTIONS["aprobar-nota"](idNuevo)`: badge "Aprobada", el botón pasa a decir "Nota aprobada", y se habilitan "Informe para el titular" y "Facturar lo recetado" (este último sólo existe con la nota aprobada y un plan que mencione dieta o fármaco; el nuestro dice "Dieta blanda"). Scroll hasta el plan (f1500–1535) donde `mark` resalta **Penicilina**. Cursor sale de cuadro en f1540. | Zoom 1.4 al `mark` de Penicilina (f1505–1555) | Toast f1492–1618: "Nota aprobada y añadida a la historia clínica", detalle "Ya cuenta en el tablero y baja el contador de borradores." |

### ACTO 3 · Del consultorio a la caja — f1560–f2100 (0:52–1:10) · rótulo `DEL CONSULTORIO A LA CAJA`

| Toma | Frames | Pantalla / estado | Cursor | Cámara | Texto / toast |
|---|---|---|---|---|---|
| 3.1 Informe para el titular | 1560–1740 | Mismo detalle de consulta, scroll arriba. Diálogo del informe (`ACTIONS["informe"](idNuevo)`): texto en lenguaje llano "Hola Mariana. Te cuento cómo le fue a Luna en la consulta de hoy. Qué encontramos: … Qué creemos que tiene: … Qué hay que hacer en casa: …" en `textarea#informe-texto`. | Reset cámara f1560–1580. Aparece `{0.6, 0.45}` f1565. Viaje → `[data-act="informe"]` "Informe para el titular" (f1568–1588). **Clic f1592** → diálogo (entrada §4.6). Quieto f1600–1660 (se lee). Viaje → `[data-act="enviar-informe"][data-arg$=":wa"]` "Enviar por WhatsApp" (f1660–1672). **Clic f1678** → cierra y registra el mensaje. | Zoom 1.2 al diálogo (f1596–1620), reset f1680–1700 | Toast f1678–1804: "Informe enviado por WhatsApp", acción "Ver". |
| 3.2 Facturar lo recetado | 1740–1950 | `ACTIONS["facturar-recetado"](idNuevo)` → `/dashboard/facturacion/nueva` con el carrito cargado (el primer SERVICIO del catálogo + el MEDICAMENTO cuyo nombre aparezca en el plan; verifica que el antiemético entre; si el catálogo no lo empareja, anótalo y deja lo que la app cargue). Botón `[data-act="emitir-factura"]` "Emitir factura". | Viaje → `[data-act="facturar-recetado"]` (f1742–1762). **Clic f1772.** Pasada por las dos líneas del carrito (f1800–1850, hover si existe). Viaje → "Emitir factura" (f1868–1890). **Clic f1897** → `crearFactura("EMITIDA")`: número `FV-11xx`, pasa al detalle de la factura. Cursor quieto hasta f1950. | Zoom 1.1 al carrito (f1780–1860), reset f1897–1915 | Toast f1897–2023: el texto exacto que emite la app (`${numero} emitida…`), léelo del DOM, no lo escribas. |
| 3.3 Tablero movido | 1950–2100 | `/dashboard/tablero`: "Facturado este mes" subió, "Notas por revisar" bajó. | Viaje → `.nav-item[data-arg="/dashboard/tablero"]` (f1952–1972). **Clic f1982.** Quieto 20 frames, luego sale de cuadro (f2005). | 1.0; en f1995–2040 un anillo de atención de 1 px `TV.accent` (opacidad .5 → 0, 30 frames) alrededor de las dos pastillas que cambiaron | Texto f1995–2095: **Todo se conecta solo.** |

### ACTO 4 · Cierre — f2100–f2400 (1:10–1:20)

| Toma | Frames | Pantalla / estado | Cursor | Cámara | Texto |
|---|---|---|---|---|---|
| 4.1 Ráfaga | 2100–2280 | Tres planos quietos de 60 frames con fundido cruzado de 6 frames entre ellos: **f2100** `/dashboard/comunicaciones` (bandeja de WhatsApp con las dos propuestas de Athos pendientes visibles; si la bandeja abre por defecto en otra conversación, fija `COM.tel` al de `ac-1`) · **f2160** `/dashboard/facturacion` (Ventas) · **f2220** `/dashboard/facturacion/inventario` (Existencias). | Sin cursor. | Push 1.0 → 1.06 en cada plano | Rótulos mono en la banda, en cascada: `COMUNICACIONES` · `VENTAS` · `INVENTARIO`. El microrrótulo `DEMO · DATOS DE EJEMPLO` se mantiene. |
| 4.2 Logo + claim | 2280–2400 | La ventana se desvanece y baja de escala (1 → .96, opacidad 1 → 0, 10 frames). Fondo nieve con grano. | Sin cursor. | — | Ver §6. |

---

## 6. Cierre (f2280–f2400)

Sobre el fondo nieve, centrado, en cascada con `<Entra>` (`gap 8`):
1. Logo `public/marca/logo-horizontal.svg` (cópialo de `../marca/logo/logo-horizontal.svg`), 520 px de ancho, `i 0`.
2. Claim, Archivo 700 64 px, grafito, dos líneas centradas, tracking -.022em, `i 1`: **Ningún veterinario debería volver a escribir una ficha.**
3. Pastilla CTA, `i 2`: fondo `PRIMITIVOS.whatsapp`, texto blanco Inter Tight 600 30 px, radio 999, padding 20×36, con el logo de WhatsApp a la izquierda (copia el SVG oficial que ya usa la maqueta en su registro `LOGOS`): **Escríbenos al WhatsApp**. Es el único bloque de color del cierre. Regla absoluta: todo cierra en WhatsApp.
4. Microrrótulo mono 14 px 500 uppercase tracking .16em `TV.muted`, `i 3`: **BUSCAMOS 10 VETERINARIOS · 0/10**.

Sostener hasta f2400. Sin fundido a negro (el negro es de Athos).

---

## 7. Reglas de marca que este video no puede pisar

- **Athos nunca diagnostica ni firma.** La nota dice "compatible con" y "no hay evidencia suficiente"; el vet marca el check y aprueba. No agregues ningún texto que sugiera lo contrario. La toma 2.7 es la tesis del producto: que se vea el check y el clic del vet.
- **Cero métricas o clínicas inventadas como reales.** La Arboleda es demo y se declara con el microrrótulo permanente. Nada de "ahorra 2 h al día".
- **Nunca competidores, nunca burla de lo clínico, nunca atacar la facturación.**
- **Privacidad:** el diálogo de consentimiento es el de la app. No añadas overlays con cifras de retención de audio (la maqueta dice 4 días y la línea roja 8 dice 7; no es tu pelea: anótalo en NOTAS.md y no lo amplifiques).
- **Tuteo** en todo lo que Remotion escriba y en la UI (§4.7). "Tuvetia" es una palabra.
- **Motor de movimiento:** cada elemento entra solo (`delay = i · gap`), springs sin rebote, ningún `overflow: hidden` alrededor de textos que se trasladan. Nada de rotateX de cajas ni barridos.
- **Color:** menta sólo en acción (anillo de clic, CTA); grafito sólo como texto y como los objetos de Athos que la app ya pinta; ningún coral, ningún degradado.
- **El sufrimiento del vet no es el gancho**: los textos son constatación y promesa, no miedo.

---

## 8. Estructura de archivos esperada

```
public/app/tuvetia-app.html        copia parchada (§2.2)
public/marca/logo-horizontal.svg   logo oficial
public/musica/pista.mp3            opcional; si no existe, sin audio
src/demo/DemoSaaS.tsx              composición: lienzo, ventana, cámara, banda, cierre
src/demo/guion.ts                  la línea de tiempo de §5 como datos puros (tomas, viajes, clics, cámara, textos, toasts, scroll)
src/demo/estado.ts                 estadoEn(frame): replay determinista sobre window.app (§2.4)
src/demo/AppEmbebida.tsx           IFrame + delayRender + aplicar estado + post-proceso
src/demo/Cursor.tsx                flecha, viajes, clic, anillo
src/demo/Camara.tsx                keyframes de foco/escala
src/demo/Texto.tsx                 banda inferior: rótulo + frase en cascada
src/demo/Cierre.tsx                logo + claim + CTA
src/demo/hover.ts                  generación de .hover-sim / .active-sim desde el CSS de la app
src/demo/tuteo.ts                  mapa voseo → tuteo
src/demo/vivo.ts                   transcripción por frame, notas, sugerencias, cronómetro
src/demo/NOTAS.md                  parches, internos expuestos, desvíos, pendientes
```

`src/Root.tsx`: agrega `<Folder name="Demos"><Composition id="DemoSaaS" … width={1920} height={1080} fps={30} durationInFrames={2400} /></Folder>`. No borres las composiciones que ya existen.

Tipado estricto, `npm run lint` en verde. Nada de `any` en `guion.ts`: define los tipos de toma, viaje, clic, keyframe de cámara, texto y toast.

---

## 9. Verificación y entrega

1. `npm run lint`.
2. Stills de control con `npx remotion still DemoSaaS out/qa/f<N>.png --frame=<N>` para N = 60, 200, 350, 560, 690, 860, 990, 1120, 1300, 1520, 1650, 1900, 2020, 2200, 2350. Ábrelos (Read) y compara con la maqueta abierta en un navegador (`node ../captura/servir.mjs` la sirve en localhost:8080). Lo que no coincida con la tabla de §5, se corrige.
3. **Determinismo:** renderiza el frame 1300 dos veces (`--frame=1300`) y compáralos byte a byte; luego renderiza 1290–1310 con `--concurrency=4` y mira que no haya saltos. Si algo difiere, el replay no es puro: arréglalo antes de seguir.
4. **Nitidez del zoom:** el still de f990 (zoom 1.35) debe leerse nítido. Si no, render final con `--scale=2` y anótalo.
5. Render: `npx remotion render DemoSaaS out/demo-saas.mp4 --codec=h264 --crf=16`. Duración exacta 80.000 s.
6. Corre `/revisar` sobre los textos en pantalla, el cierre y los toasts (son contenido publicable).
7. NOTAS.md: parches a la copia, internos expuestos, selectores que tuviste que cambiar, voseo restante, cualquier toma que se desvíe de §5 y por qué, y qué harías en la siguiente pasada.

---

## 10. Lo que no se hace

- No grabar pantalla ni usar Playwright, `clips-raw/`, `capturar-clips.mjs` ni ningún .webm/.mp4 previo.
- No reconstruir pantallas en JSX salvo el último recurso de §2.5, y nunca la app completa.
- No cambiar textos, datos ni layout del HTML más allá de los parches de §2.2.
- No inventar dominios, URLs, números de teléfono, cifras ni clínicas. No poner "app.tuvetia.com" ni nada parecido en la barra.
- No usar Bricolage Grotesque, coral `#f0764e`, negro fuera de Athos, degradados, brillos, partículas.
- No poner música placeholder.
- No dejar el cursor parqueado en una esquina "por si acaso": si no actúa, no se dibuja.
- No cerrar en otra cosa que no sea WhatsApp.
