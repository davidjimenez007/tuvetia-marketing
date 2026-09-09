# Estado de la noche del 8-sep-2026 (rama `explainer-rag`, fork `davidjimenez007`)

Resumen corto de lo que quedó al despertar. El detalle de cada pieza vive en su `src/<pieza>/NOTAS.md`.

## Piezas entregadas

| Pieza | Commit | mp4 (en `remotion/out/`, fuera de git) | Estado |
|---|---|---|---|
| **DemoVentas** (corregida: hook de David, cámara fija por acto) | `9cc8984` | `demo-ventas-2x.mp4` (2160×3840, 21,8 MB) · `demo-ventas.mp4` (1080×1920, 8,1 MB) · `demo-ventas-web.mp4` (6,8 MB, para enviar) · 50,05 s | Entregada. 13 stills (`out/qa/ventas/`), determinismo f0470 y f0600 en dos procesos. `prompts/demo-ventas.md` reescrito as-built. |
| **DemoPacientes** | `45b5209` | `demo-pacientes-2x.mp4` (75,6 MB) · `demo-pacientes.mp4` (22,1 MB) · `demo-pacientes-web.mp4` (19,2 MB, para enviar) · 50,05 s | Entregada. 13 stills + 2 propios (`out/qa/pacientes/`), determinismo f0800 y f1320 en dos procesos, `/revisar` en verde con el hook a 8 palabras (desviación 10). |
| **DemoAgentico** | (este commit) | `demo-agentico-2x.mp4` (28,2 MB) · `demo-agentico.mp4` (9,7 MB) · `demo-agentico-web.mp4` (8,6 MB, para enviar) · 50,05 s | Entregada. 10 stills del encargo + 3 propios + `prueba-bandeja-antes.png` (`out/qa/agentico/`), determinismo f0760 y f1180 en dos procesos, `/revisar` en verde. 14 desviaciones en `src/agentico/NOTAS.md` (la 1.ª: el riel vive en el asistente, no en el tablero). |
| **DemoComunicaciones** | (pendiente) | | Planificada y medida (`scripts/medir-pt-comunicaciones.mjs`); el código está escrito y entra en el siguiente commit con sus stills. |

## Bloqueos

(ninguno hasta ahora; si aparece uno, está en el `NOTAS.md` de la pieza bajo «BLOQUEOS - noche del 8-sep»)

## Qué mirar primero al despertar

1. `out/demo-ventas-web.mp4`: la versión con tu hook y sin movimiento de cámara. Lo único chico es el toast
   de importación (17 px, actos 3–4); está anotado en `src/ventas/NOTAS.md` (desviación 15), sin zoom.
2. `out/demo-agentico-web.mp4` y `out/demo-pacientes-web.mp4`: las dos piezas nuevas, ya con QA. Lo que más
   conviene mirar con ojo de producto: en Agentico el riel de la clínica vive en el asistente (no en el
   tablero: desviación 1) y la cita se muestra en la vista Semana (desviación 7); en Pacientes el freno de la
   guarda es el botón deshabilitado, no un toast (desviación 2).
3. Nota de la noche: la máquina se durmió de 02:35 a 08:12 con el render de Agentico a medias; el proceso
   retomó solo y cerró bien (los MD5 y los mp4 están verificados), pero el reloj de la noche se corrió.
