# DemoSaaS · notas de producción

Registro de todo lo que se desvió del encargo (`prompts/demo-saas.md`), por qué,
y lo que quedaría para la siguiente pasada.

## Parches a la copia (`public/app/tuvetia-app.html`)

Aplicados con un script verificado (cada reemplazo revienta si no encuentra el texto
exacto). Los seis del encargo, más dos extra:

1. **SIM sin temporizadores.** `SIM.after`, `SIM.every` y `SIM.stream` devuelven un id
   (`++this._n`) y no disparan jamás. `SIM.clear` quedó como estaba.
2. **Navegación síncrona, sin `history`.** `nav()` ya no toca `location.hash` ni
   `history.replaceState`: la ruta vive en `window.__RUTA_DEMO`, `leerRuta()` la lee de
   ahí y el pintado es síncrono siempre; el listener de `hashchange` se quitó. El primer
   intento usaba `replaceState`, pero el navegador lo limita (~100 llamadas por ventana
   de 30 s) y el replay navega varias veces por frame: en reproducción sostenida del
   Studio el límite se pisaba, la llamada se ignoraba en silencio, la ruta quedaba
   pegada en la pantalla anterior y el cursor reventaba al no encontrar su selector
   (visto en vivo en el segundo ~31, toma 2.4).
3. **Azar determinista.** `Math.random` → mulberry32 con semilla `20260903`;
   `window.__resetAzar()` vuelve a la semilla y `app.reseed()` lo llama.
4. **Internos expuestos** (una línea en `window.app`): `reseed`, `OV`, `abrirOverlay`,
   `cerrarOverlay`, `cerrarTodo`, `refrescarOverlay`, `pintarOverlays`,
   `pedirConsentimiento`, `abrirInforme`, `repintarVivo`, `abrirCajonConsulta`,
   `crearFactura`, `GUION_POR_DEFECTO`.
5. **Tipografía de marca.** El `<link>` pasa de Bricolage Grotesque a
   `Archivo:wght@600;700`, y al final del `<style>` se agrega
   `:root{--display:"Archivo",system-ui,sans-serif}`.
6. **CSS de captura** al final del `<style>`: transiciones/animaciones/cursor/caret
   apagados y scrollbars ocultas.

Extra (no estaban en la lista del encargo, los pidió el determinismo):

7. **Reloj congelado.** `window.Date` se reemplaza por un shim fijado al
   **3-sep-2026 10:30**. Sin esto, `seedComunicaciones` usa `Date.now()` y la consulta
   nueva usa `new Date()`: dos pestañas del render paralelo (o dos frames pintados con
   minutos de diferencia) mostraban horas distintas para el mismo frame. `HOY`,
   las citas de "hoy" y los `hace X min` de WhatsApp salen todos de ese reloj.
8. **`uid` reseteable.** El contador de `uid()` era un closure que nunca volvía a 0:
   el id de la consulta nueva dependía de cuántos frames hubiera pintado antes esa
   pestaña. Ahora vive en `__uidN` y `app.reseed()` lo resetea. Por lo mismo,
   `render()` acepta un silenciador (`window.__RENDER_MUDO`) para que el replay pinte
   una sola vez al final del frame y no en cada acción intermedia (§2.4 pedía
   optimizar si el frame se iba de tiempo; esto lo deja en decenas de ms).

## Desvíos del guion (§5), con razón

- **1.2 · Pastillas del tablero.** «Facturado este mes» no viene visible por defecto
  en `DB.tablero.metricas`, y «Pacientes» sí. El replay las intercambia (facturado
  visible, pacientes oculta) para que la fila quede en 4 pastillas completas dentro de
  la ventana y la pasada del cursor toque exactamente las tres del guion. Es la misma
  personalización que un admin hace en «Arma tu tablero»; los datos no se tocan.
- **1.2 · Dona de ventas.** Vive bajo el pliegue del tablero: se agregó un scroll de
  `f222–f242` (sistema de §4.6) para traerla a cuadro antes de señalarla.
