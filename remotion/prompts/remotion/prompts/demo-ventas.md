# ENCARGO · `DemoVentas` — tu caja entra sola y el inventario se cuida solo

> Se lee **después** de `_plantilla-demo-producto.md`, que trae la arquitectura, el lienzo, los sistemas por frame, las líneas rojas, el QA y la entrega. Acá va sólo lo propio de esta pieza.
>
> Se ejecuta con Claude Code abierto en `tuvetia-marketing/remotion/`, en la rama `explainer-rag` o una nueva sobre ella. Antes de nada, lee `public/app/NOTAS-MAQUETA.md`: la importación y las acciones del copiloto se reconstruyeron y esas notas mandan sobre cualquier cosa que diga este documento.

---

## 1. La promesa

> Metes tu catálogo aunque venga hecho un desorden, y a partir de ahí el inventario se lleva solo.

Todo lo demás se subordina a eso. No es una pieza sobre facturar: es una pieza sobre **dejar de llevar el inventario a mano**.

**El enemigo es lo manual, no un producto con nombre.** Ni «los otros», ni logos, ni comparaciones — líneas rojas 3 y 4. La pieza gana por lo que muestra en pantalla, no por lo que dice de nadie.

Y hay un regalo: la app ya dice la tesis con sus propias palabras, en el subtítulo de Existencias y en el de Movimientos. Localízalas por `grep` («Existencias derivadas de los movimientos» y «las existencias son su saldo»). **Son la frase que no se puede desmentir**, porque está en el producto, y por eso el acto 7 las pone en cámara en vez de parafrasearlas.

---

## 2. Superficies: sólo escritorio

Nada de móvil en esta pieza, y es a propósito. Importar un catálogo con una tabla de mapeo y emitir una factura son trabajo de escritorio; meterlo en un teléfono sería una postal falsa. El móvil se queda para la pieza de Comunicaciones, donde sí es su sitio.

El lienzo sigue siendo 1080×1920 y el escritorio se resuelve como en la pieza anterior: plano general con marco de ventana para establecer, y **corte** a un encuadre de la columna cuando algo tiene que leerse. Aquí hay dos encuadres distintos y conviene declararlos en `guion.ts`:

- **Encuadre de trabajo** — la zona de contenido de la app sin la barra lateral, para la importación y el carrito.
- **Encuadre de tabla** — más apretado, sobre la fila del ítem que cambia, para los actos 6 y 7. Es donde el número tiene que leerse sin dudar.

Mídelos con un still antes de fijarlos; no los copies de la pieza anterior.

---

## 3. La cadena de datos — el eje de la pieza

Esto no es decoración: es lo que hace que los siete actos sean una sola historia en vez de siete pantallazos.

**El ítem protagonista es el Oclacitinib** (`it-12` en el seed: 4 unidades, mínimo 5, ya bajo mínimo). Lo elegimos porque encadena solo:

1. Es un medicamento del catálogo, así que **entra en la importación**.
2. Está en el **plan SOAP de la consulta de Luna** (`c-1`), así que `facturar-recetado` lo mete al carrito sin que nadie lo busque.
3. Al emitir, **baja de 4 a 3** — un número chico, que se lee de un vistazo y que cruza el mínimo.
4. Deja un **movimiento con rastro**: tipo «Venta», cantidad `−1`, nota con el número de factura.

Y encima Luna es la paciente del primer video de la serie. El vet que vio los dos entiende que es la misma clínica y el mismo animal.

**Resuelve todo en el replay, nunca a mano:** el ítem por su nombre en `DB.catalogo`, la consulta por `DB.consultas`, el número de factura leyendo `DB.facturas[0].numero` después de emitir. Si el seed cambia y el Oclacitinib deja de estar en el plan de `c-1`, **para y avísame** en vez de forzar otro ítem: la pieza se cae sin esa coincidencia.

---

## 4. Línea de tiempo — 1440 frames (48 s)

