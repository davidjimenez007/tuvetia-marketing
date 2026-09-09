# DemoVentas · notas de producción

Encargo: `prompts/remotion/prompts/demo-ventas.md`, leído sobre `prompts/remotion/prompts/_plantilla-demo-producto.md`
y bajo los límites de `public/app/NOTAS-MAQUETA.md`. Composición `DemoVentas` (1080×1920 · 30 fps ·
**1500 frames**), registrada en `src/Root.tsx` dentro de `<Folder name="Demos">`. Sólo escritorio. Voz:
Luciano, carril producto, sin locución grabada (`CON_VOZ = false`).

Comandos:

```
npx remotion still DemoVentas out/qa/ventas/f0470.png --frame=470 --timeout=90000
npx remotion render DemoVentas out/demo-ventas-2x.mp4 --codec=h264 --crf=16 --scale=2 --timeout=90000
npx remotion ffmpeg -i out/demo-ventas-2x.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a copy out/demo-ventas.mp4
npx remotion ffmpeg -y -i out/demo-ventas-2x.mp4 -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -crf 17 -preset medium -profile:v high -level 4.1 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -movflags +faststart out/demo-ventas-web.mp4
```

---

## Estado al 8-sep-2026, 21:50 (pieza en QA, sin render)

**Hecho.** Plan aprobado por David con tres condiciones (plan SOAP legible en cámara, dock oculto si estorba,
refactor en commit propio). `src/pieza/` generalizado y commiteado aparte (`121c35d`). `src/ventas/`
completo: `guion.ts` (actos, encuadres medidos, cámara, cursor, hovers, scrolls, toasts, textos), `estado.ts`
(beats y replay), `tipos.ts`, `postproceso.ts` (columna de lectura, toasts alineados, dock oculto),
`DemoVentas.tsx`, registro en `Root.tsx`. Fixture ajustado y verificado (76 comprobaciones de
`scripts/verificar-maqueta.mjs`). `porVencer` derivado en la maqueta. `/revisar` pasado (§5): hook
corregido a 8 palabras. `npm run lint` en verde.

**Regresión del explainer tras el refactor** (`out/qa/regresion-pieza/`, `npx remotion still ExplainerRAG`):

| Frame | Antes | Después |
|---|---|---|
| f0180 | `cf411ddfb496500d6a617a184c8be95f` | idéntico |
| f0760 | `b4e7574e029d2a608c97e2728de46019` | idéntico |
| f1260 | `9b29a65e50618c11a9caaddb3238180d` | idéntico |

Tras el `microTop` de `pieza/Banda.tsx` (posterior al commit del refactor) se repitió f0760:
`despues2-f760.png` = `b4e7574e029d2a608c97e2728de46019`, idéntico.

Regresión del demo tras los parches de la maqueta (`out/qa/regresion-maqueta/`): `DemoSaaS` f0990
`f9e84397a8bb55d2d61f1ec26199fa0e` y f0950 `e39a32ed507428579c9a75c6240a6be9`, idénticos antes y después.

Los `PT` de `guion.ts` se midieron por CDP con la columna de lectura y el scroll de cada acto
(`node scripts/medir-pt-ventas.mjs`, resultados en el comentario de `PT`); los de la importación coinciden con la
primera medición a 1440 porque esa página ya es angosta.

**Stills de QA ya vistos y aceptados** (segunda pasada, `out/qa/ventas/`): f0470 (select en «Mínimo» con
el puntero), f0600 (toast «7 creados, 1 actualizado» sobre Existencias, KPIs con `Por vencer 0`), f0900
(plan SOAP legible + botón, puntero en camino), f0960 (carrito: Consulta general + Oclacitinib), f1040
(toast «FV-1154 emitida por $496.230»), f1180 (fila del Oclacitinib con **3**), f1440 (cierre).
Primera pasada descartada por: zoom 1.3 recortaba la tabla, clic y corte en el mismo frame pintaban el
anillo sobre la pantalla nueva, toast fuera del encuadre de lectura, rótulo largo pisando el microrrótulo.

