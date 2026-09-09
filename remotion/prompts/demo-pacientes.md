# ENCARGO · `DemoPacientes` — la historia se escribe sola, y no entra sin ti

> Se lee **después** de `_plantilla-demo-producto.md`. Acá va sólo lo propio de la pieza. Antes de nada, `public/app/NOTAS-MAQUETA.md`: el botón «Informe para el titular» de la ficha se construyó ahí y sus límites mandan.

---

## 1. La promesa

> VetGPT escribe la ficha, tú la apruebas —y si hay riesgo, no te deja aprobarla a la ligera— y con un clic el titular se entera.

Tres cosas en una cadena, no tres pantallazos: **se escribe sola → tú apruebas → se comparte**.

El corazón de la pieza es el segundo eslabón, no el primero. Cualquiera promete que la IA escribe la nota; lo que nadie muestra es el sistema **frenando al vet** cuando el paciente tiene una alergia severa. Eso es la línea roja 1 hecha imagen, y es lo que convierte la pieza en confianza en vez de en demo.

---

## 2. Superficies

**Sólo escritorio.** Revisar una historia clínica y aprobar una nota es trabajo de consultorio, en el computador. Mismo tratamiento que `DemoVentas`: plano general con marco para establecer y cortes secos a encuadres cerrados cuando algo tiene que leerse.

---

## 3. La cadena de datos

**Paciente: Luna (`p-1`).** No es capricho: es la única del seed que reúne las tres cosas que la pieza necesita.

- Tiene **alergia severa a Penicilina** (angioedema), que dispara la banda roja de la ficha **y** la guarda de aprobación (`n.gateAlergia`).
- Tiene dos consultas con nota y transcripción, así que la sección «Historia de consultas» se ve poblada.
- Es la paciente de las dos piezas anteriores. La serie se lee como una sola clínica.

**La nota que se aprueba: `n-1`** (consulta `c-1`, otitis por Malassezia). En el seed viene `approved`; **el replay la pone en `draft`** antes del acto 3. Es un estado que el producto genera de verdad —toda nota nace en borrador— así que no se está inventando nada: se está filmando el momento anterior al que el seed congela.

Consecuencia encadenada, y es la que hace la pieza:

1. Con `n-1` en borrador, **no hay ninguna nota aprobada** para Luna → el botón «Informe para el titular» de la ficha sale **deshabilitado**, con su tooltip.
2. Se aprueba la nota (pasando por la guarda).
3. El mismo botón, en la misma ficha, **ahora está activo**. El vet no hizo nada más.

Resuelve todo en el replay desde `DB`: el paciente por nombre, la nota por `consultaId`, el titular por `ownerId`. Si el seed cambia y `n-1` deja de tener `gateAlergia`, **para y avisa**: sin la guarda la pieza pierde su acto central.

---

## 4. Línea de tiempo — 1500 frames (50 s)

| Frames | Acto | Qué pasa | Rótulo | Frase |
|---|---|---|---|---|
| 0–120 | 1 · La ficha | Plano general de la ventana en `/dashboard/patients/p-1`. Se lee la forma: cabecera con la foto y los datos, la banda roja de alergia, las tres tarjetas. | `LA HISTORIA` | Todo lo de tu paciente, en una sola pantalla. |
| 120–360 | 2 · Lo que ya está | Corte al encuadre de la sección «Historia de consultas». El primer `details` abierto muestra S/O/A/P con sus citas. Scroll corto dentro de la sección. | `S · O · A · P` | Cada consulta queda escrita, con la literatura que la respalda. |
| 360–600 | 3 · La nota nueva | Corte a `/dashboard/consultas/${c-1}`. Badge **«Redactada por VetGPT»** y badge **«Borrador — requiere aprobación»**, los dos en cámara. El texto de la nota es el que la app generó. | `LA REDACTÓ VetGPT` | La escribe él, con lo que se dijo en la consulta. |
| 600–840 | 4 · El freno | El puntero va al botón de aprobar y hace clic. **No aprueba**: sale el toast rojo pidiendo confirmar la alergia severa. Corte a la casilla de la guarda, el puntero la marca. | `NO ENTRA SIN TI` | Luna es alérgica a la penicilina. Hasta que no lo confirmes, no aprueba. |
| 840–1020 | 5 · Aprobada | Segundo clic en aprobar. Toast **«Nota aprobada y añadida a la historia clínica»**. Corte de vuelta a la ficha: la consulta figura con badge «Aprobada». | `APROBADA` | Tú firmas. Recién ahí entra a la historia. |
| 1020–1260 | 6 · Un clic | En la misma ficha, el botón «Informe para el titular» **ahora está activo**. Clic. Entra el diálogo con el texto ya redactado en lenguaje llano —qué encontramos, qué creemos que tiene, qué hacer en casa—. Encuadre cerrado sobre el cuerpo del texto. | `PARA EL TITULAR` | Y lo que el dueño necesita saber, ya está escrito. |
| 1260–1380 | 7 · Enviado | Clic en «Enviar por WhatsApp». Corte a `/dashboard/comunicaciones`: el mensaje está en el hilo de la titular, con su doble check. | `UN CLIC` | Le llega por WhatsApp, sin que copies nada. |
| 1380–1500 | Cierre | §5 de la plantilla. | — | — |