| Frames | Acto | Qué pasa | Rótulo | Frase |
|---|---|---|---|---|
| 0–120 | 1 · La caja a mano | Plano general de la ventana en `/dashboard/facturacion/inventario/importar`. Cámara 1.0 → 1.04. | `EL CATÁLOGO` | Tu catálogo ya existe. Está en una hoja de cálculo. |
| 120–420 | 2 · Entra el archivo | Corte al encuadre de trabajo. El puntero va a la zona de carga, clic, y entra el CSV de encabezados raros de `_pruebas/`. Se ven el nombre y el peso reales del archivo. Aparece el paso 2 con **el mapeo ya propuesto**: cada columna del archivo apuntando a su campo de Tuvetia. Zoom 1.3 sobre dos filas del mapeo. | `EL MAPEO` | Tus encabezados no son los nuestros. Lo resuelve él. |
| 420–600 | 3 · Confirmar e importar | El puntero corrige **un** `<select>` a mano —el que quedó en «No importar»— y clic en confirmar. Toast con el conteo real de creados y actualizados. | `TÚ CONFIRMAS` | Propone el mapeo; tú lo apruebas antes de que entre nada. |
| 600–780 | 4 · El inventario ya está | Corte a `/dashboard/facturacion/inventario`. Los KPIs con sus valores reales, la tabla, y la vacuna antirrábica en cero con su badge rojo. Push lento. | `EXISTENCIAS` | Y desde ahí el inventario ya sabe qué tienes y qué te falta. |
| 780–960 | 5 · De la consulta a la factura | Corte a la consulta de Luna. El puntero va a **«Facturar lo recetado»**, clic, y el carrito aparece **ya armado**: la consulta más los medicamentos del plan. Nadie buscó nada. | `SIN BUSCAR NADA` | Lo que recetaste en la consulta ya está en la factura. |
| 960–1080 | 6 · Emitir | Clic en emitir. Toast con el número de factura real y el total. | `EMITIR` | — |
| 1080–1260 | 7 · Bajó solo | Corte al encuadre de tabla en `/dashboard/facturacion/inventario`, sobre la fila del Oclacitinib. **El número es 3, no 4.** Nadie lo escribió. Zoom 1.4. | `SIN TOCAR NADA` | Vendiste una caja. El inventario ya lo sabe. |
| 1260–1380 | 8 · El rastro | Corte a `/dashboard/facturacion/inventario/movimientos`. La primera fila es nueva: «Venta · −1 · Factura FV-…». Debajo, la frase del propio producto (§1). | `CADA MOVIMIENTO DEJA RASTRO` | *(la frase literal del subtítulo de la app)* |
| 1380–1500 | Cierre | §5 de la plantilla. | — | — |

Total **1500 frames**. Cambios de acto en múltiplos de 60, cortes internos en múltiplos de 15.

### Nota sobre el acto 3

El clic que corrige un `<select>` es el plano más importante de la primera mitad y es fácil perderlo. Sin él, la pieza dice «la máquina decide por ti», que es exactamente lo contrario de la línea roja 1. **Con** él dice «la máquina propone y tú apruebas», que además es lo que el producto hace de verdad. Si por tiempo hay que recortar algo del acto 2 o del 3, se recorta del 2.

---

## 5. Beats del replay

Con los puntos de entrada que `NOTAS-MAQUETA.md` documenta (`importarDesdeTexto`, `IMP`, `confirmarImportacion`, `nav`, `login-demo`). Todos síncronos.

| desde | beat |
|---|---|
| 0 | `ruta /dashboard/facturacion/inventario/importar`; `IMP.reset()` |
| 150 | `app.importarDesdeTexto(TEXTO_CSV, "catalogo-vetcol.csv")` — el texto del CSV de `_pruebas/`, incrustado como constante en `guion.ts` para no depender de una lectura asíncrona en el render |
| 430 | corregir a mano una columna del mapeo, escribiendo en `IMP.mapeo` el campo que faltaba |
| 520 | `app.confirmarImportacion()`; leer del resultado el conteo real de creados y actualizados para el toast |
| 600 | `ruta /dashboard/facturacion/inventario` |
| 780 | `ctx.idConsulta = ` la consulta de Luna con nota aprobada y plan que menciona el medicamento; `ruta /dashboard/consultas/${ctx.idConsulta}` |
| 870 | `ACTIONS["facturar-recetado"](ctx.idConsulta)` — deja el carrito armado y navega solo a `/dashboard/facturacion/nueva` |
| 990 | `ACTIONS["emitir-factura"]()`; guardar `DB.facturas[0].numero` en `ctx` para el toast y para el acto 8 |
| 1080 | `ruta /dashboard/facturacion/inventario`; scroll hasta centrar la fila del medicamento |
| 1260 | `ruta /dashboard/facturacion/inventario/movimientos` |

Cuidado con dos cosas:

