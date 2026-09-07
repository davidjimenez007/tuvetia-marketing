# Identidad visual — Tuvetia

Sacada del sistema real de la app (rediseño del 2-sep-2026, `tuvetia-app-rediseno-full.html`). Nada acá es inventado: son los mismos tokens que pintan el producto. Cuando cambie la app, cambia esto.

## La paleta

| Rol | Token | Hex | Para qué |
|---|---|---|---|
| Fondo y centro | `--tv-white` | `#ffffff` | Todo empieza en blanco. Es la superficie por defecto. |
| Nieve | `--tv-snow` | `#f5f8f7` | Paneles, barra lateral, superficies un paso atrás. |
| Grafito | `--tv-graphite` | `#0c1613` | Texto principal en claro. Fondo **sólo cuando es Athos** (notch, cockpit) o en tema oscuro. |
| Menta 500 | `--tv-mint-500` | `#12856a` | **Acción.** Botones, glifo del logo, estado activo. Siempre con blanco encima. |
| Menta 700 | `--tv-mint-700` | `#0b5847` | El menta que va **en texto** sobre blanco (8.4:1 de contraste; el 500 da 4.58:1). |
| Menta 300 | `--tv-mint-300` | `#7ed0ba` | El acento sobre grafito. En oscuro, el logo y los botones usan éste. |
| Menta 100 | `--tv-mint-100` | `#e6f2ee` | Fondo suave de estado activo, chips, avisos OK. |
| Rojo 500 | `--tv-red-500` | `#c03a2e` | Peligro: alergia severa, factura vencida. |
| Ámbar 700 | `--tv-amber-700` | `#8a5a0b` | Advertencia. |
| WhatsApp | `--tv-whatsapp` | `#25D366` | Sólo para el logo de WhatsApp. No es un color de marca. |

Regla madre: **el blanco es el fondo, el menta es la acción, el grafito es Athos.** El menta nunca decora superficies grandes; aparece donde hay algo que hacer. El único bloque menta grande que existe es el CTA a WhatsApp, porque el CTA *es* la acción.

Los tokens completos (claro y oscuro, estados, gráficas, radios, sombras) están en `tokens/tuvetia.css`, `tokens/tuvetia.tokens.json` y `tokens/tuvetia.ts` (para Remotion).

## Tipografía

| Uso | Fuente | Peso | Detalle |
|---|---|---|---|
| Titulares y wordmark | **Archivo** | 600 / 700 | Tracking `-.015em` en títulos, `-.022em` en titulares grandes, `-.02em` en el wordmark. |
| Cuerpo y UI | **Inter Tight** | 400–700 | 15px / 1.55 en la app. |
| Microrrótulos, datos, contadores | **JetBrains Mono** | 500 | Mayúsculas, tracking `.15em`. Es la firma tipográfica: `BUSCAMOS 10 VETERINARIOS · 0/10` va así. |

Las tres se cargan de Google Fonts con una sola línea (está en `tokens/tuvetia.tokens.json`).

> **Decidido el 2-sep-2026: manda la skill `remotion-tuvetia`.** Display es **Archivo**; Bricolage Grotesque es marca vieja y está prohibida. Los tokens de esta carpeta (`tokens/tuvetia.css`, `tokens/tuvetia.tokens.json`, `tokens/tuvetia.ts`) ya están corregidos. Pendiente: la app todavía usa Bricolage en su `globals.css` y hay que alinearla; el wordmark de `logo/` y los JPG de `footer/` se generaron con Bricolage y hay que regenerarlos (ver `_fuente/README.md`).

## El logo

El glifo es la **chispa**: un disco lleno con un ojo recortado arriba a la derecha. El wordmark es `Tuvetia` en display 700 con tracking `-.02em`, y en los SVG está convertido a trazados (no depende de tener la fuente instalada). **Ojo:** los trazados actuales se generaron con Bricolage Grotesque, la fuente vieja; falta decidir si el wordmark pasa a Archivo y regenerarlo.

| Archivo | Qué es |
|---|---|
| `logo/glifo.svg` · `glifo-oscuro.svg` · `glifo-blanco.svg` | La chispa sola: menta 500 · menta 300 (sobre grafito) · blanco (sobre menta o foto). |
| `logo/logo-horizontal.svg` · `-oscuro` · `-blanco` · `-grafito` | Glifo + wordmark. Claro es la versión por defecto. |
| `logo/logo-vertical.svg` · `-blanco` | Apilado, para cuadrados y cierres. |
| `logo/wordmark.svg` | Sólo la palabra. |
| `logo/avatar.svg` · `avatar-claro.svg` | Foto de perfil (IG, TikTok, LinkedIn): chispa blanca sobre menta, o menta sobre blanco. |
| `logo/*.jpg` | Los mismos, ya renderizados: horizontal claro / oscuro / menta y los dos avatares a 1080×1080. |

Cómo se usa: glifo en menta 500 y palabra en grafito sobre blanco. Sobre grafito, glifo en menta 300 y palabra en nieve. Sobre menta o sobre foto, todo blanco. Nunca el glifo en negro sobre blanco salvo en la versión monocroma. Nunca estirar, nunca cambiar el tracking, nunca poner el wordmark en otra fuente. El `BETA` va en mono 9px, tracking `.16em`, gris: es microtexto, no un chip.

## El footer (pie de pieza)

Todo contenido cierra en WhatsApp, y el pie es donde vive eso.

| Archivo | Qué es | Medida |
|---|---|---|
| `footer/footer-carrusel-slide.jpg` | Slide intermedio de carrusel con el pie puesto: logo a la izquierda, handle en mono a la derecha, filete arriba. | 1080×1350 |
| `footer/footer-carrusel-tira.jpg` | Sólo la tira del pie, para pegar en cualquier slide. | 1080×150 |
| `footer/footer-carrusel-cta.jpg` | Último slide: la banda menta con el logo de WhatsApp y "Escríbenos al WhatsApp". | 1080×1350 |
| `footer/cierre-reel.jpg` | El cierre estándar de todos los reels (el que piden los guiones): "¿Eres veterinario?" + botón de WhatsApp. Deja libres los 250px de abajo (safe zone de IG). | 1080×1920 |
| `footer/footer-web-claro.jpg` · `-oscuro.jpg` | Pie de la landing: logo, tesis, columnas y el botón de WhatsApp. | 1600×480 |

Los JPG salen de páginas HTML que usan `tokens/tuvetia.css` y las fuentes de Google. El generador está en `_fuente/` (ver su README): si hace falta cambiar un texto o una medida, se cambia ahí y se vuelve a exportar; no se retoca el JPG.

**Placeholders que hay que reemplazar:** el handle `@tuvetia` y la línea "WhatsApp directo · link en la bio" están así porque el repo no tiene ni el handle real ni el número. Cuando existan, van en mono en el mismo lugar.

## Lo que no se hace

- Coral `#f0764e` y cualquier color de la marca vieja. No existen.
- Menta como fondo decorativo de slides enteros. Sólo el bloque CTA.
- Negro que no sea Athos.
- Sombras duras, degradados, brillos. Las dos sombras del sistema son `sm` y `md`, y son suaves.
- Logos de terceros en color de marca: Google, Microsoft y WhatsApp van con sus colores oficiales, siempre sobre fondo claro.
