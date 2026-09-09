# ENCARGO · `DemoVentas` — tu caja entra sola y el inventario se cuida solo

> Se lee **después** de `_plantilla-demo-producto.md`, que trae la arquitectura, el lienzo, los sistemas por frame, las líneas rojas, el QA y la entrega. Acá va sólo lo propio de esta pieza.
>
> Se ejecuta con Claude Code abierto en `tuvetia-marketing/remotion/`, en la rama `explainer-rag`. Antes de nada, lee `public/app/NOTAS-MAQUETA.md`: la importación y las acciones del copiloto se reconstruyeron y esas notas mandan sobre cualquier cosa que diga este documento.
>
> **Versión as-built (noche del 8-sep-2026).** Este documento se actualizó para coincidir con lo que se construyó (`src/ventas/`). Las diferencias con el encargo original están en `src/ventas/NOTAS.md` §2 como desviaciones numeradas; acá ya vienen integradas.

---

## 1. La promesa

> Metes tu catálogo aunque venga hecho un desorden, y a partir de ahí el inventario se lleva solo.

Todo lo demás se subordina a eso. No es una pieza sobre facturar: es una pieza sobre **dejar de llevar el inventario a mano**.

**El enemigo es lo manual, no un producto con nombre.** Ni «los otros», ni logos, ni comparaciones — líneas rojas 3 y 4. La pieza gana por lo que muestra en pantalla, no por lo que dice de nadie. «Excel» aparece dos veces: en la copia de la propia app («Si la tienes en Excel: Guardar como → CSV») y en el hook, como el formato de origen, no como rival.

La app ya dice la tesis con sus propias palabras, en el subtítulo de Movimientos: «Cada movimiento deja rastro: las existencias son su saldo, no un número que alguien escribe.» El acto 8 la pone en cámara: la primera mitad como rótulo, la segunda como frase, literal.

---

## 2. Superficies y cámara

**Sólo escritorio**, en tres encuadres (`ENCUADRES` en `guion.ts`, medidos por CDP a 1440×900 con `scripts/medir-pt-ventas.mjs`):

- **general** — la ventana de 1440×900 a 0.65 con cromo, borde superior en y 700. Sólo el acto 1.
- **columna** (820) — la app pinta cada página como columna de lectura (post-proceso: `.pagina>*{max-width:820px}`, igual que su propia página de importar, que ya es angosta); el encuadre corta x 244→1104, y 48→900 sin cromo y lo escala ×1.256 (1080 de ancho) en y 250. Importación, Existencias y Movimientos.
- **lectura** (640) — columna de 640 px para la consulta y el carrito (un párrafo de 1144 px no cabe legible en 1080 de ancho); vista cuadrada x 244→924, y 134→814, ×1.588, de y 250 a y 1330.

**Sin movimiento de cámara en esta pieza.** Ni push, ni zoom, ni reset animado. Cada acto lleva una **escala fija** (un keyframe al entrar y otro idéntico al salir), la que alcanzaba el push de la primera versión, con foco en un punto fijo: acto 1 ×1.04; actos 2–4 ×1.05 (cuerpo ≈ 19,7 px); actos 5 y 6 ×1.05 sobre la columna de 640 (≈ 25 px; a ×1.1 y ×1.2 el carrito y el toast se cortaban); acto 7 ×1.4 sobre la celda del ítem (≈ 26 px); acto 8 ×1.3 sobre la segunda fila (≈ 24,5 px). El cambio de acto es un corte.

**Post-proceso propio de la pieza** (`src/ventas/postproceso.ts`): la columna de lectura, los toasts alineados al borde del encuadre (nacen en x 1108–1424 / y 819–884, fuera de cuadro) con entrada por opacidad de 8 frames, y el **dock flotante oculto** (compartía rincón con los toasts).

---

## 3. La cadena de datos — el eje de la pieza