**Tercera pasada (22:00):** f0200 y f0330 con el push bajado a 1.05 (título y card enteros), y
**determinismo**: f0470 renderizado en dos procesos distintos → `4fb6ca69084a2f54fb89f817c4648405` los dos.
Los 13 stills del §4 pasan.

**Entrega (22:18):** `out/render-ventas.sh` → `out/demo-ventas-2x.mp4` (2160×3840, yuvj420p, 47,0 MB;
render 2× de 1500 frames en ~10 min), `out/demo-ventas.mp4` (1080×1920, 15,3 MB) y `out/demo-ventas-web.mp4`
(1080×1920, yuv420p tv bt709 + faststart, 13,3 MB), los tres de 50,05 s con AAC. `out/` está en `.gitignore`.
No queda nada pendiente de esta entrega; lo que sigue está en §6.

---

## 0. La cadena de datos, resuelta en el replay

`src/ventas/estado.ts`, beat 1: el ítem protagonista se busca por nombre en `DB.catalogo` («Oclacitinib» →
`it-12`, 4 unidades, mínimo 5); la consulta, como la nota aprobada cuyo plan contiene la primera palabra
del nombre del ítem (`n-1` → `c-1`, Luna). Ninguno de los dos ids está escrito en el guion. El número de
factura se lee de `DB.facturas[0]` después de emitir. Si el seed cambia y algo no cuadra, el replay
revienta con el nombre del beat: el encargo (§3) pide parar, no forzar otro ítem.

Lo que entra al carrito con «Facturar lo recetado»: Consulta general + Oclacitinib + Solución ótica
clotrimazol. El plan de Luna receta los dos fármacos, así que las tres líneas son correctas — pero ver la
desviación 4.

---

## 1. Lo que se tocó fuera de `src/ventas/` y `src/pieza/`

| Dónde | Qué | Por qué |
|---|---|---|
| `public/app/tuvetia-app.html` · `SEL.inventario()` | `porVencer` deja de ser un `2` escrito a mano y se deriva de `i.vence` (ningún ítem la trae → 0) | Plantilla §6, línea roja 2: ningún número en pantalla que no salga de un dato. Los KPIs de Existencias están en cámara en los actos 4 y 7. Sacado de la deuda de `NOTAS-MAQUETA.md`. |
| `public/app/_pruebas/catalogo-prueba-encabezados-raros.csv` (+ copia en el Escritorio) | Gana la columna `Punto de pedido`; «Solución salina 500 mL» pasa a «Algodón hidrófilo 500 g»; entra `Oclacitinib 16 mg x 20 tabl.;268.000;4;5` como tercera fila | Aprobado por David. Sin una columna suelta el acto 3 no tiene qué corregir; «solución» está en el plan de Luna y `facturar-recetado` habría metido la salina a la factura; el Oclacitinib entra como «Actualiza» (mismo precio y unidades → sin `AJUSTE`) y así la cadena del encargo es literal. Tercera fila para que se vea entre las seis de la previsualización. |
| `scripts/verificar-maqueta.mjs` | Expectativas nuevas (8 filas, 4 columnas con la última sin mapear, 7 creados + 1 actualizado) y un check: `TEXTO_CSV` de `guion.ts` idéntico al archivo | El fixture del video es el de `_pruebas/`, byte a byte. 76 comprobaciones en verde. |
| `src/demo/tuteo.ts` | `aplicarTuteo(doc, extra?)` admite reemplazos propios de una pieza | El voseo de esta pieza («que igual revisás y aprobás», consulta) no debe cambiar el render del demo. |

Los parches demo de la copia (reloj, semilla, `SIM`, `nav`, CSS de captura) no se tocaron.

---

## 2. Desviaciones (todas deliberadas, todas verificadas en still)

