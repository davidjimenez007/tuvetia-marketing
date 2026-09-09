# Maqueta · notas de los tres cambios previos a los videos de producto

Encargo: `remotion/prompts/remotion/maqueta-cambios-para-videos.md`, ejecutado el 8-sep-2026 sobre
`public/app/tuvetia-app.html` en la rama `explainer-rag`. Los parches demo (reloj congelado, `mulberry32`,
`SIM` no-op, `nav` síncrono, CSS de captura) no se tocaron.

Todo lo que dice «línea» acá es orientativo: el archivo crece con cada cambio. **Localiza por grep** los
nombres que se citan (`informe-paciente`, `importarDesdeTexto`, `CAMPOS_IMPORT`, `registrar_alergia`…).

Verificación reproducible: `node scripts/verificar-maqueta.mjs` desde `remotion/` recorre A, B y C en un
navegador real sin cabeza (el chrome-headless-shell de Remotion, CDP por WebSocket), **a 1440×900 y
540×960**, deja 22 stills por ancho en `out/qa/maqueta/{1440,540}/` y un `resultados.json`. Última corrida:
71 comprobaciones en verde, consola sin errores ni advertencias.

---

## A · «Informe para el titular» desde la ficha del paciente — HECHO

- `VistaPaciente` resuelve `conInforme`: la consulta más reciente (`SEL.consultasDe` ya ordena
  descendente por `inicio`) cuya nota (`SEL.notaDe`) tenga `estado === "approved"`.
- Tercer botón en la fila de acciones de la cabecera, junto a «Iniciar consulta» y «Preguntarle a
  VetGPT»: **`data-act="informe-paciente"`** con `data-arg` = esa consulta. Si no hay ninguna, el mismo
  botón va `disabled` con `title="Todavía no hay una nota aprobada para compartir"`. No se esconde.
- El handler es una línea: `"informe-paciente": a => abrirInforme(a)`. Mismo diálogo (`abrirInforme`) y
  mismo envío (`enviar-informe`) que en la consulta. No hay un segundo informe ni resumen de historia.
- **Por qué `informe-paciente` y no `informe`:** el guion del DemoSaaS apunta por selector a
  `button[data-act='informe']` dentro de la consulta; dos botones con el mismo `data-act` en la app
  serían un blanco ambiguo para los replays de Remotion.

**El canal correo sigue sin escribir nada.** `enviar-informe` con `canal === "correo"` cierra el diálogo
y saca un toast; no hay bandeja de enviados donde dejarlo. Por eso **el video filma sólo el envío por
WhatsApp**.

**A mano:** entrar como clínica demo → Pacientes → Luna (`/dashboard/patients/p-1`, dos notas aprobadas;
el botón abre la de `c-1`) → «Informe para el titular» → «Enviar por WhatsApp» → Comunicaciones → hilo de
Mariana Osorio con el mensaje. Después, Simón (`p-2`, sin nota aprobada): botón deshabilitado con tooltip.

---

## B · Importar el catálogo leyendo el archivo de verdad — HECHO

Ruta `/dashboard/facturacion/inventario/importar` (botón «Importar csv» en Existencias). Tres pasos en la
misma vista, estado en `IMP` (fuera de `DB`, sobrevive al `render()`), y estas piezas, todas junto a
`VistaImportarCatalogo`:

