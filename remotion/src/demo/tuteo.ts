/**
 * DemoSaaS · voseo → tuteo (§4.7, línea roja 6 de CLAUDE.md).
 * La maqueta está escrita en voseo rioplatense; el contenido de Tuvetia es tuteo
 * colombiano. Después de cada render se recorren los nodos de texto visibles del
 * iframe (incluye overlays y toasts) y se aplica este mapa. No toca nombres propios,
 * datos clínicos ni cifras: son reemplazos de frase exacta o de forma verbal voseante.
 */

export const MAPA_TUTEO: ReadonlyArray<readonly [RegExp, string]> = [
  /* Las del encargo (§4.7) */
  [/Revisala, editala y aprobala/g, "Revísala, edítala y apruébala"],
  [/Revisala y aprobala/g, "Revísala y apruébala"],
  [/vos aprobás/g, "tú apruebas"],
  [/Confirmá que revisaste/g, "Confirma que revisaste"],
  [/revisá antes del plan/g, "revisa antes del plan"],
  [/Acordate/g, "Acuérdate"],
  [/me llamás/g, "me llamas"],
  [/Iniciá/g, "Inicia"],
  [/Armá tu tablero/g, "Arma tu tablero"],
  [/Podés/g, "Puedes"],
  [/podés/g, "puedes"],
  [/escribí libre/g, "escribe libre"],
  [/Probá/g, "Prueba"],
  [/Empezá/g, "Empieza"],
  [/Abrí(?![a-záéíóúñ])/g, "Abre"],
  [/Evitá/g, "Evita"],
  [/Conectalo/g, "Conéctalo"],
  [/Preguntale/g, "Pregúntale"],
  [/Seguí hablando del cuadro y volvé a buscar/g, "Sigue hablando del cuadro y vuelve a buscar"],
  /* Vistas del guion: encontradas revisando las pantallas que el video recorre */
  [/revisala con más cuidado/g, "revísala con más cuidado"],
  [/Revisalo antes de enviarlo/g, "Revísalo antes de enviarlo"],
  [/aprobás la nota/g, "apruebas la nota"],
  [/Tenelas en cuenta/g, "Tenlas en cuenta"],
  [/mientras atendés/g, "mientras atiendes"],
  [/¿No tenés cuenta\?/g, "¿No tienes cuenta?"],
  [/Registrate/g, "Regístrate"],
  [/aceptás/g, "aceptas"],
  [/entrás/g, "entras"],
  [/Grabá/g, "Graba"],
  [/grabá/g, "graba"],
  [/Generá/g, "Genera"],
  [/atalo acá y seguís/g, "átalo aquí y sigues"],
  [/Agregá/g, "Agrega"],
  [/agregá/g, "agrega"],
  [/Elegí(?![a-záéíóúñ])/g, "Elige"],
  [/iniciá/g, "inicia"],
  [/Ordená/g, "Ordena"],
  [/apagá/g, "apaga"],
  [/Escribilo acá/g, "Escríbelo aquí"],
  [/escribinos/g, "escríbenos"],
  [/Arrastrá/g, "Arrastra"],
  [/Buscá/g, "Busca"],
  [/Agendá/g, "Agenda"],
  [/agendá/g, "agenda"],
  [/Creá/g, "Crea"],
  [/creá/g, "crea"],
  [/Mirá/g, "Mira"],
  [/Decime/g, "Dime"],
  [/decime/g, "dime"],
  [/Ponete/g, "Ponte"],
  [/avisános/g, "avísanos"],
  [/Escribile/g, "Escríbele"],
  [/escribile/g, "escríbele"],
  /* Lookahead negativo: que «escribí» no muerda «escribía» (imperfecto). */
  [/Escribí(?![a-záéíóúñ])/g, "Escribe"],
  [/escribí(?![a-záéíóúñ])/g, "escribe"],
  [/Contale/g, "Cuéntale"],
  [/Pedile/g, "Pídele"],
  [/pedile/g, "pídele"],
  [/Llevalo/g, "Llévalo"],
  [/Usá/g, "Usa"],
  [/Tocá/g, "Toca"],
  [/Marcá/g, "Marca"],
  [/Anotá/g, "Anota"],
  [/notás/g, "notas"],
  [/querés/g, "quieres"],
  [/tenés/g, "tienes"],
  [/hacés/g, "haces"],
];

function tutear(texto: string): string {
  let out = texto;
  for (const [re, con] of MAPA_TUTEO) {
    re.lastIndex = 0;
    out = out.replace(re, con);
  }
  return out;
}

/** Recorre los nodos de texto visibles (y placeholders) del documento y aplica el mapa. */
export function aplicarTuteo(doc: Document): void {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode(nodo) {
      const padre = nodo.parentElement;
      if (!padre) return NodeFilter.FILTER_REJECT;
      const tag = padre.tagName;
      if (tag === "SCRIPT" || tag === "STYLE") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodos: Text[] = [];
  while (walker.nextNode()) nodos.push(walker.currentNode as Text);
  for (const nodo of nodos) {
    const antes = nodo.nodeValue ?? "";
    const despues = tutear(antes);
    if (despues !== antes) nodo.nodeValue = despues;
  }
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>("[placeholder]"))) {
    const antes = el.getAttribute("placeholder") ?? "";
    const despues = tutear(antes);
    if (despues !== antes) el.setAttribute("placeholder", despues);
  }
  for (const area of Array.from(doc.querySelectorAll("textarea"))) {
    const antes = area.value;
    const despues = tutear(antes);
    if (despues !== antes) area.value = despues;
  }
}