- **2.3 · Ritmo de la transcripción.** A 5 palabras/s (1 palabra cada 6 frames), las
  9 líneas del guion no caben entre f735 y el clic de f1072 (97 palabras + pausas ≈
  650 frames). Se subió a 1 palabra cada 2.5 frames (≈12 palabras/s) con pausas de 6
  frames, que sí calza los hitos estructurales: notas al terminar la línea 5 (~f893),
  sugerencias en f900, línea 7 ≈ f956, línea 9 ≈ f1026, todo antes del clic.
- **2.6 · «compatible con» en negrita.** Mientras la nota es borrador, la app pinta
  el SOAP en `<textarea>`: los `**asteriscos**` se ven literales. La negrita y el
  `<mark>` de Penicilina aparecen recién al aprobar (así es la app; no se tocó).
- **3.2 · El antiemético del carrito.** `facturar-recetado` empareja medicamentos
  buscando su primera palabra en el plan, y el plan dice «Antiemético según peso» —
  ningún nombre comercial. El catálogo no matchea nada, así que el replay agrega el
  Maropitant (el antiemético del catálogo) con `CARRITO.agregar(...)` justo después,
  como lo habría hecho el vet. Así el carrito queda con las dos líneas del guion.
- **3.2 · Texto del botón.** El botón real dice «Emitir», no «Emitir factura»
  (el selector `[data-act="emitir-factura"]` es el del guion).
- **3.3 · «Notas por revisar baja».** Baja respecto de su pico (la consulta nueva
  agregó un borrador que después se aprobó): 2 → 3 → 2. Contra el inicio del video
  queda igual; el anillo de atención la señala de todas formas.
- **4.1 · Fundido cruzado.** Hay UNA sola app embebida (un iframe): no existen dos
  rutas vivas a la vez para un fundido cruzado real. Los cortes de la ráfaga se
  resuelven con un fundido por nieve de ±3 frames (velo `TV.surface2` sobre el área
  de app). A 30fps se lee como corte suave.
- **4.1 · Propuestas visibles.** La bandeja muestra las propuestas de la conversación
  abierta: con `COM.tel` fijado al de `ac-1` se ve la de Julián completa (tarjeta
  «Acción propuesta» con Aprobar y enviar / Descartar). La de Ana (`ac-2`) queda en su
  propia conversación, visible en la lista pero no expandida: la app no pinta las dos
  a la vez.
- **Cursor en cambios de pantalla.** Cuando el clic destruye el elemento (login,
  cajón, diálogos, emitir), el reposo posterior es un punto fijo declarado en el guion
  (`PT.*`), afinado contra stills — §4.1 prohíbe cachear posiciones entre frames.

## Voseo restante tras la pasada de tuteo

El mapa (`tuteo.ts`, ~60 reglas) cubre todo lo que aparece en las pantallas del
recorrido; se revisaron los 19 stills de QA y no quedó voseo visible en el video.
Quedan en voseo (no visibles en este recorrido): pantallas que el video no visita
(onboarding/bienvenida, ayuda, administración profunda, plataforma /admin) y textos
de consola. La transcripción del guion dice «me llamás» en `DB.transcripciones`
(dato), pero el DOM la pinta tuteada («me llamas») por la pasada.

## Privacidad

El diálogo de consentimiento de la maqueta dice que el audio se conserva **4 días**;
la línea roja 8 de marca dice **7 días**. Es una inconsistencia de la maqueta, no de
este video: se muestra el diálogo tal cual (§7 — «no es tu pelea») y no se amplifica.
Habría que alinear la maqueta con `marca/no-decimos.md`.

## Sonido (agregado el 3-sep, pedido de Luciano)

- **Música:** «Bellini» de West & Zander (Epidemic Sound, pista licenciada que puso
  Luciano; 4:37, sobra para los 80 s). Vive en `public/musica/pista.mp3`, suena a
  0.35 con fade-in de 20 frames y fade-out en los últimos 60, como pedía el encargo.
  La regla «sin música placeholder» sigue viva: la pista es real y licenciada.
  La música se quitó el 3-sep (para oír los SFX desnudos) y volvió el 5-sep,
  pedido de Luciano en ambos casos.
