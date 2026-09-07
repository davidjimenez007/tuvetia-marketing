/**
 * DemoSaaS · hover-sim / active-sim (§4.2).
 * Duplica del CSS de la copia todas las reglas con :hover / :active reemplazando los
 * pseudos por .hover-sim / .active-sim, y las inyecta al iframe. Las reglas se leen del
 * CSSOM (no se escriben a mano); las que viven en @media conservan su condición.
 */

function recolectar(reglas: CSSRuleList, envolver: (css: string) => string, out: string[]): void {
  for (const regla of Array.from(reglas)) {
    const estilo = regla as CSSStyleRule;
    if (typeof estilo.selectorText === "string") {
      const sel = estilo.selectorText;
      if (sel.includes(":hover") || sel.includes(":active")) {
        const nuevo = sel.replace(/:hover/g, ".hover-sim").replace(/:active\b/g, ".active-sim");
        out.push(envolver(`${nuevo}{${estilo.style.cssText}}`));
      }
    }
    const grupo = regla as CSSMediaRule;
    if (grupo.cssRules && grupo.cssRules.length > 0 && "conditionText" in regla) {
      recolectar(grupo.cssRules, (css) => envolver(`@media ${grupo.conditionText}{${css}}`), out);
    }
  }
}

/** Inyecta (una sola vez) la hoja .hover-sim/.active-sim generada desde el CSS de la app. */
export function inyectarHoverSim(doc: Document): void {
  if (doc.getElementById("hover-sim-css")) return;
  const out: string[] = [];
  for (const hoja of Array.from(doc.styleSheets)) {
    try {
      recolectar(hoja.cssRules, (css) => css, out);
    } catch {
      // hojas de otro origen (Google Fonts) no se pueden leer y no traen :hover propios
    }
  }
  const estilo = doc.createElement("style");
  estilo.id = "hover-sim-css";
  estilo.textContent = out.join("\n");
  doc.head.appendChild(estilo);
}