| Pieza | Qué hace |
|---|---|
| `parsearCSV(texto)` | Delimitador autodetectado en la primera línea (`;` `,` `\t` `\|`), comillas con `""`, delimitadores y saltos dentro de comillas, filas vacías fuera, BOM fuera. |
| `proponerMapeo(encabezados)` | Nombre normalizado (minúsculas, sin tildes, sin espacios ni signos) contra `SINONIMOS_IMPORT`. Cada campo una sola vez. Sin coincidencia → «No importar». |
| `parsearPesos` / `parsearEntero` / `normalizarTipo` | «62.000», «$ 62.000», «62.000,50» → centavos; tipo desde la columna o, si no viene, de lo obvio en el nombre. |
| `importarDesdeTexto(texto, nombre, tam)` | **Entrada síncrona**: parsea, propone el mapeo, deja `IMP.paso = 2` y navega. |
| `cargarArchivoImportado(File)` | Lo asíncrono: `FileReader` → `TextDecoder("utf-8", fatal)` y si falla `windows-1252` (el CSV «ANSI» de Excel en Windows) → `importarDesdeTexto`. |
| `confirmarImportacion()` | Dedupe, escritura en `DB.catalogo`, movimientos, toast con conteo real, vuelve a Existencias. Devuelve `{ creados, actualizados, movimientos }`. |

**Paso 1.** Zona de arrastre (`label.vacio[data-soltar]`, el patrón de estado vacío de la app) que envuelve
un `<input type="file" accept=".csv,text/csv,.xlsx">` real. Elegir dispara el listener global de `input`;
arrastrar va por tres listeners nuevos en `document` (`dragover`/`dragleave`/`drop` sobre `[data-soltar]`),
junto a los demás. Nombre y tamaño que se muestran son los del archivo (`file.name`, `file.size`). El
encargo suponía un área de arrastre ya dibujada; no existía y se construyó.

**Paso 2.** Tabla «Columna del archivo · Primer valor · Campo de Tuvetia», un `<select>` por columna
(`imp-mapeo`). Es el estado para filmar: la propuesta hecha y el vet confirmando. «Revisar N filas» exige
que alguna columna sea Nombre.

**Paso 3.** Las primeras 6 filas reales ya mapeadas, cada una con su insignia **Nuevo** / **Actualiza**
junto al nombre (así se ve también a 540 px), y el conteo verdadero. Al confirmar:

- **Dedupe** por `sku` (normalizado a mayúsculas) si viene; si no, por nombre normalizado. Existente →
  se actualizan `precio`, `unidades` (y `min` si viene; el `sku` se completa si no tenía). Nuevo →
  `DB.catalogo.push` con la forma de `guardar-item` (IVA 19 gravado, `stock` salvo servicios, categoría
  por tipo, `costo` en blanco porque no viene en el archivo).
- **Movimientos:** ítem nuevo con existencias → `CARGA_INICIAL` por la cantidad importada. Ítem que ya
  existía y cambia de existencias → **`AJUSTE` con el delta** («Importación …: de 18 a 30»).
  *Desviación deliberada:* el encargo dice `CARGA_INICIAL` para todos; sobre un ítem con saldo eso
  duplicaría el rastro, y el módulo dice que las existencias son el saldo de los movimientos.
- Toast: «Importados: N creados, M actualizados» + «Ver». El aviso de la pantalla («los SKU que ya
  existen se actualizan») ahora es verdad; pulsar dos veces ya no duplica.

### Los tres límites, con todas las letras

1. **CSV: se lee de verdad, de punta a punta.** Es el camino que el video va a filmar.
2. **XLSX: no se puede parsear** sin una librería externa, y la maqueta corre sin internet y sin
   dependencias. Se acepta el archivo; con extensión `.xlsx`/`.xls` se muestra el mismo paso 2 sobre
   `FIXTURE_XLSX` (columnas y seis filas de ejemplo declaradas en el código) con un aviso visible: **«La
   maqueta no lee Excel. Lo que ves es una muestra…»**, y el botón de importar del paso 3 queda
   deshabilitado. No se disfraza de lectura real.
3. **Foto y OCR: no se construyen.** No hay modelo detrás de esta maqueta.

### Fixtures y verificación a mano

Los dos CSV de prueba viven versionados en `public/app/_pruebas/` y copiados en el Escritorio:

- `catalogo-prueba-encabezados-raros.csv` — `Producto;Valor;Cantidad`, con `;`, precios «62.000», un
  nombre entre comillas con coma adentro y una tilde. Esperado: mapeo Producto→Nombre, Valor→Precio,
  Cantidad→Existencias; 7 creados, 7 `Carga inicial`.