- **SFX** (`Sonido.tsx` + `public/sfx/`): WAV sintetizados por código, deterministas
  (semilla fija, sin Math.random): un tap por cada clic del guion, un pop por cada
  burbuja, una campanita por toast y un rollo de tecleo bajo el typewriter de cada
  interludio. Los frames salen de las tablas de guion.ts.
  Volúmenes: música 0.35 · clic 0.5 · pop 0.4 · toast 0.3 · tecleo 0.22.
  **(Desde la Revisión 5 del 5-sep solo suenan la música y el tecleo, a 0.32 —
  ver esa sección.)**
- **Iteración de SFX a oído** (3→5-sep): los v1 (tonos) solo se sostenían con la
  música tapándolos — desnudos sonaron a membrana/genérico. v2 (resonadores de dos
  polos) insuficiente. v3 «mecánicos» (racimos de micro-impactos + cuerpo de
  escritorio + saturación + sala, `generar-sfx-v3.mjs`) rechazados («está peor»).
  Lo que funcionó: **snaps de ruido filtrado ultra cortos y secos** (3–8 ms, sin
  resonadores ni saturación ni sala), como un clic grabado de cerca —
  `generar-sfx-variantes.mjs`, 6 variantes WAV (clic/tecleo × A/B/C) entregadas
  sueltas para elegir sin re-renderizar.
- **Tecleo: variante C elegida** (5-sep): snaps rápidos y suaves (rapidez 1.25,
  brillo 0.6, sin cuerpo), cadencia humana con pausas de palabra, release en la
  mitad de las teclas. Copiada a `public/sfx/tecleo.wav`.
- **Clic: pendiente** — sigue el v3 mecánico mientras Luciano decide entre
  clic-A/B/C (ya en sus manos). Pop y toast siguen siendo v3.
- El render ya NO va con `--muted`.
- **Workaround Windows:** el compositor nativo de Remotion no logra descargar los
  assets de audio del server local (resuelve `localhost` a `::1`/IPv6 y el server
  escucha en IPv4; `NODE_OPTIONS=--dns-result-order=ipv4first` no le llega porque no
  es Node). Solución: el audio va **incrustado como data-URI** (`audioData.ts`,
  generado — no editar a mano): la música recortada a 84 s / 128k (1.3 MB) + los 4
  SFX. Cero red, determinista. La pista completa queda en `public/musica/pista.mp3`
  por si se quiere regenerar. Verificado con RMS por segmentos: música −21 dB de
  fondo, clic/toast/tecleo audibles por encima, sin clipping.

## Verificación

- `npm run lint` (eslint + tsc estricto) en verde; cero `any` en `guion.ts`.
- 19 stills de QA en `out/qa/` (los 15 del encargo + f30, f245, f660, f2130),
  comparados contra la maqueta.
- **Determinismo:** f1300 renderizado dos veces → byte a byte idéntico. Frames
  1290–1310 con `--concurrency=4` (`out/qa/det-1290-1310.mp4`): scroll continuo,
  sin saltos entre trabajadores.
- **Nitidez:** el still de f990 (zoom 1.35 sobre las sugerencias) se lee nítido a
  1920×1080; no hizo falta `--scale=2`.

## Revisión del 3-sep (feedback sobre el primer corte)

Cinco pedidos, aplicados así:

1. **Agenda con movimiento.** La toma 1.3 ya no llega a una vista quieta: entra en
   vista **Mes** (el mes completo con sus citas), el cursor cambia a **Día** con el
   botón real (`cal-vista`/`Día`, clic en f324) y recién ahí viaja y hace zoom a la
   cita de Luna en la agenda del día.
2. **Modo fantasma → Transcripción.** Al autorizar la grabación, el cockpit abre
   directo en la pestaña **Transcripción**: el texto se ve cayendo en vivo a pantalla
   ancha (antes quedaba en la pestaña Consulta con la tira abajo). La cámara empuja
   sobre la zona del texto; en f962 se pasa a Sugerencias como antes.
3. **Timer creíble.** El cronómetro arranca en **05:00** (una consulta ya avanzada) y
   corre a 2× — el video comprime el tiempo y el reloj lo acompaña. Cierra en 05:25 y
   ese es el `audioSeg` que queda en la consulta.
