# ORDEN DE CAMBIO v2 · ExplainerRAG

> Se lee **junto con** `prompts/explainer-rag.md`, no en su lugar. Lo que este archivo dice reemplaza lo que diga el encargo original; todo lo que no se menciona acá sigue igual.
>
> Aplica sobre el plan ya aprobado. Si ya construiste parte, ajusta lo construido: los cambios de §A y §B son de contenido de la app, los de §C son de guion.

---

## Resumen de lo que cambia

1. La pieza abre con un **título**: *VetGPT — una IA especializada para veterinarios.*
2. Se muestra el **selector de contexto** (consulta general vs. un paciente concreto). Ya existe en la maqueta y no se había filmado.
3. El corpus pasa a **120.000 fuentes veterinarias** y el esquema carga con la promesa de no alucinar.
4. Se agrega la **repregunta**: VetGPT devuelve preguntas con opciones antes de responder, y el vet elige. **Esto no existe en la maqueta y hay que construirlo.**
5. La duración sube de 1500 a **1560 frames** (52 s) y la línea de tiempo se rehace entera. El acto de escritorio se comprime.

---

## A. Cambio de cifra: el corpus son 120.000 fuentes

`CORPUS = 120000`, y el rótulo del esquema es `FUENTES VETERINARIAS`, no «documentos». Confirmado por David como la cifra buena; reemplaza las 61.540 de `CLAUDE.md`.

Como parte de este trabajo, **actualiza también `../CLAUDE.md`**: la frase «citando literatura real (61.540 papers)» pasa a «citando literatura real (120.000 fuentes veterinarias)». Si no lo haces, el repo queda con dos cifras en conflicto y la próxima pieza hereda el problema.

Lo que **no** se toca: la carpeta `contenido/2026-07/006-corpus-61540/` y su guion. Es una pieza ya escrita con la cifra de su momento; renombrarla no aporta y rompe enlaces del calendario. Anótalo en NOTAS.md.

---

## B. La repregunta — construir el flujo en la maqueta

Esto es una función real del producto que la maqueta todavía no refleja. Se agrega a `public/app/tuvetia-app.html` siguiendo sus propios patrones, no como algo hecho para el video. Va documentado en NOTAS.md junto a los otros dos parches.

### B.1 Los datos

Junto a `responderVetGPT`, agrega el registro de repreguntas. **No modifiques `responderVetGPT`**: la repregunta es un paso previo, no un reemplazo de la respuesta.

```js
/* Repreguntas: cuando la pregunta admite varias lecturas clínicas, VetGPT pregunta antes de
   responder en vez de asumir. El vet elige y la respuesta se afina sobre lo elegido. */
const REPREGUNTAS = {
  malassezia: {
    texto: "Antes de responder, dos cosas que cambian la recomendación:",
    campos: [
      { id: "especie",     rotulo: "¿Especie?",                        opciones: ["Perro", "Gato"] },
      { id: "recurrencia", rotulo: "¿Primer episodio o recurrente?",   opciones: ["Primer episodio", "Recurrente"] }
    ]
  }
};
```

Las dos preguntas no son de adorno: en otitis por *Malassezia* la especie y la recurrencia sí cambian el manejo, y eso es lo que hace creíble el beat. Si al construirlo ves que la respuesta de la rama `/malassezia|otitis/` no menciona ni especie ni causa de base, revísalo — sí las menciona («casi siempre hay una causa de base», «tratar sólo el hongo garantiza la recaída»), y por eso estas dos y no otras.

### B.2 La forma del mensaje

Un mensaje de repregunta es `{ rol: "assistant", texto, repregunta, elegidas }`, donde `repregunta` es una entrada de `REPREGUNTAS` y `elegidas` es `{ [campo.id]: opción }`.

### B.3 El render

En `MensajeChat`, después del bloque de `m.texto` y antes de `m.accion`:

