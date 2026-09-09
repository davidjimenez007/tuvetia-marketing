# Estado de la noche del 8-sep-2026 (rama `explainer-rag`, fork `davidjimenez007`)

Resumen corto de lo que quedó al despertar. El detalle de cada pieza vive en su `src/<pieza>/NOTAS.md`.

## Piezas entregadas

| Pieza | Commit | mp4 (en `remotion/out/`, fuera de git) | Estado |
|---|---|---|---|
| **DemoVentas** (corregida: hook de David, cámara fija por acto) | `9cc8984` | `demo-ventas-2x.mp4` (2160×3840, 21,8 MB) · `demo-ventas.mp4` (1080×1920, 8,1 MB) · `demo-ventas-web.mp4` (6,8 MB, para enviar) · 50,05 s | Entregada. 13 stills (`out/qa/ventas/`), determinismo f0470 y f0600 en dos procesos. `prompts/demo-ventas.md` reescrito as-built. |
| **DemoPacientes** | (este commit) | `demo-pacientes-2x.mp4` (75,6 MB) · `demo-pacientes.mp4` (22,1 MB) · `demo-pacientes-web.mp4` (19,2 MB, para enviar) · 50,05 s | Entregada. 13 stills + 2 propios (`out/qa/pacientes/`), determinismo f0800 y f1320 en dos procesos, `/revisar` en verde con el hook a 8 palabras (desviación 10). |
| **DemoAgentico** | | | Sin empezar |
| **DemoComunicaciones** | | | Sin empezar |

## Bloqueos

(ninguno hasta ahora; si aparece uno, está en el `NOTAS.md` de la pieza bajo «BLOQUEOS - noche del 8-sep»)

## Qué mirar primero al despertar

1. `out/demo-ventas-web.mp4`: la versión con tu hook y sin movimiento de cámara. Lo único chico es el toast
   de importación (17 px, actos 3–4); está anotado en `src/ventas/NOTAS.md` (desviación 15), sin zoom.
2. (se completa al cerrar la noche)