**El ítem protagonista es el Oclacitinib** (`it-12`: 4 unidades, mínimo 5, ya bajo mínimo). Encadena solo:

1. **Entra en la importación**: el fixture `public/app/_pruebas/catalogo-prueba-encabezados-raros.csv` trae una fila `Oclacitinib 16 mg x 20 tabl.;268.000;4;5` (mismo precio y unidades que el seed → «Actualiza» sin `AJUSTE`).
2. Está en el **plan SOAP de la consulta de Luna** (`c-1`), así que `facturar-recetado` lo mete al carrito sin que nadie lo busque. Entra también la **Solución ótica clotrimazol** (`it-14`): el plan la receta («tópico ótico con clotrimazol»), aunque el emparejador acierte por «solución» y no por «clotrimazol» — ver la deuda en `NOTAS.md`.
3. Al emitir, **baja de 4 a 3**.
4. Deja un **movimiento con rastro**: «Venta · −1 · Factura FV-…» (y la solución ótica, otro igual; por el `unshift` de `descontarStock`, la de la solución queda primera).

**El fixture es el de `_pruebas/`**, incrustado en `guion.ts` como `TEXTO_CSV`; `scripts/verificar-maqueta.mjs` comprueba que sean idénticos. Encabezados `Producto;Valor;Cantidad;Punto de pedido`: los tres primeros se mapean solos, **«Punto de pedido» no** (no está en los sinónimos) y es lo que el vet corrige en el acto 3. Sin una columna suelta el acto 3 no tendría qué mostrar.

**Resuelve todo en el replay, nunca a mano:** el ítem por su nombre en `DB.catalogo`, la consulta como la nota aprobada cuyo plan contiene la primera palabra del ítem, el número de factura leyendo `DB.facturas[0].numero` después de emitir. Si el seed cambia y la cadena se rompe, el replay revienta con el nombre del beat: **para y avisa**, no fuerces otro ítem.

---

## 4. Línea de tiempo — 1500 frames (50 s)