- `catalogo-prueba-repetidos.csv` — `SKU,Nombre,Tipo,Precio,Stock,Minimo`, con `MED-101` (Carprofeno,
  18→30) y `MED-102` (Oclacitinib, 4→12) que ya están en el catálogo, más tres nuevos. Esperado: 2
  actualizados sin duplicar, 3 creados, dos `Ajuste` (+12, +8) y tres `Carga inicial`.

A mano: Ventas → Existencias → «Importar csv» → arrastrar el archivo → revisar el mapeo → «Revisar N
filas» → «Importar N ítems» → comprobar en `/dashboard/facturacion/inventario` y en
`/dashboard/facturacion/inventario/movimientos`.

### Para el replay de Remotion (sin FileReader)

```js
const csv = `Producto;Valor;Cantidad
Meloxicam 1,5 mg/mL;62.000;12
Gabapentina 100 mg x 30;88.000;8`;
app.importarDesdeTexto(csv, "catalogo-vetcol.csv");   // síncrono: deja IMP en el paso 2 y navega
app.IMP.paso = 3; app.render();                        // previsualización
app.confirmarImportacion();                            // escribe y vuelve a Existencias
```

`app.IMP`, `app.importarDesdeTexto`, `app.cargarArchivoImportado` y `app.confirmarImportacion` están en
`window.app` (línea PARCHE DEMO). Para un `.xlsx`: `app.importarDesdeTexto("", "caja.xlsx", 20480)`.

---

## C · Tres acciones que confirmaban cosas que no hicieron — HECHO

| Rama de `responderVetGPT` | Antes | Ahora |
|---|---|---|
| **Hueco libre** (`/hueco\|libre\|minutos libres/`) | `ejecutar()` devolvía «Mensaje enviado» sin escribir nada | `ejecutar()` hace `DB.wa.mensajes.push` (misma forma que la rama de cartera, con `entregado`) y `DB.wa.contactos.push` si el titular no estaba. Sin teléfono, no ejecuta y explica. |
| **Registrar alergia** (`/alergia/` con paciente) | `alergeno: "—"` no editable, `severidad: "moderada"` (clave inexistente), no tocaba `DB.alergias` | `registrar_alergia` entra a `CAMPOS_EDITABLES` con **Alérgeno** (input) y **Severidad** (`<select>` leve/moderada/severa, claves reales `mild/moderate/severe`). `ejecutar()` hace `DB.alergias.push` con la forma del seed. **Guarda:** alérgeno en blanco → no ejecuta, toast en tono `mal`, la tarjeta sigue propuesta. |
| **Crear cita** (`/agend\|cita\|control/` + Luna/semana…) | Tres `pasosHechos`, uno cierto | Opción 1 del encargo: además de `DB.citas.push`, manda el WhatsApp de confirmación al titular (si `DB.clinica.confirmacionCitas` y hay teléfono), coherente con «Confirmación al agendar» de Administración → Agenda. `pasos`/`pasosHechos` sólo con lo que ocurre; la «invitación al calendario» se quitó porque no existe. La cita se crea con el **motivo y la fecha que el vet editó** (antes los ignoraba). |

Soporte en `accion-aprobar`: si `ejecutar()` devuelve `{ error }`, toast `mal` y la acción no pasa a
`executed` (patrón de la guarda de la nota SOAP). **C.4:** `PropuestasPendientes` y la bandeja de WhatsApp
pasan `pasosHechos` y `destino` al reconstruir la tarjeta; la rama `wa` de `accion-aprobar` devuelve
`destino` a `/dashboard/comunicaciones`.

`TarjetaAccion` admite un cuarto elemento en `CAMPOS_EDITABLES`: texto → placeholder del input; objeto →
opciones de un `<select>`.

### Comandos de consola para llegar a cada tarjeta