```js
${m.repregunta ? html`<div class="repreguntas">${m.repregunta.campos.map(c => html`
  <div>
    <span class="rotulo" style="display:block;margin-bottom:6px">${c.rotulo}</span>
    <div class="filaw" style="gap:6px">${c.opciones.map(o => html`
      <button class="sug ${m.elegidas && m.elegidas[c.id] === o ? "elegida" : ""}"
              data-act="repregunta" data-arg="${c.id}:${o}">${o}</button>`)}</div>
  </div>`)}</div>` : ""}
```

CSS al final del `<style>`, antes del PARCHE DEMO:

```css
.repreguntas{ display:flex; flex-direction:column; gap:10px; margin-top:6px; }
.sug.elegida{ background:var(--accent-soft); border-color:var(--accent); color:var(--accent-text); font-weight:500; }
```

Reusa `.sug`, `.filaw` y `.rotulo` que ya existen. No inventes clases nuevas más allá de esas dos.

### B.4 La acción

En `ACTIONS`, junto a `chat-sug`:

```js
"repregunta": a => {
  const corte = a.indexOf(":");
  const id = a.slice(0, corte), op = a.slice(corte + 1);
  const m = CHAT.mensajes[CHAT.mensajes.length - 1];
  if (!m || !m.repregunta) return;
  if (!m.elegidas) m.elegidas = {};
  m.elegidas[id] = op;
  repintarChat(false);
},
```

### B.5 Exponer

Agrega `REPREGUNTAS` a `window.app`, junto a `responderVetGPT` y `repintarChat` del parche que ya tenías previsto.

### B.6 Verificación de este parche

Abre la copia en el navegador, entra como clínica demo, y comprueba a mano que el bloque de repreguntas se pinta y que al hacer clic en una opción queda marcada. **Antes** de meterlo en el replay. Si no funciona a mano, no va a funcionar por frame.

---

## C. La línea de tiempo nueva

**1560 frames** (52 s). Todos los cortes en múltiplos de 15; los cambios de acto en múltiplos de 60. Esta tabla **reemplaza completa** la §5 del encargo original.

| Frames | Acto | Qué pasa | Rótulo | Frase |
|---|---|---|---|---|
| 0–120 | 1 · El título | Ventana de escritorio en plano general (§3.1) en `/dashboard/asistente`, hilo vacío. Encima, centrado sobre el fondo nieve entre y 300 y y 600, el título (§C.1). Cámara 1.0 → 1.04. | — | *(título propio, no banda)* |
| 120–300 | 2 · El contexto | Corte al encuadre de columna (§3.2). El cursor va al chip `.ctx-chip` que dice «Consulta general»; clic en f150; entra el diálogo «Contexto de la conversación»; el cursor baja a la fila de **Luna** y hace clic en f240; el diálogo se cierra y el chip queda en «Luna». | `EL CONTEXTO` | Le preguntas en general, o sobre un paciente tuyo. |
| 300–480 | 3 · La pregunta | Se escribe la pregunta del encargo en `CHAT.entrada` (f310–430) con push de cámara sobre el compositor, y se envía en f450. | `LA PREGUNTA` | Le preguntas como le preguntarías a un colega. |
| 480–600 | 4 · También en el celular | El anuncio y la transición a móvil, igual que antes pero comprimido: f480–500 vuelta al plano general, f500–530 la ventana se encoge y entra la frase, f530–600 sube la pantalla de móvil. | `EL MISMO HILO` | También lo puedes usar desde tu celular. |
| 600–780 | 5 · La repregunta | Entra el mensaje de repregunta con sus dos campos. Toque en «Perro» (f690) y en «Recurrente» (f735); cada opción queda marcada en menta. | `LA REPREGUNTA` | Antes de responder, pregunta. Así la respuesta le queda a tu caso. |
| 780–960 | 6 · El corpus | Esquema (§5.1 del encargo, con los frames corridos): scrim f780–800, retícula f800–860, contador a **120.000** (inicio 800, d 90) con rótulo `FUENTES VETERINARIAS`, dos marcas en menta f870–910, bajan y se vuelven `[1]` `[2]` f910–940, scrim fuera f940–960. | `ESQUEMA` | Evitamos las alucinaciones: cada respuesta se apoya en fuentes que puedes abrir. |
| 960–1200 | 7 · La respuesta | f960–990 la fila «Consultando la literatura veterinaria…» con el spinner. f990–1140 la respuesta se escribe palabra por palabra con scroll pegado al fondo. f1140–1200 zoom 1.35 sobre la pastilla `[1]`. | `LA RESPUESTA` | Lo que se apoya en literatura trae su marca. |
| 1200–1320 | 8 · La prueba | Toque sobre la consulta de **Luna** que tiene nota con citas; scroll hasta «Referencias citadas» y zoom 1.4 sobre la primera entrada. | `LA PRUEBA` | Título, revista, año. Puedes ir al artículo. |
| 1320–1440 | 9 · El límite | Vuelta al asistente. **Sin teclear**: en f1320 la segunda pregunta ya aparece enviada en el hilo; f1330–1400 se escribe la respuesta de abstención; f1400–1440 se sostiene con las tres sugerencias visibles. | `EL LÍMITE` | Cuando no tiene fuente, lo dice. |
| 1440–1560 | Cierre | §6 del encargo, sin cambios. | — | — |

