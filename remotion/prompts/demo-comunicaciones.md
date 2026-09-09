# ENCARGO · `DemoComunicaciones` — el WhatsApp de la clínica, dentro de la historia clínica

> Se lee **después** de `_plantilla-demo-producto.md`. Antes de nada, `public/app/NOTAS-MAQUETA.md`.

---

## 1. La promesa

> Los titulares te escriben donde siempre. Tú les respondes sin salir de la ficha, y con la respuesta ya redactada.

El argumento no es «tenemos WhatsApp». Es **no salir de la app**: el mensaje, el paciente y la historia están en el mismo sitio, y por eso la respuesta puede venir escrita con los datos correctos.

---

## 2. Superficies

**Escritorio.** Es la pantalla donde la bandeja tiene sentido: lista de conversaciones a la izquierda, hilo a la derecha. En móvil el `.inbox` colapsa a una columna y se pierde justo eso.

---

## 3. La cadena

**La conversación es la de Julián Betancur.** Llegó con **dos preguntas sin responder** —si la limpieza dental de Rocco es hoy a las 3, y si tiene que llegar en ayunas— y el seed trae una **propuesta de VetGPT pendiente** que responde exactamente las dos, con la hora y las 12 horas de ayuno. Ese emparejamiento es el argumento entero de la pieza y ya está en los datos: no hay que fabricarlo.

Resuelve en el replay el contacto y su propuesta desde `DB.wa.propuestas`; si el seed cambiara y la propuesta dejara de corresponder a los mensajes del hilo, **para y avisa**.

**Y hay un beat de contexto que no cuesta nada:** las cinco conversaciones del seed llegan **todas sin responder**, con su badge. El plano de apertura es esa lista. Es el día real de una clínica.

---

## 4. Línea de tiempo — 1500 frames (50 s)

| Frames | Acto | Qué pasa | Rótulo | Frase |
|---|---|---|---|---|
| 0–120 | 1 · La bandeja | Plano general en `/dashboard/comunicaciones`. Cinco conversaciones, todas con badge de sin leer. | `TU WHATSAPP` | Los titulares te escriben por WhatsApp. Eso no va a cambiar. |
| 120–360 | 2 · Dos preguntas | Corte al encuadre de la lista, clic en la conversación con dos mensajes sin responder. El hilo entra: las dos burbujas entrantes, legibles. | `SIN SALIR DE ACÁ` | Y ahora te llegan acá, junto a la ficha del paciente. |
| 360–660 | 3 · Ya está escrita | La propuesta de VetGPT bajo el hilo: encabezado «Acción propuesta · Mensaje de WhatsApp», el mensaje en el campo editable **respondiendo las dos preguntas**, los pasos y los botones. Encuadre cerrado sobre el texto. | `YA REDACTADA` | Leyó el hilo y la ficha, y dejó la respuesta lista. |
| 660–840 | 4 · Aprobar | Clic en «Aprobar y enviar». La burbuja sale en el hilo, a la derecha, con su doble check. | `TÚ APRUEBAS` | Nada sale hasta que tú lo apruebas. |
| 840–1080 | 5 · También el correo | Clic en la pestaña de Correo. La bandeja con la cabecera de la cuenta conectada y los hilos. Corte al encuadre de la cabecera. | `Y TU CORREO` | El correo de la clínica, en la misma pantalla. |
| 1080–1320 | 6 · Los canales | Corte a `/dashboard/conexiones`. Las cuatro tarjetas con los logos oficiales de WhatsApp, Gmail y Google Calendar, y sus estados. Encuadre sobre las tarjetas conectadas. | `TODO CONECTADO` | Tu número, tu correo y tu calendario. Los que ya usas. |
| 1320–1440 | 7 · El aviso | Encuadre sobre el aviso verde de la cabecera de Integraciones, literal. | — | *(la frase literal del aviso — ver §6)* |
| 1440–1500 | Cierre | §5 de la plantilla, comprimido a 60 frames, o se corre la tabla 60 frames y el cierre va completo. Decide con el still y anótalo. | — | — |

---

