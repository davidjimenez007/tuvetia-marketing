# ENCARGO · Tres cambios en la maqueta, previos a los videos de producto

> Se ejecuta con Claude Code abierto en `tuvetia-marketing/remotion/`, sobre `public/app/tuvetia-app.html`.
>
> **Esto no es trabajo de video.** Son tres cambios de producto en la réplica funcional: uno agrega una acción que falta, otro construye un flujo que no existe, y el tercero corrige tres confirmaciones falsas. Los cuatro videos de producto que vienen después dependen de que esto esté hecho, pero el valor no es el video: es que la maqueta deje de prometer cosas que no cumple.
>
> La copia ya viene parchada para Remotion (reloj congelado, `Math.random` con semilla, `SIM.after/every/stream` en no-op, animaciones CSS apagadas, internos en `window.app`). **No toques esos parches.**

---

## 0. Antes de empezar

Lee `../CLAUDE.md` y `../marca/no-decimos.md`. La línea roja 1 —VetGPT sugiere y el vet decide— es exactamente lo que el cambio C viene a defender.

**Los números de línea de este documento son de una lectura anterior y el archivo ya creció.** Localiza cada punto con `grep` en el momento de tocarlo; los números están para orientarte, no para confiar en ellos.

Trabaja en la rama que ya existe para este trabajo, nunca en `main`. Al terminar, deja `NOTAS-MAQUETA.md` junto al HTML con lo que hiciste, lo que no pudiste, y cómo verificar cada cosa a mano.

---

## A. «Informe para el titular» desde la ficha del paciente

### Qué pasa hoy

`abrirInforme(consultaId)` (~l.4702) ya existe y es bueno: arma un texto en lenguaje llano a partir de la nota SOAP —qué encontramos, qué creemos que tiene, qué hay que hacer en casa— lo abre en un diálogo editable, y `enviar-informe` (~l.7113) empuja el mensaje de verdad a `DB.wa.mensajes`, donde aparece en Comunicaciones.

El problema es dónde vive el botón: **sólo en `VistaConsulta`** (~l.4247), deshabilitado hasta que la nota esté aprobada. Desde la ficha del paciente no hay forma de compartir nada. El vet que quiere mandarle el resumen al titular tiene que acordarse de en qué consulta fue.

### Qué construir

Un botón **«Informe para el titular»** en la ficha del paciente, en la fila de acciones de la cabecera (`VistaPaciente`, ~l.3405, junto a «Iniciar consulta» y «Preguntarle a VetGPT»).

Comportamiento:

- Se refiere a **la consulta más reciente del paciente que tenga nota aprobada**. Resuélvela con `SEL.consultasDe(p.id)` y `SEL.notaDe(c.id)`, tomando la primera cuya nota tenga `estado === "approved"`.
- Si existe, el botón está activo y abre `abrirInforme(esaConsulta.id)` — el diálogo que ya existe, sin duplicar nada.
- Si no existe ninguna, el botón va `disabled` con `title="Todavía no hay una nota aprobada para compartir"`. No lo escondas: que se vea que la función está y por qué no aplica todavía.

Es intencionalmente el mismo diálogo y el mismo envío. **No escribas un segundo informe ni un resumen de la historia completa**: eso sería otra función, más grande, y no es lo que se pidió.

### El canal correo

`enviar-informe` con `canal === "correo"` no escribe en ningún lado: cierra el overlay y saca un toast. Déjalo como está —arreglarlo pide una bandeja de enviados que no existe— pero **anótalo en NOTAS-MAQUETA.md**, porque el video sólo va a filmar el envío por WhatsApp por esa razón.

### Verificación

A mano, en el navegador: entrar como clínica demo → `/dashboard/patients/p-1` (Luna, que tiene dos consultas con nota aprobada) → el botón abre el diálogo con el texto ya redactado → «Enviar por WhatsApp» → ir a `/dashboard/comunicaciones` y comprobar que el mensaje está en el hilo de Mariana Osorio. Después, un paciente sin notas aprobadas: el botón debe verse deshabilitado con su tooltip.

---

## B. Importar el catálogo leyendo el archivo de verdad

### Qué pasa hoy

`VistaImportarCatalogo` (~l.5803) y la acción `importar-catalogo` (~l.7305) son una puesta en escena: **no hay `<input type="file">`**. El nombre `catalogo-vetcol.csv`, las «6 filas · 12 KB» y la previsualización están escritos a mano en el HTML, y la acción inserta seis ítems literales que no tienen nada que ver con ningún archivo. Además el aviso dice que los SKU repetidos se actualizan, y no hay ningún matching: pulsar dos veces duplica todo.

