# Escena nueva · «La duda» — el chat con Athos
Propuesta para aprobar · 7-sep-2026 · pendiente de tu OK antes de desarrollar

## Por qué falta
Las tres promesas del producto son: Athos escucha y escribe la ficha (está en el video),
Athos responde el WhatsApp con tu aprobación (está), y Athos piensa los casos contigo
citando literatura real (no aparece en ningún momento). Falta justo la que más se parece
a «el ChatGPT» del producto y la que más se entiende sin explicación.

## Dónde entra
Justo después de la alerta roja de alergia, en el pico del zoom (frame 1562), y antes de
que la cámara baje a «Facturar lo recetado». La lógica es: aviso rojo (problema) →
«¿y entonces qué le doy?» (la duda) → respuesta con fuentes (Athos piensa contigo) →
sigue la consulta. La escena dura **210 frames (7 s)** y todo lo posterior corre +210;
se recuperan 210 frames con los recortes de la última sección, así que el video sigue
midiendo 80,000 s exactos y los cortes siguen cayendo en el beat.

Alternativa descartada: meterlo en la espera «subiendo… transcribiendo…» (f1094–1170).
Sale más barato pero la pregunta llegaría antes de que exista la duda, y el chat quedaría
como relleno de una espera en vez de como respuesta a un problema.

## El guion, beat a beat (T = frame 1562)

| Frames | Qué se ve | Cámara | Texto en pantalla | Sonido |
|---|---|---|---|---|
| T+0 → T+14 | La alerta roja de alergia, y la cámara abre. El cursor aparece y viaja al ítem **Athos** del menú | 1.4 → 1.0 | — | música |
| T+16 → T+20 | Hover en «Athos» | 1.0 | — | — |
| T+20 | **Clic** → el asistente abre con Luna de contexto: la tira «La clínica hoy», el saludo «Buenos días, ¿en qué trabajamos?», el resumen del día y el compositor con el chip **Luna** | 1.0 | Banda: **ATHOS · COPILOTO CLÍNICO** — «Pregúntale como a un colega.» | — |
| T+24 → T+44 | Push sobre el compositor | 1.0 → 1.12 | — | — |
| T+30 → T+70 | Burbuja anclada al chip de contexto: **«Hilo con memoria: sabe quién es Luna»** | 1.12 | | |
| T+34 → T+96 | **El vet escribe la pregunta** letra a letra en el compositor | 1.12 | | **tecleo** |
| T+98 | **Enviar**: la pregunta salta como burbuja del vet, el hero desaparece y Athos entra en «pensando» (los tres puntos y su frase) | 1.12 | | |
| T+112 → T+124 | «Consultando la literatura veterinaria…» con el ícono girando | 1.12 → 1.2 | | |
| T+124 → T+192 | **La respuesta se escribe en streaming**, con el cursor al final y los chips **[1]** y **[2]** apareciendo en su sitio | 1.2 | Banda: **LITERATURA CITADA** — «Responde con fuentes reales. Nunca un diagnóstico cerrado.» | tecleo suave |
| T+192 → T+200 | Aparece el bloque **Fuentes (2)** con las dos referencias completas | 1.2 | | |
| T+200 → T+207 | Hold sobre la respuesta y las fuentes | 1.2 | | |
| T+207 → T+210 | Velo de nieve de 3 frames → de vuelta a la consulta | vuelve a 1.0 | | |
| T+210 (viejo 1562) | Sigue el guion actual: baja a «Facturar lo recetado», informe, factura, WhatsApp | | | |

## Los textos

**La pregunta del vet** (140 caracteres, se escribe en ~2 s):
> Luna, 12 kg, vómito y decaimiento desde el fin de semana. Es alérgica a penicilina: ¿qué antiemético le doy y a qué dosis? ¿Y si necesita antibiótico?

**La respuesta de Athos** (en tuteo, con negritas y citas como las pinta la app):
> Para el vómito agudo de **Luna** (12 kg), la primera línea es **maropitant**: 1 mg/kg SC cada 24 h — para ella, **12 mg** — o 2 mg/kg por vía oral si lo tolera [1].
>
> Sobre el antibiótico: en un cuadro agudo sin sangre, sin fiebre y con abdomen blando, la evidencia **no lo respalda**; ni siquiera en gastroenteritis hemorrágica sin sepsis cambió el curso ni el tiempo de recuperación [2]. Dieta blanda y control en 24–48 h.
>
> Si apareciera una indicación clara, con su alergia **severa** a penicilina hay que salir de toda la clase y elegir según cultivo. La decisión es tuya; te dejo las fuentes.

