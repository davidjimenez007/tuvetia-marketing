/**
 * DemoSaaS · el vivo de la grabación (toma 2.3–2.5): transcripción palabra a palabra,
 * notas, sugerencias, alerta, cronómetro y fases. Todo es función pura del frame —
 * la app nunca corre sus temporizadores (SIM está en no-op en la copia parchada).
 */
import { GRABACION, NOTAS_VIVO, SUGERENCIAS_VIVO } from "./guion";
import type { AppTuvetia } from "./guion";

interface LineaProgramada {
  palabras: string[];
  /** frame en que empieza a caer la primera palabra */
  t0: number;
  /** frame en que la línea queda completa (pasa a estable) */
  t1: number;
}

/** Programa las líneas del guion: cada palabra cae cada `framesPorPalabra` frames,
 *  con `pausaLineas` frames entre línea y línea. */
export function programarLineas(guion: string[]): LineaProgramada[] {
  const { inicioTexto, framesPorPalabra, pausaLineas } = GRABACION;
  const lineas: LineaProgramada[] = [];
  let t = inicioTexto;
  for (const linea of guion) {
    const palabras = linea.split(" ");
    const t1 = t + palabras.length * framesPorPalabra;
    lineas.push({ palabras, t0: t, t1 });
    t = t1 + pausaLineas;
  }
  return lineas;
}

/** Frame en que la línea `n` (1-based) queda completa. */
export function finDeLinea(guion: string[], n: number): number {
  const lineas = programarLineas(guion);
  return lineas[n - 1].t1;
}

/** Aplica a VIVO el estado exacto del frame. Sólo actúa desde GRABACION.inicio;
 *  antes, VIVO quedó en reposo por el reset del replay. */
export function aplicarVivo(app: AppTuvetia, frame: number, idConsulta: string | null): void {
  const G = GRABACION;
  if (frame < G.inicio || !idConsulta) return;

  const VIVO = app.VIVO;
  const guion = app.GUION_POR_DEFECTO;
  const lineas = programarLineas(guion);

  /* Fase */
  const fase =
    frame < G.terminar
      ? "grabando"
      : frame < G.finSubiendo
        ? "subiendo"
        : frame < G.finTranscribiendo
          ? "transcribiendo"
          : "terminada";

  /* Transcripción: líneas completas → estable; línea en curso → provisional. */
  const completas: string[] = [];
  let provisional = "";
  let idx = 0;
  for (const l of lineas) {
    if (frame >= l.t1) {
      completas.push(l.palabras.join(" "));
      idx++;
    } else if (frame >= l.t0) {
      const k = Math.min(
        l.palabras.length,
        Math.floor((frame - l.t0) / G.framesPorPalabra) + 1,
      );
      provisional = l.palabras.slice(0, k).join(" ");
      idx++;
      break;
    } else {
      break;
    }
  }

  const finL5 = lineas[4].t1;
  const hayNotas = frame >= finL5;
  const haySugerencias = frame >= G.sugerencias;

  Object.assign(VIVO, {
    fase,
    consultaId: idConsulta,
    pacienteNombre: "Luna",
    pausada: false,
    guion,
    idx,
    estable: completas.join(" "),
    provisional: fase === "grabando" ? provisional : "",
    notas: hayNotas ? NOTAS_VIVO : "",
    sugerencias: haySugerencias ? SUGERENCIAS_VIVO : "",
    alergias: ["Penicilina"],
    alerta: haySugerencias && frame < G.tabSugerencias,
    /* Al activarse el modo fantasma se pasa directo a la Transcripción: el texto se ve
       cayendo en vivo a pantalla ancha (pedido de la revisión del 3-sep). */
    tabCockpit: frame >= G.tabSugerencias ? "sugerencias" : "transcripcion",
    pensando: fase === "grabando" && !haySugerencias,
    llamadas: haySugerencias ? 2 : hayNotas ? 1 : 0,
    techo: 12,
    /* El notch se abre un momento para mostrar la transcripción en miniatura (§cambio 1
       de la pasada 3): «Athos escucha en modo fantasma» se dice sobre ella. */
    panelAbierto: frame >= G.panelAbre && frame < G.panelCierra,
    tab: "transcripcion",
    segundos: segundosDeGrabacion(frame),
    arrastre: { x: 0, y: 0 },
  });
}

/** Cronómetro: arranca en 05:00 (una consulta ya avanzada, no 0:02) y corre a 2×
 *  — el video comprime el tiempo y el reloj lo acompaña. Congelado al terminar. */
export function segundosDeGrabacion(frame: number): number {
  const fin = Math.min(frame, GRABACION.terminar);
  return 300 + Math.max(0, Math.floor((fin - GRABACION.inicio) / 15));
}