Ajustes que arrastra esta tabla: `DURACION = 1560`; el microrrótulo `DEMO · DATOS DE EJEMPLO` va de f0 a f1440; el segundo tramo de tecleo del sonido desaparece (el acto 9 ya no teclea) y el primero pasa a f310–430; los keyframes de cámara y las tablas de cursor, toques y scrolls se recorren a los frames nuevos.

### C.1 El título (acto 1)

Dos líneas, centradas, entre y 300 y y 600, sobre el fondo nieve y por encima de la ventana:

- Línea 1: **VetGPT** — Archivo 700, 108 px, `TRACKING.titular`, `TV.text`.
- Línea 2: **una IA especializada para veterinarios** — Archivo 700, 52 px, `TV.text2`.

Cascada con `<Entra>`: la línea 1 como un solo elemento (`i 0`), la línea 2 palabra por palabra (`i 1…n`), `gap 4`, `y 24`, `d 26`. Sale por opacidad en 10 frames a partir de f110.

Grafía **VetGPT**, una palabra, con esa capitalización exacta. Ni «Vet GPT» ni «VETGPT».

### C.2 El contexto (acto 2) — lo que ya existe en la maqueta

No hay nada que construir acá: el chip y el diálogo son reales. Lo que hay que saber para el replay:

- El chip es `button.ctx-chip[data-act="selector-contexto"]`, dentro de `form.compositor`. Sin paciente muestra «Consulta general»; con paciente, el nombre, y gana la clase `fijo`.
- El diálogo lo abre `abrirSelectorContexto()` (expónlo en `window.app` si te hace falta, junto a los otros internos). Lista «Consulta general» y después `DB.pacientes`, cada uno con especie y titular.
- Elegir es la acción `elegir-contexto` con el id del paciente. **Ojo: `elegir-contexto` hace `CHAT.mensajes = []`.** Por eso el contexto se escoge en el acto 2 y la pregunta se manda en el acto 3, nunca al revés. Si lo inviertes, el hilo se borra en cámara.
- El paciente es **Luna** (`p-1`). No está elegido por bonito: la nota con dos citas del acto 8 es de una consulta de Luna, así que el contexto que se escoge y la ficha que se abre después son del mismo animal. Resuélvelo en el replay desde `DB.notas.find(x => x.citas?.length)` como ya estaba previsto, y **verifica que el paciente de esa consulta sea el mismo que elegiste**. Si el seed cambia y dejan de coincidir, elige el contexto a partir de la nota, no al revés, y anótalo.
- Los dos tooltips del chip llevan la frase del producto: «Consulta general — respondo dudas médicas con literatura veterinaria citada, sin ficha de un paciente» y «Hilo con memoria — recuerdo el contexto de Luna y las respuestas anteriores de esta conversación». No se muestran en cámara (son `title`), pero son la fuente de la frase de la banda: no inventes otra promesa.