4. **Transición a facturación (cambio estructural).** Nuevo orden: informe por
   WhatsApp → **respiro en la pantalla de la consulta** (el scroll de 1560–1580 ahora
   baja a la fila de acciones en vez de volver arriba: «Facturar lo recetado» queda en
   cuadro y el clic ya no ocurre bajo el pliegue, que era lo que hacía sentir el corte
   abrupto) → carrito con pasada de revisión por las dos líneas **y los totales** →
   **Emitir** (f1890) → **Enviar al cliente** (f1928, acción real `enviar-factura`:
   la factura queda «Enviada»). Dos toasts apilados, como en la app.
5. **Cierre en el chat del cliente.** La ráfaga ahora es Ventas → Inventario →
   **la conversación de Mariana**, scrolleada al último mensaje: el resumen de la
   consulta recién enviado y, debajo, la factura. Para eso el replay registra además
   el mensaje de la factura en WhatsApp (mutación directa sobre `DB.wa.mensajes`; la
   acción real de la app sólo marca la entrega y avisa por toast — el texto del
   mensaje es contenido nuestro y pasó por /revisar). Las propuestas pendientes de
   Athos (ac-1/ac-2) ya no salen en el video: el plano de comunicaciones ahora es el
   chat de Mariana.

## Revisión 2 del 3-sep (feedback sobre el segundo corte)

1. **La consulta arranca en el notch, no a pantalla completa.** Al autorizar, el vet
   se queda donde estaba: la cámara mira un momento el notch («Athos · Luna · 05:0X»,
   con el eq y el punto latiendo) y lo suelta a navegar el CRM con la grabación de
   fondo: Pacientes → ficha de Luna → historia de consultas (con las dos pasadas
   aprobadas a la vista) → clic en «Abrir la consulta» de la consulta en curso →
   recién ahí el cockpit a pantalla completa, con toda la transcripción ya acumulada
   (corrió de fondo mientras navegaba). El selector de la consulta pasada es
   posicional (`details:nth-of-type(2)`) porque con nota aprobada el summary muestra
   el análisis, no el motivo.
2. **Entrada a facturación más suave.** El zoom del carrito baja de 1.10 a 1.05.
3. **Aprobación explícita.** El carrito ya no emite directo: «Guardar borrador» →
   detalle en estado Borrador (aviso sandbox «Antes de emitir») → **Emitir** (el
   momento de aprobación) → **Enviar al cliente**. Tres clics, tres estados visibles.
4. **La factura como PDF en el chat.** La burbuja de la factura lleva una tarjeta
   tipo documento de WhatsApp (icono PDF, «Factura FV-1154.pdf», «PDF · 1 página ·
   $339.150» — número y total salen de la factura real del replay). La app no modela
   adjuntos: la tarjeta se inyecta sobre la burbuja registrada (`inyectarTarjetaPdf`
   en AppEmbebida). El payoff del envío es ahora un plano propio (f1982–2072): push de
   cámara a las dos últimas burbujas antes de «Todo se conecta solo».
5. **Recorrido final de 4 secciones.** Tras el tablero movido: Ventas → Inventario →
   Comunicaciones (el chat de Mariana) → **Pacientes** (vista nueva del CRM), planos
   de 30 frames con fundido por nieve, y de ahí al cierre.

Nota: los clics del paseo por el CRM (f772/f812/f890) ocurren mientras el texto
«Athos escucha en modo fantasma.» está en pantalla — la regla §4.5 del encargo
original («sin clics con texto visible») cede ante el recorrido pedido.

## Revisión 3 del 3-sep (el tour ahora explica, no solo muestra)

Regla nueva: cada transición y cada función va explicada. Dos recursos, como pidió
la revisión:

- **Interludios** (`Interludio.tsx` + `INTERLUDIOS` en el guion): plantillas de texto
  a pantalla completa — la ventana se desvanece y la frase se escribe en tiempo real
  con caret menta. Dos: «Athos redacta / La nota SOAP: subjetivo, objetivo, análisis
  y plan.» (f1170–1230, el paso que faltaba antes de aprobar) y «Del consultorio
  hasta la casa / Todo se conecta solo.» (f2057–2117, antes del tablero movido).
