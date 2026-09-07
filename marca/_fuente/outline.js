const opentype = require('opentype.js');
const fs = require('fs');
const F = (process.argv[2] || __dirname) + '/fonts/';
function outline(file, text, size, opts){
  const font = opentype.loadSync(F + file);
  const o = Object.assign({ kerning: true }, opts || {});
  const p = font.getPath(text, 0, 0, size, o);
  const bb = p.getBoundingBox();
  const os2 = font.tables.os2 || {};
  const k = size / font.unitsPerEm;
  return {
    file, text, size, isVariable: !!font.tables.fvar,
    d: p.toPathData(2),
    bbox: { x1: +bb.x1.toFixed(2), y1: +bb.y1.toFixed(2), x2: +bb.x2.toFixed(2), y2: +bb.y2.toFixed(2) },
    advance: +font.getAdvanceWidth(text, size, o).toFixed(2),
    capHeight: os2.sCapHeight ? +(os2.sCapHeight * k).toFixed(2) : null,
    xHeight: os2.sxHeight ? +(os2.sxHeight * k).toFixed(2) : null,
    ascender: +(font.ascender * k).toFixed(2), descender: +(font.descender * k).toFixed(2)
  };
}
const out = {
  wordmark700: outline('bricolage-700.ttf', 'Tuvetia', 100, { letterSpacing: -0.02 }),
  wordmark600: outline('bricolage-600.ttf', 'Tuvetia', 100, { letterSpacing: -0.02 }),
  beta: outline('jetbrainsmono-500.ttf', 'BETA', 100, { letterSpacing: 0.16 })
};
fs.writeFileSync(__dirname + '/outlines.json', JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify({ isVariable: v.isVariable, bbox: v.bbox, advance: v.advance, capHeight: v.capHeight, xHeight: v.xHeight, dLen: v.d.length }));