| # | Dice el encargo / la plantilla | Se hizo | Por qué |
|---|---|---|---|
| 1 | §4: «1440 frames (48 s)» en la cabecera | **1500 frames** | La tabla de actos y el §8 suman 1500; la cabecera es un error de suma. |
| 2 | §4 acto 3 / §5: corregir el `<select>` y «clic en confirmar»; beat 520 `confirmarImportacion()` | Tres clics: el `<select>` (f450), «Revisar 8 filas» (f495 → paso 3 en f510, con la previsualización) e «Importar 8 ítems» (f555 → importa en f570). Cada clic va un beat antes del corte que cambia la pantalla (`CLIC`/`CORTE` en `guion.ts`): así el anillo del clic se ve sobre el botón y no sobre la pantalla nueva | El flujo real tiene un paso «Revisar» entre el mapeo y la importación (`NOTAS-MAQUETA.md` §B). Es lo que el vet hace de verdad y muestra el «Actualiza» del Oclacitinib. El toast de importación se ve de f570 a f645 (sobre Existencias, adonde la app navega sola); el still del toast pasa a ser f0600. |
| 3 | §3.2: el CSV de encabezados raros «tal cual» | Fixture ajustado (ver §1) | Sin columna suelta no hay acto 3; la salina se colaba en la factura. |
| 4 | §3: «`facturar-recetado` lo mete al carrito» | Entra también la Solución ótica clotrimazol (`it-14`). Se filma tal cual; el plan queda legible en cámara (acto 5) para que las tres líneas sean verificables | **Deuda de producto, sin arreglar acá:** el emparejador toma la primera palabra del nombre del ítem y la busca en el plan; acierta con «oclacitinib» y con «solución» (por «solución de ácido acético», no por «clotrimazol»). Falsos positivos garantizados con cualquier «solución», «vacuna» o «alimento». Emparejar por la palabra más larga y distintiva del nombre («clotrimazol», «oclacitinib») sería robusto. |
| 5 | §5 beat 990: `emitir-factura` | Se usa tal cual: `crearFactura("EMITIDA")` numera, descuenta stock y navega a la factura | Existe; no se encadena con `emitir-borrador` (descontaría dos veces). |
| 6 | Plantilla §6/§7: ningún número que no venga del seed | `porVencer` derivado en la maqueta (§1) | El `2` fijo salía en los KPIs de los actos 4 y 7. |
| 7 | §8: «la funk a 120 BPM… nativa, sin estirar»; plantilla §4: música a 0.35 | `MUSICA_FUNK` (ya estirada 125 → 120 en la v3 del explainer, `atempo 0.96`) a **0.21** | La funk suena 4,2 dB más fuerte que Bellini (medido). Constante en `guion.ts` para volver a Bellini en una línea. |
| 8 | Plantilla §2: los toasts los decide la línea de tiempo | El replay **captura** el toast que la app emite en el beat (HTML de `#avisos`) y lo vuelve a poner sólo en su ventana (555–600, 990–1080), con entrada por opacidad de 8 frames | El texto lo escribe la app («Importados: 7 creados, 1 actualizado», «FV-… emitida por $…»), no el guion. |
| 9 | §2: dos encuadres, «trabajo» y «tabla», sobre la app a 1440 | **Columna de lectura**: el post-proceso impone `.pagina>*{max-width}` (820 px en importación y tablas; 640 px en consulta y carrito), los toasts se alinean al borde de la columna y el **dock se oculta**. Encuadres: `columna` (x 244→1104, alto completo, ×1.256) y `lectura` (x 244→924, y 134→814, ×1.588, cuadrado) | A 1440 la tarjeta SOAP mide 1144 px: un párrafo de 1144 px no cabe legible en 1080 de ancho (habría que recortar líneas). La columna es lo que la propia página de importar ya hace (`angosta`, 820). El toast nacía en x 1108–1424, fuera del encuadre; el dock compartía rincón (condición de David: ocultarlo, no reencuadrar). |
| 10 | §4 acto 8: frase = «la frase literal del subtítulo de la app» con rótulo `CADA MOVIMIENTO DEJA RASTRO` | La banda lleva la **segunda mitad** literal: «Las existencias son su saldo, no un número que alguien escribe.» | El subtítulo completo empieza con las mismas cuatro palabras del rótulo; repetirlas en rótulo y frase se leía como un error. Sigue siendo la frase del producto. |
| 11 | §4 acto 3: el toast sobre la pantalla de importar; §5 beat 600: «ruta inventario» | Al confirmar, la app navega sola a Existencias (f555): el toast se ve sobre Existencias y el acto 4 arranca ya ahí | Es lo que hace `confirmarImportacion()`. Quedarse en importar mostraría el paso 1 vacío (el estado se reinicia al importar). |
| 12 | Plantilla §1: «reutiliza; no bifurques» | `src/pieza/` (commit `121c35d`, propio y revertible): `AppSuperficie`, `Ventana`, `Banda`, `postproceso`, `Toque`, `texto`, `Sonido` parametrizados; el explainer queda como envoltorios | Los módulos del explainer importaban su `./guion` a la fuerza. Regresión `ExplainerRAG` f0180/f0760/f1260: MD5 idénticos (en el mensaje del commit). |
| 13 | §4 acto 8: «la primera fila es nueva: Venta · −1 · Factura FV-…» | La primera fila es la **Solución ótica** (Venta −1, misma factura); el Oclacitinib es la segunda. La cámara encuadra las dos | `descontarStock` recorre las líneas del carrito en orden y hace `unshift`: la última línea queda primera. La frase del acto no nombra al ítem; las dos filas llevan el número del toast. |