## 5. Beats del replay

| desde | beat |
|---|---|
| 0 | resolver el contacto con dos entrantes sin responder y su propuesta pendiente; ruta comunicaciones, sin hilo abierto |
| 180 | abrir ese hilo (marca los entrantes como leídos: el badge desaparece, y eso se ve) |
| 700 | aprobar la propuesta; el mensaje entra con `entregado` puesto, así que sale con **doble check** de inmediato |
| 870 | ruta `/dashboard/comunicaciones/correo` |
| 1090 | ruta `/dashboard/conexiones` |

Dos cosas del motor que hay que respetar:

- **El compositor de WhatsApp no se usa.** Un mensaje escrito a mano por ahí se queda con **un check simple para siempre**, porque su progresión de acuses vive en `SIM`. La propuesta aprobada, en cambio, entra con `entregado` y sale con doble check. Filma la segunda.
- **El botón «Sugerir» de la bandeja está colgado**: su continuación vive dentro de `SIM.after` y el spinner gira indefinidamente. No lo toques.

---

## 6. Lo que la pieza afirma — y lo que tiene prohibido

| Frase | Qué la sostiene |
|---|---|
| «Y ahora te llegan acá, junto a la ficha del paciente.» | La bandeja dentro de la app, con la navegación de Tuvetia alrededor. |
| «Leyó el hilo y la ficha, y dejó la respuesta lista.» | El mensaje propuesto contesta las dos preguntas del hilo con datos de la ficha (la hora de la cita, el ayuno). Verificable comparando f0300 con f0500. |
| «Nada sale hasta que tú lo apruebas.» | El clic, y la leyenda de la propia tarjeta. |
| «Tu número, tu correo y tu calendario. Los que ya usas.» | Las cuatro tarjetas de Integraciones con sus logos y estados reales. |

El acto 7 lleva **literal** el aviso verde de la cabecera de Integraciones sobre que VetGPT no responde solo salvo que se habilite. Cópialo del DOM, no lo parafrasees.

**Prohibido, y esto es lo delicado de esta pieza:**

- **No afirmar que VetGPT responde solo, ni mostrar la barra de autonomía como si tuviera consecuencia.** El nivel se guarda y se pinta, pero **ninguna lógica lo lee**: no hay auto-respuesta en ningún nivel. Mostrarla sugiriendo que algo sale solo sería vender lo que no existe.
- **No mostrar las automatizaciones como si se ejecutaran.** Los recordatorios de cita y de cobro son plantillas editables; no hay nada que las dispare. Si las filmas, es como configuración: «así queda escrito lo que se manda», nunca «mira cómo sale solo».
- **No filmar el correo respondiendo.** «Responder» y «Que VetGPT redacte la respuesta» son sólo toast: no escriben nada. El correo se muestra como bandeja conectada, y ahí para.
- Ni competidores, ni tiempos, ni volúmenes.

---

## 7. QA — stills

| Frame | Qué tiene que verse |
|---|---|
| 0060 | Las cinco conversaciones con sus badges de sin leer. |
| 0300 | El hilo con las dos preguntas entrantes, legibles. |
| 0500 | La propuesta con el mensaje editable, legible, respondiendo las dos. |
| 0760 | La burbuja saliente en el hilo con **doble check**. |
| 0960 | La cabecera del correo con la cuenta y el proveedor. |
| 1200 | Las tarjetas de Integraciones con los logos a color y los estados. |
| 1360 | El aviso verde, legible y literal. |
| 1470 | Cierre. |

Propias:

- [ ] En f0500 y f0300 se puede comprobar que la respuesta contesta las dos preguntas. Si no se leen las dos juntas, parte el acto 3 en dos encuadres.
- [ ] En f0760 el acuse es **doble**, no simple.
- [ ] En ningún frame aparece la barra de autonomía ni un textarea de plantilla presentado como ejecución.
- [ ] El dock no tapa el compositor ni el acuse (hay 70 px reservados; encuadra contando con él).

---

## 8. Parámetros

Música y cierre como `DemoVentas`. `CON_VOZ = false`. 1500 frames.