# Estado de la noche del 8-sep-2026 (rama `explainer-rag`, fork `davidjimenez007`) · cerrado el 9-sep a las 17:35

Resumen corto de lo que quedó al despertar. El detalle de cada pieza vive en su `src/<pieza>/NOTAS.md`.

## Piezas entregadas

| Pieza | Commit | mp4 (en `remotion/out/`, fuera de git) | Estado |
|---|---|---|---|
| **DemoVentas** (corregida: hook de David, cámara fija por acto) | `9cc8984` | `demo-ventas-2x.mp4` (2160×3840, 21,8 MB) · `demo-ventas.mp4` (1080×1920, 8,1 MB) · `demo-ventas-web.mp4` (6,8 MB, para enviar) · 50,05 s | Entregada. 13 stills (`out/qa/ventas/`), determinismo f0470 y f0600 en dos procesos. `prompts/demo-ventas.md` reescrito as-built. |
| **DemoPacientes** | `45b5209` | `demo-pacientes-2x.mp4` (75,6 MB) · `demo-pacientes.mp4` (22,1 MB) · `demo-pacientes-web.mp4` (19,2 MB, para enviar) · 50,05 s | Entregada. 13 stills + 2 propios (`out/qa/pacientes/`), determinismo f0800 y f1320 en dos procesos, `/revisar` en verde con el hook a 8 palabras (desviación 10). |
| **DemoAgentico** | `ee93fed` | `demo-agentico-2x.mp4` (28,2 MB) · `demo-agentico.mp4` (9,7 MB) · `demo-agentico-web.mp4` (8,6 MB, para enviar) · 50,05 s | Entregada. 10 stills del encargo + 3 propios + `prueba-bandeja-antes.png` (`out/qa/agentico/`), determinismo f0760 y f1180 en dos procesos, `/revisar` en verde. 14 desviaciones en `src/agentico/NOTAS.md` (la 1.ª: el riel vive en el asistente, no en el tablero). |
| **DemoComunicaciones** | (este commit) | `demo-comunicaciones-2x.mp4` (42,5 MB) · `demo-comunicaciones.mp4` (13,2 MB) · `demo-comunicaciones-web.mp4` (11,3 MB, para enviar) · 50,05 s | Entregada. 8 stills del encargo + 3 propios (`out/qa/comunicaciones/`), determinismo f0500 y f1360 en dos procesos, `/revisar` en verde. 12 desviaciones en `src/comunicaciones/NOTAS.md` (la 2.ª: el replay pone los entrantes sin leer, porque el seed los trae leídos). |

## Bloqueos

(ninguno hasta ahora; si aparece uno, está en el `NOTAS.md` de la pieza bajo «BLOQUEOS - noche del 8-sep»)

## Qué mirar primero al despertar

1. `out/demo-ventas-web.mp4`: la versión con tu hook y sin movimiento de cámara. Lo único chico es el toast
   de importación (17 px, actos 3–4); está anotado en `src/ventas/NOTAS.md` (desviación 15), sin zoom.
2. `out/demo-pacientes-web.mp4`, `out/demo-agentico-web.mp4` y `out/demo-comunicaciones-web.mp4`: las tres
   piezas nuevas, con QA. Lo que más conviene mirar con ojo de producto:
   - Pacientes: el freno de la guarda es el **botón deshabilitado**, no un toast rojo (desviación 2), y las
     dos notas de Luna vuelven a borrador (desviación 1).
   - Agentico: el riel de la clínica vive en el **asistente**, no en el tablero (desviación 1); la cita se
     muestra en la vista Semana (desviación 7); el pie «VetGPT propone — tú apruebas» sale en cada plano.
   - Comunicaciones: el replay pone los entrantes **sin leer** porque el seed los trae leídos (desviación 2);
     el cierre va completo y el acto 3 dura 240 frames (desviación 1); hook de 7 palabras (desviación 3).
3. Tres hooks se acortaron a ≤ 8 palabras por la regla de `guionista` (Pacientes, Comunicaciones; Agentico ya
   cumplía). Si prefieres los del encargo, son un cambio de una línea en cada `guion.ts`.
4. Deuda de maqueta que asomó y no se tocó (en los NOTAS): la leyenda de la tarjeta trata de usted («hasta que
   usted apruebe») a 20 px del pie que tutea; el compositor del asistente no auto-ajusta su altura al precargar;
   la barra de autonomía sigue sin consecuencia.
5. Nota de la noche: la máquina se durmió **dos veces** (02:35→08:12 con el render de Agentico a medias, que
   retomó solo y cerró bien; 08:45→11:04 con el de Comunicaciones, que quedó colgado y hubo que relanzar). Los
   MD5 y los mp4 están verificados, pero el reloj se corrió: se durmió una tercera vez (≈11:20→17:17) con el
   render de Comunicaciones relanzado, y la pieza se cerró a las 17:33 con `scripts/render-despierto.sh`, que
   mantiene la máquina despierta mientras corre un render (petición del proceso, no cambia la configuración
   de energía). Para la próxima noche: lanzar los renders con ese script. Ningún bloqueo de encargo: los cuatro
   entraron enteros.