Es el flujo que el video quiere mostrar y hoy no se puede filmar sin mentir.

### Qué construir

El flujo completo, en tres pasos dentro de la misma vista. La gracia del paso 2 es que **es donde la inteligencia se justifica**: nadie exporta su caja con los encabezados que el sistema espera.

**Paso 1 — elegir el archivo.** Un `<input type="file" accept=".csv,text/csv">` real, con el área de arrastre que ya está dibujada. Al elegir, lee el archivo con `FileReader` y muestra el nombre y el tamaño **reales**, no los del HTML.

**Paso 2 — el mapeo propuesto.** Parsea el CSV en JavaScript plano (respeta comillas y comas dentro de comillas; no hace falta más). Con los encabezados que traiga el archivo, propón a qué campo va cada columna —`nombre`, `tipo`, `precio`, `unidades`, `min`, `sku`— y muéstralo como una tabla de dos columnas, `columna del archivo → campo de Tuvetia`, cada fila con un `<select>` para corregir el mapeo a mano. Ése es el estado que hay que poder filmar: **la propuesta ya hecha y el vet confirmando**, no un formulario en blanco.

La propuesta se resuelve por coincidencia de nombre normalizado (minúsculas, sin tildes, sin espacios) contra una tabla de sinónimos que declares en el código: `nombre` ← «producto», «descripcion», «item», «articulo»; `precio` ← «valor», «pvp», «precio venta»; `unidades` ← «cantidad», «existencias», «stock»; y así. Sin coincidencia, el `<select>` queda en «No importar».

**Paso 3 — la previsualización y la importación.** Muestra las primeras filas **del archivo real**, ya mapeadas, con el conteo verdadero de filas. Al confirmar:

- Crea o actualiza en `DB.catalogo`. **Deduplica**: si hay `sku`, por `sku`; si no, por nombre normalizado. Un ítem que ya existía se actualiza (precio y unidades) en vez de duplicarse. Con esto el aviso de la pantalla deja de ser mentira.
- Por cada ítem con `stock`, emite un movimiento **`CARGA_INICIAL`** en `DB.movimientos` con la cantidad importada. El tipo ya está rotulado en `ROT_MOV` (~l.5724) y hoy no lo usa nadie; sin esto entran decenas de unidades al inventario sin rastro, justo en el módulo cuyo cartel dice que las existencias salen de los movimientos.
- Un toast con el conteo real: cuántos creados, cuántos actualizados.

### Los límites, y hay que respetarlos

La maqueta es un archivo suelto que corre sin internet y sin dependencias. Eso significa:

- **CSV: se lee de verdad, de punta a punta.** Ése es el camino que el video va a filmar.
- **XLSX: no se puede parsear** sin una librería externa. Acepta el archivo, y si la extensión es `.xlsx` muestra el mismo paso 2 sobre un juego de columnas declarado en el código como fixture, con un aviso visible de que la maqueta no lee Excel. **No lo disfraces de lectura real.**
- **Foto y OCR: no se construyen.** No hay modelo detrás de esta maqueta. Si el producto real lo hace, es otra conversación y otro encargo.

Deja los tres límites escritos en NOTAS-MAQUETA.md con esas palabras. El video se guionizará contra lo que quede funcionando, y necesito saber exactamente qué es.

### Verificación

Prepara dos CSV de prueba en el escritorio: uno con encabezados «raros» (`Producto;Valor;Cantidad`) para que el mapeo tenga algo que resolver, y otro que repita dos ítems que ya estén en el catálogo, para comprobar que se actualizan y no se duplican. Corre los dos a mano en el navegador y comprueba en `/dashboard/facturacion/inventario` y en `/inventario/movimientos`.

---

## C. Tres acciones que confirman cosas que no hicieron

### Qué pasa hoy

Esto no es cosmético. Tres acciones le muestran al veterinario un check verde y una frase en pasado sobre algo que nunca ocurrió:

| Dónde | Qué dice | Qué hace |
|---|---|---|
| `responderVetGPT`, rama del hueco libre (~l.5049) | `pasosHechos: ["Mensaje enviado por WhatsApp"]`, con botón «Ver la conversación» | Su `ejecutar()` **no escribe nada**. La conversación a la que lleva el botón no tiene ningún mensaje nuevo. |
| `responderVetGPT`, rama de alergia (~l.5094) | `pasosHechos: ["Alergia registrada en la ficha"]`, con botón «Ver la ficha» | **No toca `DB.alergias`.** La ficha sigue igual. Y el `payload.alergeno` es `"—"` porque `registrar_alergia` no está en `CAMPOS_EDITABLES`: ni siquiera se puede escribir qué alergia es. |
| `create_appointment` (~l.5010) | `pasosHechos: ["Cita creada en la agenda", "Invitación enviada al titular", "Aviso por WhatsApp enviado"]` | Sólo el primero es cierto (`DB.citas.push`). Los otros dos no ocurren. |

