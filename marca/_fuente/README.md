# Fuente de los JPG y SVG de `marca/`

Los JPG de `logo/` y `footer/` no se retocan a mano: se cambia el texto o la medida acá y se vuelven a exportar. Las fuentes se cargan de Google Fonts en el momento de exportar (hace falta internet) y las capturas las hace Microsoft Edge en modo headless (viene con Windows).

```
cd marca/_fuente
npm init -y && npm i sharp opentype.js
node svg.js        # regenera marca/logo/*.svg desde outlines.json
node render.js     # regenera marca/logo/*.jpg y marca/footer/*.jpg
```

- `render.js` — arma cada pieza como una página HTML con `tokens/tuvetia.css`, la captura con Edge al tamaño exacto y la convierte a JPG. Los textos y tamaños de cada pieza están en el objeto `P`.
- `svg.js` — dibuja la chispa y coloca el wordmark ya trazado; escribe todos los SVG del logo.
- `outlines.json` — el wordmark `Tuvetia` (Bricolage Grotesque 700, tracking -.02em) y `BETA` (JetBrains Mono 500) convertidos a trazados SVG. Sólo hay que regenerarlo si cambia la fuente: `outline.js` lo hace a partir de los TTF que descarga Google Fonts (poner los archivos en una carpeta `fonts/` al lado).
- La ruta de Edge está fija en `render.js` (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`); si está en otro lado, se cambia ahí.