| Frames | Acto | Qué pasa | Rótulo | Frase |
|---|---|---|---|---|
| 0–120 | 1 · La caja a mano | Plano general de la ventana en `/dashboard/facturacion/inventario/importar` (zona de arrastre vacía). Puntero aparece en f100 y viaja a la zona. | `EL CATÁLOGO` | ¿Tienes el control en un Excel? Pásalo a Tuvetia. |
| 120–420 | 2 · Entra el archivo | Corte a la columna. Clic en la zona (f150) y en el beat siguiente (f165) entra el CSV: paso 2 con el **mapeo ya propuesto** (Producto → Nombre, Valor → Precio, Cantidad → Existencias) y «Punto de pedido» en «No importar». Nombre y peso reales del archivo. | `EL MAPEO` | Tus encabezados no son los nuestros. Lo resuelve él. |
| 420–600 | 3 · Confirmar e importar | El puntero corrige **el** `<select>` suelto a «Mínimo» (clic f450), va a «Revisar 8 filas» (clic f495 → paso 3 en f510: seis filas con Nuevo/**Actualiza**, «8 filas: 7 se crean y 1 ya existe») y a «Importar 8 ítems» (clic f555 → importa en f570). Toast con el conteo real de f570 a f645, sobre Existencias (la app navega sola). | `TÚ CONFIRMAS` | Propone el mapeo; tú lo apruebas antes de que entre nada. |
| 600–780 | 4 · El inventario ya está | Existencias: los KPIs reales («Por vencer 0», derivado), y el scroll baja (f645–705) a la vacuna antirrábica en cero con su badge rojo. | `EXISTENCIAS` | Y desde ahí el inventario ya sabe qué tienes y qué te falta. |
| 780–960 | 5 · De la consulta a la factura | Corte a la consulta de Luna en la columna de 640, con **el plan SOAP legible** y el botón «Facturar lo recetado» centrado. El puntero va al botón (clic f915 → carrito en f930): la consulta general más los dos medicamentos del plan, ya armados. | `SIN BUSCAR NADA` | Lo que recetaste en la consulta ya está en la factura. |
| 960–1080 | 6 · Emitir | Scroll a «Emitir», clic (f990 → emite en f1005). Toast con el número de factura real y el total, sobre la factura emitida. | `EMITIR` | — |
| 1080–1260 | 7 · Bajó solo | Corte a Existencias, escala fija ×1.4 sobre la fila del Oclacitinib. **El número es 3, no 4.** Nadie lo escribió. | `SIN TOCAR NADA` | Vendiste una caja. El inventario ya lo sabe. |
| 1260–1380 | 8 · El rastro | Corte a Movimientos: las dos primeras filas son nuevas, «Venta · −1 · Factura FV-…», con el mismo número del toast; debajo, las siete «Carga inicial» de la importación. | `CADA MOVIMIENTO DEJA RASTRO` | Las existencias son su saldo, no un número que alguien escribe. |
| 1380–1500 | Cierre | §5 de la plantilla. | — | — |

Total **1500 frames**. Cambios de acto en múltiplos de 60, cortes internos en múltiplos de 15.

### Clic y corte, separados un beat

Cuando el botón desaparece con la pantalla en el mismo frame del clic, el anillo del clic queda pintado sobre la pantalla nueva. Por eso cada clic va **15 frames antes** del beat que cambia la pantalla (`CLIC` y `CORTE` en `guion.ts`): el anillo se ve sobre el botón, y el corte llega en el beat siguiente.

### Nota sobre el acto 3

El clic que corrige un `<select>` es el plano más importante de la primera mitad. Sin él, la pieza dice «la máquina decide por ti», que es exactamente lo contrario de la línea roja 1. **Con** él dice «la máquina propone y tú apruebas», que además es lo que el producto hace de verdad.

---

## 5. Beats del replay (`src/ventas/estado.ts`)

Con los puntos de entrada que `NOTAS-MAQUETA.md` documenta (`importarDesdeTexto`, `IMP`, `confirmarImportacion`, `nav`, `login-demo`). Todos síncronos.

| desde | beat |
|---|---|
| 0 | ruta importar; `IMP.reset()`; resolver `ctx.idItem` (Oclacitinib) y `ctx.idConsulta` (nota aprobada cuyo plan lo receta) o reventar |
| 165 | `app.importarDesdeTexto(TEXTO_CSV, "catalogo-prueba-encabezados-raros.csv")`; resolver el índice de «Punto de pedido» y comprobar que quedó sin mapear |
| 450 | `IMP.mapeo[idx] = "min"` |
| 510 | `IMP.paso = 3` |
| 570 | `ctx.importe = app.confirmarImportacion()`; **capturar** el toast que la app emitió (HTML de `#avisos`) para mostrarlo sólo en su ventana (570–645); ruta inventario |
| 780 | ruta `/dashboard/consultas/${ctx.idConsulta}` |
| 930 | `ACTIONS["facturar-recetado"](ctx.idConsulta)` (navega solo a `/dashboard/facturacion/nueva`); comprobar que el carrito trae el ítem o reventar |
| 1005 | `ACTIONS["emitir-factura"]()`; `ctx.idFactura`, `ctx.numeroFactura` de `DB.facturas[0]`; capturar el toast (1005–1080); ruta `/dashboard/facturacion/${id}` |
| 1080 | ruta inventario; scroll centra la fila del ítem |
| 1260 | ruta movimientos |

Cuidado con dos cosas:

- **Emitir dos veces descuenta dos veces.** `emitir-factura` (`crearFactura("EMITIDA")`) ya numera, descuenta y navega; no lo encadenes con `emitir-borrador`.
- **El descuento global exige razón escrita.** Esta pieza no usa descuentos.

---

## 6. Lo que la pieza afirma, y qué lo sostiene

| Frase | Qué la sostiene en el cuadro |
|---|---|
| «¿Tienes el control en un Excel? Pásalo a Tuvetia.» | La zona de arrastre vacía del acto 1 y el CSV que entra en el 2. |
| «Tus encabezados no son los nuestros. Lo resuelve él.» | El paso 2 con el mapeo propuesto sobre un CSV cuyos encabezados son de verdad distintos. |
| «Propone el mapeo; tú lo apruebas antes de que entre nada.» | El clic del acto 3 corrigiendo una columna, «Revisar» y el hecho de que nada entra hasta «Importar». |
| «Lo que recetaste en la consulta ya está en la factura.» | El plan SOAP legible en cámara y el carrito armado sin que nadie busque un ítem. |
| «Vendiste una caja. El inventario ya lo sabe.» | El 4 → 3 en la tabla, después de una emisión que ocurrió en cámara. Por corte, no por animación. |
| «Las existencias son su saldo, no un número que alguien escribe.» | Las filas nuevas en Movimientos **y** el subtítulo del propio producto, que es quien lo afirma. |

Lo que **no** se puede decir: nada sobre lo que cuesta o tarda llevar el inventario a mano (línea roja 2); nada sobre leer fotos o Excel (`NOTAS-MAQUETA.md`: XLSX muestra un fixture con aviso, foto y OCR no existen); ningún «automático» que suene a que el vet perdió el control.

---

## 7. QA — stills (`out/qa/ventas/`)

| Frame | Qué tiene que verse |
|---|---|
| 0060 | Ventana completa en la pantalla de importar; banda con el hook. |
| 0200 | Nombre y peso **reales** del archivo («… · 4 columnas · 8 filas · 342 B»), mapeo propuesto. |
| 0330 | El mapeo legible, tabla entera y título de la página entero. |
| 0470 | El puntero sobre el `<select>` corregido, con «Mínimo» visible. |
| 0560 | Paso 3: Nuevo/Actualiza, «7 se crean y 1 ya existe», el clic en «Importar» con el anillo. |
| 0600 | Toast con el conteo real («7 creados, 1 actualizado») sobre Existencias; KPIs con «Por vencer 0». |
| 0700 | La vacuna antirrábica en cero con badge rojo. |
| 0900 | La consulta de Luna con el plan SOAP legible y el botón «Facturar lo recetado». |
| 0960 | El carrito ya armado, con la consulta y el Oclacitinib. |
| 1040 | Toast de factura emitida con número y total reales. |
| 1180 | La fila del Oclacitinib con **3** unidades, legible sin esfuerzo. |
| 1320 | Las filas nuevas en Movimientos con el mismo número de factura que el toast de f1040. |
| 1440 | Cierre con la pastilla de WhatsApp. |

Comprobaciones propias:

- [ ] f0200 y f0330 salen del CSV de `_pruebas/` (`TEXTO_CSV` idéntico al archivo, por script).
- [ ] f0600 coincide con las filas del fixture (7 + 1).
- [ ] f1180 muestra 3 y en ese acto nunca se vio 4: el cambio ocurre por el corte.
- [ ] f1320 lleva el número de factura de f1040.
- [ ] Determinismo: f0470 renderizado en dos procesos da PNG idénticos.
- [ ] Ningún competidor ni logo ajeno en cuadro. El dock no aparece.

---

## 8. Parámetros

- **Música**: la funk a 120 BPM (`MUSICA_FUNK`, ya estirada 125 → 120 en el explainer) a **0.21** (4,2 dB más fuerte que Bellini). Constante `MUSICA` en `guion.ts` para volver a Bellini en una línea.
- **Voz**: Luciano, carril producto. `CON_VOZ = false` con el cableado listo y la locución por acto en `NOTAS.md` §3.
- **Duración**: 1500 frames. La versión de 30 s para TikTok es otra composición y otro encargo.