---

## 3. Locución (opcional, `CON_VOZ = false`)

Cableado listo en `DemoVentas.tsx` (`public/voz/demo-ventas.mp3`, a data-URI en Windows). Texto cuadrado a
los ocho actos, en tuteo, sin afirmar nada que no esté en pantalla:

| Acto | Frames | Locución |
|---|---|---|
| 1 | 0–120 | Tu catálogo ya existe: está en una planilla de tu caja. |
| 2 | 120–420 | Lo arrastras y Tuvetia propone a qué campo va cada columna. Producto es nombre; Valor es precio; Cantidad, existencias. |
| 3 | 420–600 | Una no la reconoció. La corriges tú, revisas y apruebas. Hasta ahí no ha entrado nada. |
| 4 | 600–780 | Y desde ese momento el inventario sabe qué tienes y qué te falta: la antirrábica está en cero. |
| 5 | 780–960 | Vuelve a la consulta de Luna. Lo que recetaste en el plan ya está en la factura, sin buscar nada. |
| 6 | 960–1080 | Emites. |
| 7 | 1080–1260 | Vendiste una caja de oclacitinib. Tenías cuatro; el inventario ya dice tres. Nadie lo escribió. |
| 8 | 1260–1380 | Cada movimiento deja rastro: las existencias son su saldo, no un número que alguien escribe. |
| Cierre | 1380–1500 | Ningún veterinario debería volver a escribir una ficha. Escríbenos al WhatsApp. |

---

## 4. QA — los stills del encargo (más f0600), en `out/qa/ventas/`

Tres pasadas. La primera (zoom 1.3, clic y corte en el mismo frame) reventó cuatro cosas, anotadas en
«Estado»; la segunda pasó todo menos la «I» de «Importar catálogo» recortada por el push 1.1 (f0200,
f0330), que la tercera baja a 1.05. Mismo comando por frame:
`npx remotion still DemoVentas out/qa/ventas/f####.png --frame=#### --timeout=90000`.