### C.3 La repregunta (acto 5) — el replay

Beats nuevos, sobre lo construido en §B:

| desde | beat |
|---|---|
| 600 | `push { rol:"assistant", texto: REPREGUNTAS.malassezia.texto, repregunta: REPREGUNTAS.malassezia }`; `CHAT.estado = "libre"` |
| 690 | `m.elegidas = { especie: "Perro" }` |
| 735 | `m.elegidas = { especie: "Perro", recurrencia: "Recurrente" }` |
| 960 | el mensaje de repregunta se queda en el hilo (no se borra) y debajo entra el mensaje de respuesta de `responderVetGPT`, como en el encargo |

El mensaje de repregunta **no desaparece** cuando llega la respuesta: queda arriba en el hilo, que es lo que hace legible el beat cuando alguien vuelve a ver el video.

---

## D. Lo que este cambio le exige a las líneas rojas

Dos frases nuevas pisan cerca y hay que sostenerlas contra el still, no contra las ganas:

- **«Evitamos las alucinaciones: cada respuesta se apoya en fuentes que puedes abrir.»** Es cierta al nivel de la respuesta —la del acto 7 cita dos fuentes y el acto 8 las abre— y el acto 9 muestra qué pasa cuando no hay fuente. Lo que **no** se puede escribir es «ninguna afirmación queda sin fuente» ni «cero alucinaciones»: en la respuesta real hay viñetas sin `[n]`, y una promesa absoluta que el propio cuadro desmiente es peor que no prometer nada. Si al ver el still de f1100 la frase te queda grande, la que sobrevive es «Respuestas con fuente. Y cuando no la hay, te lo dice.»
- **«Antes de responder, pregunta. Así la respuesta le queda a tu caso.»** Describe lo que se ve. No la conviertas en «acierta más» ni en ningún porcentaje: no hay medición y la línea roja 2 lo prohíbe.

El único número de la pieza sigue siendo `CORPUS`, ahora 120.000, más los años y el locus de las citas.

---

## E. QA — reemplaza la tabla de §9

| Frame | Qué tiene que verse |
|---|---|
| 0060 | Título completo sobre la ventana de escritorio. Grafía `VetGPT`. |
| 0180 | Diálogo «Contexto de la conversación» abierto, con «Consulta general» y la lista de pacientes. |
| 0270 | El chip del compositor diciendo **Luna**, con el hilo vacío. |
| 0430 | La pregunta escrita en el compositor, **legible**, sin recortes. |
| 0555 | Transición a medio camino: móvil subiendo, escritorio todavía visible. |
| 0620 | Móvil a sangre, con la pregunta en el hilo y el chip en «Luna». |
| 0700 | Bloque de repregunta con los dos campos y sus opciones. |
| 0760 | Las dos opciones elegidas, marcadas en menta. |
| 0880 | Esquema: contador corriendo hacia 120.000, rótulo `FUENTES VETERINARIAS`. |
| 1080 | Respuesta a medio escribir, sin ningún `[` ni `**` partido. |
| 1170 | Zoom sobre la pastilla `[1]`. |
| 1260 | Tarjeta «Referencias citadas» con título, revista, año. |
| 1400 | Respuesta de abstención con las tres sugerencias. |
| 1520 | Cierre con la pastilla de WhatsApp. |

Al checklist del encargo se le agregan cuatro líneas:

- [ ] En f0270 el chip dice «Luna» **y** el hilo está vacío (si tiene mensajes, elegiste el contexto después de preguntar y se van a borrar en cámara).
- [ ] En f0620 el chip sigue diciendo «Luna» en el layout móvil.
- [ ] En f0760 las dos opciones elegidas se distinguen claramente de las no elegidas en una pantalla de teléfono.
- [ ] En ningún frame aparece la cifra 61.540.