- **Burbujas** (`BURBUJAS` + capa en AppEmbebida): explicaciones que hacen pop
  in/out ancladas a la interfaz y arrastradas por la cámara. Cinco: pastilla de
  notas por revisar, vistas de la agenda, motivo de la consulta, transcripción del
  cockpit y carrito de lo recetado.
- **Bandas** nuevas: «LA CAJA / Manda la factura apenas termina la consulta.» y
  «COMUNICACIONES / Athos lo hace por ti.» (el texto que faltaba en el chat), y el
  recorrido final lleva frase por plano.

Cambios puntuales de la pasada:

1. **Modo fantasma con zoom a la transcripción.** Al autorizar, el panel del notch
   se abre (pop, `VIVO.panelAbierto` por frame), la cámara hace zoom a la
   transcripción en miniatura mientras se escribe en vivo, se dice «Athos escucha en
   modo fantasma», el panel se cierra y sigue el tour con la grabación de fondo.
   El recorrido Pacientes → Luna → historia se re-timó (clics f860/f892/f952) y
   el cierre de grabación pasó a f1082.
2. **Agenda con las tres vistas.** Mes → clic Semana → clic Día → zoom a la cita,
   con la burbuja «Tus citas del día, de la semana y del mes» encima.
3. **La nota SOAP explicada antes de aprobar** (interludio 1) y después la banda
   «La nota está lista. Pero no entra sin ti.» — formato primero, firma después.
4. **Facturación sin zoom.** Cámara a 1.02 máximo: el paso aprobar → enviar al
   cliente queda siempre en cuadro.
5. **Recorrido final con ángulos.** Ventas (entra), Inventario (sale),
   Comunicaciones (entra), Pacientes (sale) — planos de ~34 frames con foco distinto
   cada uno y su frase en la banda. El cierre de logo empieza en f2295.

## Revisión 4 del 3-sep

1. **El modo fantasma con pantalla propia.** Interludio «LA CONSULTA / Athos escucha
   en modo fantasma.» (f696–750) ANTES de mostrar nada; al volver, la cámara ya está
   sobre el panel del notch con la transcripción cayendo.
2. **Transcripción con aire.** El panel queda abierto f744–864 con la primera palabra
   en f756: más de 3.5 s de texto escribiéndose en cámara.
3. **Texto del paseo.** Banda «Revisa tu clínica mientras tanto: Athos sigue
   grabando.» durante el recorrido por Pacientes/ficha, y al volver al cockpit la
   burbuja «Todo lo que se habló, ya transcrito».
4. **La nota SOAP legible.** El scroll ahora se queda centrado en la sección «Nota
   clínica» (antes seguía hasta las referencias y la nota quedaba fuera de foco) y el
   push acompaña la lectura (1.12, foco alto).
5. **El aviso rojo de la guarda.** Interludio en TV.danger «LA GUARDA / Athos te
   evita errores graves.» (f1390–1434), que además tapa el scroll de vuelta arriba;
   de ahí directo al checkbox de la alergia severa.
6. **El botón de aprobar, por fin visible.** La causa no era el zoom: con las líneas
   del carrito expandidas, el pie (totales + Guardar borrador/Emitir) quedaba bajo el
   pliegue y el cursor clickeaba fuera de cámara. Scroll nuevo f1830–1854 al pie del
   carrito; la cámara se queda en 1.0–1.02.
7. **Comunicaciones con mensaje propio.** Banda «Todo tu WhatsApp en un lugar —
   Athos lo hace por ti.» sobre el chat de Mariana.
8. **El cierre por pares.** Cinco pares pantalla-de-texto → pantalla-de-app:
   «Todo se conecta solo.» → tablero con anillos · «La caja, al día.» → Ventas ·
   «El stock se descuenta solo.» → Inventario · «El WhatsApp, ordenado.» →
   Comunicaciones · «La historia de cada paciente.» → Pacientes (vista nueva del
   CRM). Cámara alternando entra/sale; cada salto de ruta ocurre bajo su interludio,
   así que los fundidos por nieve ya no hacen falta. El typewriter adapta su
   velocidad a la duración del interludio. El cierre de logo empieza en f2325.

