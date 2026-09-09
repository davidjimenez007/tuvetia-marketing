/**
 * Pieza · tecleo por frame (§2.4). Un input o textarea se corta por caracteres (no pasa por
 * bloquesRicos); un bloque rico se corta por palabras y sólo en cortes seguros: nunca un `[1]` a
 * medias, nunca un `**` o un `*` sin cerrar, nunca un marcador de viñeta suelto (bloquesRicos exige
 * espacio después del marcador y pintaría un guion como párrafo).
 * Funciones puras; lib es2015: sin matchAll/replaceAll/Array.includes/flat.
 */

const MARCADOR_SUELTO = /^(?:[-•*]|\d+\.)$/;

const cuenta = (s: string, re: RegExp): number => (s.match(re) || []).length;

const avance = (frame: number, f0: number, f1: number): number =>
  Math.max(0, Math.min(1, (frame - f0) / (f1 - f0)));

export function cortarPorCaracteres(texto: string, frame: number, f0: number, f1: number): string {
  if (frame < f0) return "";
  if (frame >= f1) return texto;
  const n = Math.round(avance(frame, f0, f1) * texto.length);
  return texto.slice(0, n);
}

/** Un prefijo vale si no rompe ningún marcador. */
export function corteSeguro(prefijo: string, ultimaPalabra: string): boolean {
  if (MARCADOR_SUELTO.test(ultimaPalabra)) return false;
  if (cuenta(prefijo, /\*\*/g) % 2 !== 0) return false;
  if (cuenta(prefijo.replace(/\*\*/g, ""), /\*/g) % 2 !== 0) return false;
  return cuenta(prefijo, /\[/g) === cuenta(prefijo, /\]/g);
}

/** Palabras del texto (sin separadores). */
export function palabrasDe(texto: string): string[] {
  return texto.split(/\s+/).filter((p) => p.length > 0);
}

/** Prefijo con las primeras `k` palabras y el separador que sigue a la última. */
function prefijoConPalabras(tokens: string[], k: number): { prefijo: string; ultima: string } {
  let vistas = 0;
  let fin = 0;
  let ultima = "";
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (i % 2 === 0) {
      if (t.length === 0) continue;
      vistas++;
      ultima = t;
      fin = i + 1;
      if (vistas === k) {
        if (i + 1 < tokens.length) fin = i + 2;
        break;
      }
    }
  }
  return { prefijo: tokens.slice(0, fin).join(""), ultima };
}

export function cortarPorPalabras(texto: string, frame: number, f0: number, f1: number): string {
  if (frame < f0) return "";
  if (frame >= f1) return texto;
  /* split con grupo de captura: [palabra, sep, palabra, sep, …]; el primer token puede ser "". */
  const tokens = texto.split(/(\s+)/);
  const total = palabrasDe(texto).length;
  let k = Math.floor(avance(frame, f0, f1) * total);
  while (k > 0) {
    const { prefijo, ultima } = prefijoConPalabras(tokens, k);
    if (corteSeguro(prefijo, ultima)) return prefijo;
    k--;
  }
  return "";
}
