---
name: remotion-tuvetia
description: Convenciones de video-as-code para composiciones Remotion de Tuvetia — tipografía, movimiento, uso de color. Usar siempre que se cree o edite una composición de video.
---

# Remotion — convenciones Tuvetia

## Tipografía

- Display/títulos: **Archivo**
- Datos, timestamps, labels técnicos: **JetBrains Mono**
- Prohibido: Bricolage Grotesque (marca vieja), fuentes por defecto.

## Color

- Regla madre (Fase 4): **el producto es lo único con color y movimiento.** Fondo sobrio, tipografía grande, y la pantalla del producto es la protagonista cromática.
- Prohibido: coral #f0764e (marca vieja).
- El negro se reserva para los objetos de VetGPT (notch/pill/barra) — el negro solo aparece cuando es VetGPT.

## Motor de movimiento

- **Cada elemento se anima individualmente**, con su propio timing — nunca bloques enteros entrando como unidad (nada de rotateX de cajas, deal-ins, barridos de sección completa).
- Convención de variables por elemento: `--i` orden · `--y` distancia · `--d` duración · `--gap` separación entre elementos.
- En Remotion: cada elemento recibe su `delay = i * gap`, interpolación con spring suave; los textos aparecen con vida propia, fluidos, en cascada — no todo el movimiento de una.
- **Regla técnica dura: ningún contenedor con `overflow: hidden` alrededor de algo que se traslada** (recorta la animación a medias: hueco arriba, texto decapitado abajo).

## Formatos base

- `Reel` 1080×1920 30fps — subtítulos grandes quemados, safe zones IG (evitar 250px inferiores).
- `DemoClip` — screen recording del producto centrado, chrome mínimo, cursor visible, zooms a la acción.
- `DatoAnimado` — un número creciendo (contador) + una frase. Para hooks de datos ("26 horas al mes").
- `CarruselVideo` — carrusel exportado como video para reels.

## Subtítulos

Siempre. Palabra a palabra o frase corta, sincronizados, JetBrains Mono o Archivo semibold, alto contraste. El 80% ve sin audio.