## Revisión 5 del 5-sep

**El «desfase» reportado no estaba en el video.** El MP4 renderizado estaba en
sincronía perfecta (verificado con stills); lo desfasado era el **preview del
Studio**: el 5-sep a las ~14:12 varios archivos de `src/demo` fueron sobrescritos
por versiones viejas (buffers de VSCode sin refrescar, guardados encima —
`NOTAS.md`, `Sonido.tsx` y `DemoSaaS.tsx`), y el `DemoSaaS.tsx` que quedó traía un
`from={-143}` en la Sequence de la ventana: todo lo de adentro (replay, cursor,
cámara) corría 4.8 s adelantado respecto a interludios y textos. Se quitó el
`from` y quedó de nuevo en sincronía. Moraleja: cerrar pestañas viejas del editor
o «File: Revert File» antes de guardar.

Cambios de la pasada:

1. **Intro de marca (f0–56, `Intro.tsx`):** logo horizontal + «SOFTWARE CLÍNICO
   VETERINARIO» sobre la nieve, con deriva lenta de escala; la ventana de la app
   entra después (fade + caída + escala, f52–64). Ya no arranca en frío.
2. **«Toda tu clínica en una sola pantalla.» es interludio propio (f88–140)**,
   justo tras el clic de login (que se movió de f60 → f72 con su hover y su tramo
   de cursor); tapa la carga del dashboard y la ventana vuelve a tiempo para la
   burbuja de f150. La banda que iba encima del dashboard (f105–245) se eliminó.
3. **La frase del fantasma** ahora es «Athos escucha mientras tú consultas.»
   (opción nueva de Luciano; misma ventana f696–750).
4. **Fuera** la banda «Revisa tu clínica mientras tanto…» (f880–970).
5. **Sonido: solo música + tecleo** («borrar todos, excepto los de typing»).
   Clic/pop/toast fuera de la mezcla (los WAV siguen en `public/sfx/` por si
   vuelven). Tecleo sube 0.22 → 0.32 porque ya no compite con nada y la percusión
   de la pista lo tapaba (auditoría del 5-sep: subía 0–7 dB sobre el fondo).
6. **Más movimiento:** entrada animada de la ventana y «respiración» de escala
   (±1 %) al entrar/salir de cada interludio.

Sigue pendiente de decidir: el WAV del clic (variantes A/B/C entregadas) — hoy
irrelevante porque el clic no suena.

## Revisión 6 del 6-sep (los patrones de ~150 demos, aplicados)

Origen: `EXAMEN-Y-PATRONES.md` (examen del corte + investigación). Se aplicaron los
puntos 1–8; el 9 (familia de formatos 9:16 / 1:1 / cortes de 15–30 s) queda para una
composición aparte.

1. **Arranque nuevo, sin login.** Gancho en el segundo 0 como interludio con el logo
   de sello (`logo: true`): «¿Cuánto de tu consulta se te va escribiendo la ficha?»;
   la ventana entra debajo (f50–62) **ya en el tablero** — UI a los 1,7 s (el dato:
   71 % de los top la muestran antes de 4 s). El tour del tablero se adelantó a
   f66–192 y «Toda tu clínica en una sola pantalla.» pasó a ser el puente tablero →
   agenda (f204–256). `Intro.tsx` se eliminó; el paso de login corre en f0.
2. **La nota SOAP se escribe sola ante cámara** (`ESCRITURA_SOAP`, f1182–1234): el
   interludio «ATHOS REDACTA» que la escondía se quitó; ahora `AppEmbebida` trunca
   los cuatro `textarea[data-act="soap"]` por frame (S → O → A → P, caret en el
   activo, ~10 caracteres/frame), con scroll y push de cámara 1.18 sobre la nota desde
   f1172 y banda «ATHOS REDACTA · Antes, la ficha la escribías tú.» (el «antes» cae
   justo donde ocurre la magia). Tecleo bajo la escritura a 0.24.