Un producto cuyo copiloto dice «mensaje enviado» sin enviarlo se rompe la primera vez que un vet lo comprueba, y lo que se rompe es exactamente lo que el producto vende.

### Qué construir

**C.1 — El hueco libre.** Que `ejecutar()` mande el mensaje de verdad: `DB.wa.mensajes.push` con la misma forma que usa la rama de cartera (~l.5028), incluyendo `entregado: new Date()`, y `DB.wa.contactos.push` si el titular no era contacto todavía. Devuelve el `destino` a `/dashboard/comunicaciones` que ya devuelve.

**C.2 — Registrar alergia.** Dos partes:

- Agrega `registrar_alergia` a `CAMPOS_EDITABLES` (~l.4932) con `alergeno` y `severidad`, para que el vet escriba de qué alergia habla antes de aprobar. Es una decisión clínica: no puede ir en blanco.
- Que `ejecutar()` haga `DB.alergias.push` con la forma que usa el seed (mira `seedDemo`, ~l.1271) y los valores del payload. Si `alergeno` sigue siendo `"—"` al aprobar, no ejecutes: saca un toast en tono `mal` pidiendo el alérgeno, como hace la guarda de la nota SOAP.

**C.3 — La cita.** Dos opciones, en este orden de preferencia:

1. Cumplir lo que promete: además del `DB.citas.push`, empujar el WhatsApp de aviso al titular con el texto de confirmación. Es coherente con la plantilla de recordatorio que ya está en Administración → Agenda.
2. Si no, **recortar `pasos` y `pasosHechos` a lo que de verdad ocurre**: crear la cita, y nada más.

Lo que no es opción es dejarlo como está.

**C.4 — Bonus barato, si te queda bien.** `VistaComunicaciones` (~l.6075) y `PropuestasPendientes` (~l.4984) reconstruyen la tarjeta sin pasar `pasosHechos` ni `destino`, así que al aprobar en la bandeja el vet ve «✓ Ejecutada» pelado en vez de los pasos con check y el botón al destino. Pásalos. Y dale a la rama `wa` de `accion-aprobar` (~l.7162) un `destino` a `/dashboard/comunicaciones`.

### Verificación

Una por una, a mano, comprobando **en la otra pantalla**: aprobar el ofrecimiento de hueco y encontrar el mensaje en Comunicaciones; aprobar una alergia con alérgeno escrito y encontrarla en la ficha del paciente, con la banda roja si es severa; aprobar la cita y encontrarla en el calendario, y el aviso en Comunicaciones si hiciste la opción 1.

Como el chat de VetGPT no responde solo en esta copia (`SIM` es no-op), para llegar a las tarjetas usa la consola: `app.responderVetGPT("...")` con la pregunta de cada rama, y empuja el resultado a `CHAT.mensajes` como hace el replay de Remotion. Deja escrito en NOTAS-MAQUETA.md el comando exacto de cada una, que los encargos de video lo van a necesitar.

---

## D. Lo que NO se toca en este encargo

- El parche demo (reloj, semilla, `SIM`, CSS de captura). Nada de restaurar temporizadores.
- El flujo de la consulta grabada y la nota SOAP: funciona, y su animación la dirige Remotion frame a frame.
- La barra de autonomía. Hoy guarda un nivel que nadie lee, y darle consecuencia real —mensajes entrantes simulados, respuestas automáticas— es una función entera, no un arreglo. Queda anotada como deuda, no como trabajo de este encargo.
- El botón «Sugerir» de la bandeja de WhatsApp, que gira para siempre porque su continuación vive dentro de `SIM.after`. Mismo caso: se anota, no se toca.
- `contratar-plan`, `nueva-compra`, `nuevo-movimiento`, `exportar`, `imprimir` y demás toasts decorativos. Son honestos en su modestia: no afirman haber cambiado datos.

---

## E. Entrega

`NOTAS-MAQUETA.md` junto al HTML, con: qué quedó hecho de A, B y C; los tres límites de B escritos con todas las letras; los comandos de consola para alcanzar cada tarjeta de acción; y la lista de deuda que quedó fuera (autonomía sin consecuencia, «Sugerir» colgado, correo sin enviados, notas crédito que no devuelven stock, `porVencer` fijo en 2).

Después de esto, `npm run lint` tiene que pasar y la app tiene que abrirse con doble clic y funcionar sin errores en consola. Compruébalo antes de dar por terminado.