**Las fuentes** (las dos verificadas hoy contra PubMed y Wiley — son reales):
1. Sedlacek HS, Ramsey DS, Boucher JF, Eagleson JS, Conder GA, Clemence RG. «Comparative
   efficacy of maropitant and selected drugs in preventing emesis induced by centrally or
   peripherally acting emetogens in dogs». *J Vet Pharmacol Ther* 2008;31(6):533-537.
   DOI 10.1111/j.1365-2885.2008.00991.x · PMID 19000276
2. Unterer S, Strohmeyer K, Kruse BD, Sauter-Louis C, Hartmann K. «Treatment of aseptic
   dogs with hemorrhagic gastroenteritis with amoxicillin/clavulanic acid: a prospective
   blinded study». *J Vet Intern Med* 2011;25(5):973-979.
   DOI 10.1111/j.1939-1676.2011.00765.x · PMID 21781168

**Bandas:** «ATHOS · COPILOTO CLÍNICO — Pregúntale como a un colega.» y
«LITERATURA CITADA — Responde con fuentes reales. Nunca un diagnóstico cerrado.»
**Burbuja:** «Hilo con memoria: sabe quién es Luna».
Opcional, si confirmas la cifra: cambiar el rótulo de la segunda banda por
«61.540 papers a la mano.» (es el número que declara CLAUDE.md).

## De dónde salen los 210 frames

| Recorte | Frames |
|---|---|
| La nota ya escrita se lee 5 s (banda «La nota está lista…», f1240–1388): pasa a 3 s | −60 |
| Agenda: del Mes al Día directo, sin pasar por Semana (se va un clic y su hover) | −34 |
| Tablero: se quita el hover de «Facturado este mes» (la pastilla sigue ahí para el anillo del cierre) | −26 |
| Facturación: los hovers de las dos líneas del carrito, de 52 a 30 frames | −22 |
| Informe: la lectura del diálogo antes de «Enviar por WhatsApp», de 82 a 62 | −20 |
| Ficha de Luna: se quita el hover sobre la consulta pasada | −14 |
| Los interludios del fantasma y de la guarda, 6 frames menos cada uno | −12 |
| El zoom a la penicilina: el hold pasa de 20 a 10 frames | −10 |
| El push al chat de Mariana, de 50 a 44 | −6 |
| El gancho de apertura, de 58 a 56; el hueco entre firmar y aprobar, de 45 a 40 | −7 |
| **Total** | **−211** |

## Cómo se construye (todo replay determinista, nada grabado)

- **Pasos nuevos en `estado.ts`**: en T+20 se fija el contexto (`CHAT.pacienteId = "p-1"`,
  `hiloId = "p:p-1"`, `mensajes = []`) y la ruta `/dashboard/asistente?patient=p-1`;
  en T+98 entra el mensaje del vet y el estado «pensando»; en T+112 el estado
  «escribiendo» con la etiqueta de herramienta; de T+124 a T+192 el texto de la respuesta
  se recorta por frame igual que ya se hace con la nota SOAP; en T+210 vuelve la ruta de
  la consulta. Después de cada cambio se llama al repintado del chat.
- **La pregunta tecleada** reutiliza el mismo mecanismo del motivo de consulta, sobre el
  textarea del compositor.
- **El bloque «Fuentes (2)»** se inyecta bajo la respuesta desde el post-proceso, como ya
  se hace con la tarjeta del PDF en el chat de WhatsApp: la app pinta los chips [1] y [2]
  pero no lista las referencias dentro del hilo.
- **Scroll** del hilo al fondo por frame, como las burbujas de WhatsApp.
- **Tuteo**: hay que añadir «Resumí» → «Resume» al mapa, porque una de las sugerencias del
  hero es «Resumí la ficha de Luna» y se va a leer en pantalla.
- **Re-timing**: un script desplaza +210 todos los frames posteriores en `guion.ts` y
  `estado.ts`, se vuelven a cuadrar los cortes secos del cierre con el beat (f = 9 + 15k)
  y se verifica con stills, la tira de 40 fotogramas y la auditoría de audio.
- Trabajo estimado: unas 2 horas con el render incluido.

## Riesgos
- El hero más el compositor a 1.12 de zoom puede quedar justo de alto; se resuelve con el
  scroll del hilo, pero es lo primero que hay que mirar en el primer still.
- La respuesta es guionada (la maqueta también responde enlatado): es una demo, no una
  consulta en vivo. El microrrótulo «DEMO · DATOS DE EJEMPLO» sigue en pantalla todo el rato.
- Al alargar el acto 3, la factura y el WhatsApp entran 7 s más tarde; el CTA de la barra
  ya está desde el segundo 40, así que no queda ningún tramo sin marca.

## Lo que necesito de ti
1. La ubicación: después de la alerta roja (recomendada) o en la espera de la transcripción.
2. El OK a la pregunta, a la respuesta y a las dos fuentes.
3. Si entra «61.540 papers a la mano.» como rótulo de la segunda banda.