- **Emitir dos veces descuenta dos veces.** El replay reconstruye desde cero en cada frame, así que el beat de emitir corre una sola vez por frame reconstruido y eso está bien; pero si en algún momento encadenas `emitir-factura` y `emitir-borrador` sobre la misma factura, el stock baja el doble. No lo hagas.
- **El descuento global exige razón escrita.** Esta pieza no usa descuentos; si por algo los metes, `crearFactura` aborta con un toast y el acto siguiente se queda sin factura.

---

## 6. Lo que la pieza afirma, y qué lo sostiene

| Frase | Qué la sostiene en el cuadro |
|---|---|
| «Tus encabezados no son los nuestros. Lo resuelve él.» | El paso 2 con el mapeo propuesto sobre un CSV cuyos encabezados son de verdad distintos. Por eso el fixture es el de encabezados raros y no uno cómodo. |
| «Propone el mapeo; tú lo apruebas antes de que entre nada.» | El clic del acto 3 corrigiendo una columna, y el hecho de que nada entra hasta confirmar. |
| «Lo que recetaste en la consulta ya está en la factura.» | El carrito armado sin que nadie busque un ítem. Verificable comparando el plan SOAP en cámara con las líneas del carrito. |
| «Vendiste una caja. El inventario ya lo sabe.» | El 4 → 3 en la tabla, después de una emisión que ocurrió en cámara. |
| «Cada movimiento deja rastro.» | La fila nueva en Movimientos **y** el subtítulo del propio producto, que es quien lo afirma. |

Lo que **no** se puede decir, aunque tiente:

- Nada sobre lo que cuesta o tarda llevar el inventario a mano: no hay medición y la línea roja 2 lo prohíbe.
- Nada sobre leer fotos o Excel. `NOTAS-MAQUETA.md` dice que XLSX muestra un fixture con aviso y que foto y OCR no existen. **La pieza filma el camino del CSV, que es real de punta a punta**, y no insinúa los otros dos.
- Ningún «automático» que suene a que el vet perdió el control. El acto 3 existe justamente para lo contrario.

---

## 7. QA — stills

Además del checklist común de la plantilla:

| Frame | Qué tiene que verse |
|---|---|
| 0060 | Ventana completa en la pantalla de importar. |
| 0200 | Nombre y peso **reales** del archivo, no los del HTML viejo. |
| 0330 | El mapeo propuesto, legible: columna del archivo → campo de Tuvetia. |
| 0470 | El puntero sobre el `<select>` que se corrige, con la opción elegida visible. |
| 0560 | Toast con el conteo real de creados y actualizados. |
| 0700 | Inventario con los KPIs y la vacuna antirrábica en cero con badge rojo. |
| 0900 | La consulta de Luna con el botón «Facturar lo recetado». |
| 0960 | El carrito ya armado, con la consulta y el medicamento del plan. |
| 1040 | Toast de factura emitida con número y total reales. |
| 1180 | La fila del medicamento con **3** unidades, legible sin esfuerzo. |
| 1320 | La fila nueva en Movimientos: «Venta · −1 · Factura FV-…». |
| 1440 | Cierre con la pastilla de WhatsApp. |

Comprobaciones propias de esta pieza:

- [ ] En f0200 y f0330 lo que se ve **sale del CSV de `_pruebas/`**, no de un literal en el HTML. Si el archivo cambia, el still cambia.
- [ ] En f0560 los números del toast coinciden con las filas del fixture.
- [ ] En f1180 el número es 3 y en ningún frame anterior de ese mismo acto fue 4 y luego 3 en el mismo plano: el cambio ocurre por el corte, no por una animación que sugiera que alguien lo editó.
- [ ] En f1320 el número de factura del movimiento es el mismo del toast de f1040.
- [ ] En ningún frame aparece un nombre de competidor, ni un logo que no sea de Tuvetia o de las integraciones oficiales.

---

## 8. Parámetros

- **Música**: la funk a 120 BPM. Es la que cae nativa en la rejilla, sin estirar. Déjala como constante en `guion.ts` para poder cambiarla a Bellini en una línea.
- **Voz**: Luciano, carril producto. Sin locución grabada en esta entrega; `CON_VOZ = false` con el cableado listo y el texto de locución por acto en las notas.
- **Duración**: 1500 frames. Si más adelante hace falta el corte de 30 s para TikTok, sale de acá quitando los actos 4 y 8 — pero eso es otra composición y otro encargo, no un recorte improvisado.