| Still | Qué se ve | Estado |
|---|---|---|
| f0060 | Ventana completa con cromo en la pantalla de importar (zona de arrastre vacía); banda «EL CATÁLOGO · Tu catálogo ya existe. Está en una planilla.» (8 palabras); microrrótulo bajo la banda. | ✓ |
| f0200 | Paso 2 con el nombre y el peso **reales** del archivo («catalogo-prueba-encabezados-raros.csv · 4 columnas · 8 filas · 342 B»), tres columnas mapeadas y «Punto de pedido» en «No importar». | ✓ (3.ª pasada: título entero) |
| f0330 | El mapeo legible, tabla entera: Producto → Nombre, Valor → Precio, Cantidad → Existencias, Punto de pedido → No importar. | ✓ (3.ª pasada) |
| f0470 | El puntero sobre el `<select>` de la cuarta columna, ya en **Mínimo**; «Revisar 8 filas» debajo. | ✓ |
| f0560 | Paso 3: seis filas con Nuevo/**Actualiza** (Oclacitinib), «Se importarán 8 filas: 7 se crean y 1 ya existe…», el puntero clicando «Importar 8 ítems» con el anillo. | ✓ |
| f0600 | Toast «Importados: 7 creados, 1 actualizado · 7 movimiento(s) de existencias registrados» sobre Existencias; KPIs «Bajo mínimo 2 · Agotados 1 · Por vencer 0». (El encargo lo pedía en f0560: el corte va 15 frames después del clic, desviación 2.) | ✓ |
| f0700 | Existencias desplazada a la fila «Vacuna antirrábica · **0** · Agotado» en rojo; el Oclacitinib todavía en 4; las filas importadas al final. | ✓ |
| f0900 | La consulta de Luna en la columna de 640: el **plan entero legible** (clotrimazol tópico ótico, oclacitinib 16 mg…), la alerta de alergias, la fila de botones con «Facturar lo recetado» y el puntero en camino. Tuteo: «Evita el fármaco implicado». | ✓ |
| f0960 | El carrito ya armado: Cliente Mariana Osorio, Paciente Luna, «Consulta general 1 × $75.000», «Oclacitinib 16 mg x 20 tabl. 1 × $268.000» (la solución ótica, debajo del corte). | ✓ |
| f1040 | Toast «FV-1154 emitida por $496.230 · Ya se ve en el tablero, en la dona de ventas y en la cartera» sobre la factura emitida; rótulo `EMITIR` solo. | ✓ |
| f1180 | Existencias, zoom 1.4 en la fila «Oclacitinib 16 mg x 20 tabl. · MED-102 · Medicamento · **3** · 5»; la antirrábica en 0 debajo. El 4 → 3 ocurre por el corte del acto 7, no por animación. | ✓ |
| f1320 | Movimientos: «Solución ótica clotrimazol · Venta · −1 · Factura FV-1154» y «Oclacitinib 16 mg x 20 tabl. · Venta · −1 · Factura FV-1154» (mismo número que el toast de f1040), luego las siete «Carga inicial» de la importación. | ✓ |
| f1440 | Cierre: logo 620, claim en dos líneas, pastilla «Escríbenos al WhatsApp», `BUSCAMOS 10 VETERINARIOS · 0/10`. | ✓ |

Checklist común (plantilla §7): nada legible fuera de la zona segura (banda 1330–1610, microrrótulo 1622–1662,
ventana 250–1320) · lo que se pide leer se lee (cuerpo 19–24 px, números 26 px) · cero voseo en los
stills · sin asteriscos crudos (no hay bloques ricos en la pieza) · `DEMO · DATOS DE EJEMPLO` en todos los
actos · ningún número fuera del seed o del flujo · grafías `Tuvetia`/`VetGPT` · Archivo + JetBrains Mono
· dock oculto · **determinismo:** ver «Estado» (f0470 en dos procesos).

Propias del encargo: f0200/f0330 salen del CSV de `_pruebas/` (`TEXTO_CSV` idéntico al archivo, verificado
por script) · f0600 coincide con las filas del fixture (7 + 1) · f1180 muestra 3 y en ese acto nunca
se vio 4 · f1320 lleva el mismo número de factura que f1040 · ningún competidor ni logo ajeno en cuadro.

---

## 5. `/revisar` — líneas rojas, punto por punto

Sobre los ocho textos de la banda, el microrrótulo, el cierre compartido (`src/demo/Cierre.tsx`) y la
locución del §3.

| # | Línea roja | Veredicto |
|---|---|---|
| 1 | VetGPT nunca diagnostica ni firma | **PASA.** Nada clínico se afirma. El par acto 2 / acto 3 («Lo resuelve él» → «Propone el mapeo; tú lo apruebas antes de que entre nada») deja la decisión en el vet, y el clic del acto 3 lo muestra. La app dice lo mismo en pantalla («VetGPT propuso a qué campo va cada columna. Corrige lo que no cuadre y sigue»). |
| 2 | Cero métricas, testimonios o clínicas inventadas | **PASA.** Los únicos números en cámara salen del seed o del propio flujo: 8 filas, «7 creados, 1 actualizado», 4 → 3, `FV-…` y el total que emite la app, `Por vencer 0` (derivado). `DEMO · DATOS DE EJEMPLO` visible los ocho actos; `BUSCAMOS 10 VETERINARIOS · 0/10` en el cierre. Ninguna frase dice cuánto cuesta o tarda llevar el inventario a mano. |
| 3 | Nunca atacar la facturación | **PASA.** Se emite una factura propia; no se dice nada de la facturación de nadie. |
| 4 | Nunca nombrar competidores | **PASA.** Ni nombres ni logos. «Excel» aparece sólo en la copia de la propia app en el acto 1 («Si la tienes en Excel: Guardar como → CSV»), como formato de origen, no como rival. La banda dice «planilla». |
| 5 | Nunca burlarse de lo clínico ni sugerir atajos | **PASA.** El plan SOAP se muestra tal cual; «Lo que recetaste» respeta que recetó el vet. |
| 6 | Tuteo colombiano, nunca «tu clínica» | **PASA.** Banda y locución en tuteo («tú lo apruebas», «Vendiste», «tienes», «Emites»). Pantallas: `aplicarTuteo` + `TUTEO_EXTRA` («que igual revisás y aprobás» → «revisas y apruebas»); verificado en los stills de la consulta y el carrito. |
| 7 | Grafía «Tuvetia» / «VetGPT» | **PASA.** «Tuvetia» en la locución del acto 2 y en el cierre; «VetGPT» sólo en la copia de la app, con su capitalización. |
| 8 | Privacidad en serio | **PASA.** No se toca el tema. |
| 9 | El sufrimiento del vet no es el gancho | **PASA.** El gancho es «tu catálogo ya existe», no las horas perdidas. |
| 10 | CTA siempre a WhatsApp | **PASA.** Cierre con la pastilla «Escríbenos al WhatsApp» (variante aprobada). |

**Hook (skill `guionista`):** tipo provocación/confesión, sin «Hola» ni contexto. **Reventaba por longitud**:
la frase del encargo «Tu catálogo ya existe. Está en una hoja de cálculo.» tiene 10 palabras en pantalla
(máximo 8) y la locución propuesta tenía 17 habladas (máximo 12). Arreglo mínimo, aplicado: banda **«Tu
catálogo ya existe. Está en una planilla.»** (8; «planilla» es la palabra de la propia app) y locución
«Tu catálogo ya existe: está en una planilla de tu caja.» (10). Si David prefiere «hoja de cálculo», es
una línea en `guion.ts` y el hook queda en 10 palabras a sabiendas.

**Observación sin veredicto:** «Lo resuelve él» (acto 2) deja el sujeto implícito; si se quiere nombrar,
«Lo resuelve VetGPT» respeta la grafía y la app ya lo dice así en pantalla. No se cambió: es la frase
del encargo y el acto 3 la completa.

**Veredicto: LISTO PARA PUBLICAR**, con el hook corregido, condicionado a que los 13 stills del §4 pasen.

---

## 6. Para una segunda pasada

- **El emparejador de `facturar-recetado`** (desviación 4): palabra más larga y distintiva del nombre.
- **Versión de 30 s** para TikTok, quitando los actos 4 y 8: otra composición y otro encargo (§8).
- **Locución de Luciano** + subtítulos quemados.
- **Movimientos**: el orden de las filas nuevas sale del `unshift` por línea (desviación 13); si el
  producto quisiera que la fila del ítem protagonista fuera la primera, es el carrito el que cambia de orden.