3. **Cero nieve vacía.** El typewriter arranca en el frame 1 (velocidad con `dur − 14`)
   y la ventana vuelve *mientras* la frase se desvanece (crossfade: vuelta en
   [f1 − 6, f1 + 1]; entrada en [f0 − 6, f0]). Se recuperan ~6 s de pantalla muerta.
4. **Cierre por pares a corte seco** (`corte: "seco"`): sin fundidos, cada pantalla
   de app queda 30 frames enteros en cámara. El primer par es el beat de resultado:
   «CONSULTA TERMINADA · Ficha, informe y factura: hechos. Todo se conecta solo.»
   (f2040–2085). Cierre de logo desde f2331.
5. **Cortes al beat** (120 BPM, golpe en f = 9 + 15k): fantasma f699–753, guarda
   f1389–1433, card f204–256.
6. **Zooms más valientes:** cajón del motivo 1.28, transcripción 1.22, nota SOAP 1.18,
   chat de Mariana 1.16 — con **viñeta hacia la nieve** proporcional a la escala
   (`escalaCamaraEn` en `Camara.tsx`, opacidad 0–0.42 entre s 1.08 y 1.3).
7. **CTA a mitad de video:** la barra de la ventana pasa de «TUVETIA» a «TUVETIA ·
   ESCRÍBENOS AL WHATSAPP» en f1200 (segundo 40) y se queda.
8. El `from={48}` que apareció en `DemoSaaS.tsx` se quitó (rompía la sincronía; nunca
   fue un cambio confirmado).

/revisar re-auditado sobre los textos nuevos (gancho, «Antes, la ficha la escribías
tú.», beat de resultado, CTA en barra): tuteo ✓, sin cifras inventadas ✓, sin
competidores ✓, el enemigo es el papeleo ✓, CTA a WhatsApp ✓.

## /revisar (lint de marca sobre lo publicable)

Auditados contra `marca/no-decimos.md`: los 4 textos en pantalla, los rótulos de la
ráfaga, el microrrótulo, los 6 toasts de la línea de tiempo, el mensaje de la factura
en el chat de Mariana y el cierre completo. Re-auditado tras la revisión del 3-sep
(toast «Factura enviada al cliente» y mensaje de WhatsApp de la factura: tuteo ✓,
sin cifras inventadas — el monto es el total real de la factura del replay ✓).

1. Athos nunca diagnostica ni firma — **PASA** («Athos redactó la nota» + «nada entra
   a la historia sin tu aprobación»; la nota dice «compatible con» y «no hay evidencia
   suficiente»; el gate y el clic del vet están en cámara).
2. Cero métricas/clínicas inventadas como reales — **PASA** (microrrótulo
   `DEMO · DATOS DE EJEMPLO` permanente; `BUSCAMOS 10 VETERINARIOS · 0/10`).
3. Nunca atacar la facturación — **PASA**.
4. Nunca competidores — **PASA**.
5. Nunca burlarse de lo clínico — **PASA**.
6. Tuteo, al vet como persona — **PASA** («tu clínica», «no entra sin ti»,
   «Escríbenos»; UI tuteada por la pasada de §4.7).
7. Grafía «Tuvetia» — **PASA** (una palabra en barra, logo y textos).
8. Privacidad en serio — **PASA** (el diálogo de la Ley 1581 se muestra completo y
   sin overlays; la cifra de retención de la maqueta quedó anotada arriba, no
   amplificada).
9. El sufrimiento del vet no es el gancho — **PASA** (constatación y promesa).
10. CTA a WhatsApp — **PASA** (único bloque de color del cierre).

**Veredicto: LISTO PARA PUBLICAR.**

## Siguiente pasada (si la hay)

- Grabar la pista de música a 120 BPM y activar `CON_MUSICA`.
- Alinear la retención de audio de la maqueta (4 días) con la línea roja (7).
- Un segundo iframe para fundidos cruzados reales en la ráfaga.
- Afinar la pausa del cursor sobre el diálogo del informe (hoy queda sobre el texto;
  podría descansar en el borde inferior del diálogo).
- Portar el mapa de tuteo a la maqueta misma, para que la fuente ya salga tuteada.