`SIM.stream` es no-op en esta copia, así que `enviarChat` nunca termina de «escribir» y no registra la
acción. Se empuja la respuesta a mano y se registra en `app.ACCIONES_VIVAS` (expuesto en `window.app`
para esto). Primero `app.nav("/dashboard/asistente")`.

```js
const preguntar = q => { const r = app.responderVetGPT(q);
  app.CHAT.mensajes.push({ rol: "user", texto: q });
  app.CHAT.mensajes.push({ rol: "assistant", texto: r.texto, escribiendo: false, citas: r.citas, herramienta: null, accion: r.accion, opciones: r.opciones });
  if (r.accion) app.ACCIONES_VIVAS.set(r.accion.id, r.accion);
  app.CHAT.estado = "libre"; app.repintarChat(false); return r.accion; };

// C.1 hueco libre (sin paciente en contexto)
app.CHAT.pacienteId = null; app.CHAT.mensajes = [];
preguntar("Se me liberó un hueco de 30 minutos hoy, ¿a quién le ofrezco?");

// C.2 alergia (necesita paciente en contexto)
app.CHAT.pacienteId = "p-1"; app.CHAT.mensajes = [];
preguntar("¿Qué alergias tiene Luna?");

// C.3 cita
app.CHAT.pacienteId = "p-1"; app.CHAT.mensajes = [];
preguntar("Agendame un control para Luna la próxima semana");
```

Cuidado con el orden de patrones (cita → cartera → hueco → horario): una frase con «hueco» que también
diga «cita» y «semana» cae en la cita, y «abre/abren» cae en horarios. Aprobar: el botón de la tarjeta, o
`document.querySelector('button[data-act="accion-aprobar"]').click()`.

**A mano, en la otra pantalla:** hueco → Comunicaciones, hilo del titular de Tango (el candidato con
refuerzo vencido); alergia con alérgeno escrito y severa → ficha de Luna con la banda roja; alergia en
blanco → toast rojo y la tarjeta sigue editable; cita → Agenda (vista Día, la fecha propuesta) y el aviso
en el hilo de Mariana.

---

## Regresión de los videos ya renderizados

`DemoSaaS` pinta la ficha de Luna (f926–977) y el cockpit (f978+). Stills antes/después del parche en
`out/qa/regresion-maqueta/`: **f990 idéntico** (MD5 `f9e84397…`, el baseline conocido) y **f950 idéntico**
(MD5 `e39a32ed…`: en ese frame la ficha ya está desplazada a la historia y la cabecera no se ve). En los
frames donde la cabecera sí se ve (al entrar a la ficha, f926 en adelante) un render nuevo mostrará el
tercer botón; a 1440 px los tres caben en una fila y la cabecera conserva el alto, así que nada se
desplaza. El mp4 ya entregado no cambia. `ExplainerRAG` no pasa por ninguna vista tocada.

## Deuda que quedó fuera (encargo §D y §E)

- **Barra de autonomía** sin consecuencia: guarda un nivel que nadie lee.
- **«Sugerir»** en la bandeja de WhatsApp gira para siempre (su continuación vive en `SIM.after`).
- **Correo** sin bandeja de enviados: `enviar-informe` por correo sólo cierra y avisa.
- **Notas crédito** que no devuelven stock.
- **`porVencer` fijo en 2** en `SEL.inventario()`.
- **Plantillas de recordatorio** (Agenda y cobranza) son textareas decorativas sin `data-act`.
- **`nuevo-movimiento`, `nueva-compra`, `exportar`, `imprimir`…** siguen siendo toasts honestos.
- **Voseo** en los mensajes al titular que la maqueta ya traía (cartera, hueco, plantillas). El aviso de
  cita nuevo va en tuteo, como manda `../../CLAUDE.md`; unificar el resto es otro encargo.
- **Toasts en la copia demo** no se cierran solos (`SIM.after` es no-op): se acumulan hasta el siguiente
  `render()`. Es el parche demo, no se toca.