Cambios de acto en múltiplos de 60; cortes internos en múltiplos de 15.

**El acto 4 es innegociable.** Si por tiempo hay que recortar, se recorta del 2.

---

## 5. Beats del replay

| desde | beat |
|---|---|
| 0 | resolver `ctx.idPaciente` (Luna), `ctx.idConsulta` (su consulta con nota y `gateAlergia`), `ctx.idTitular`; **poner esa nota en `estado: "draft"`** y la consulta en `estado: "review"`; `UI.gateOk = false`; ruta `/dashboard/patients/${ctx.idPaciente}` |
| 360 | ruta `/dashboard/consultas/${ctx.idConsulta}` |
| 640 | primer intento de aprobar → la acción de aprobar corre y **rebota** por la guarda; capturar el toast rojo y mostrarlo en su ventana |
| 760 | `UI.gateOk = true` (equivale a marcar la casilla) |
| 860 | segundo intento → la nota pasa a `approved`, la consulta a `completed`; capturar el toast |
| 960 | ruta `/dashboard/patients/${ctx.idPaciente}` |
| 1080 | abrir el diálogo del informe con la consulta resuelta (`abrirInforme`), vía el botón nuevo de la ficha |
| 1290 | enviar por WhatsApp; ruta `/dashboard/comunicaciones`; abrir el hilo de la titular |

**No llames a la acción de aprobar dos veces sin pasar por la guarda**: el primer intento tiene que rebotar de verdad, no simularse. Es la prueba de que el freno existe.

**El canal correo no se filma**: `NOTAS-MAQUETA.md` dice que no deja rastro. Sólo WhatsApp.

---

## 6. Lo que la pieza afirma

| Frase | Qué la sostiene |
|---|---|
| «Cada consulta queda escrita, con la literatura que la respalda.» | Los bloques S/O/A/P en cámara con sus marcadores de cita. |
| «La escribe él, con lo que se dijo en la consulta.» | El badge «Redactada por VetGPT» que la app pinta sola. |
| «Hasta que no lo confirmes, no aprueba.» | El clic que rebota y el toast rojo. Es literal. |
| «Tú firmas. Recién ahí entra a la historia.» | El cambio de badge y la consulta apareciendo aprobada en la ficha. |
| «Le llega por WhatsApp, sin que copies nada.» | El mensaje en el hilo de la titular, con el texto del diálogo. |

**Prohibido:** decir que VetGPT diagnostica, decide o «resuelve» la consulta; prometer PDF, portal del titular o resumen de la historia completa (no existen); mencionar el correo.

---

## 7. QA — stills

| Frame | Qué tiene que verse |
|---|---|
| 0060 | Ficha de Luna completa, con la banda roja de alergia. |
| 0240 | Bloques S/O/A/P legibles, con marcadores de cita. |
| 0420 | Los dos badges: «Redactada por VetGPT» y «Borrador». |
| 0680 | El toast rojo de la guarda, legible. |
| 0800 | La casilla de la guarda marcada. |
| 0900 | Toast «Nota aprobada y añadida a la historia clínica». |
| 0990 | La ficha con la consulta en badge «Aprobada». |
| 1060 | El botón «Informe para el titular» **activo**. |
| 1180 | El diálogo con el texto en lenguaje llano, legible. |
| 1320 | El mensaje en el hilo de WhatsApp de la titular. |
| 1440 | Cierre. |

Propias de esta pieza:

- [ ] En un still del acto 1 (antes de aprobar) el botón del informe se ve **deshabilitado**; en f1060, activo. El contraste es el argumento.
- [ ] En f0680 el toast rojo no queda tapado por el dock.
- [ ] El texto del diálogo en f1180 es el que genera la app, no uno escrito en el guion.

---

## 8. Parámetros

Música y cierre como `DemoVentas`. `CON_VOZ = false` con el cableado y la locución por acto en las notas. 1500 frames.