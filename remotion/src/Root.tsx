import "./index.css";
import { Composition, Folder } from "remotion";
import { MyComposition } from "./Composition";
import { DemoSaaS } from "./demo/DemoSaaS";
import { DURACION, FPS } from "./demo/guion";
import { ExplainerRAG } from "./explainer/ExplainerRAG";
import { DURACION as DURACION_RAG, FPS as FPS_RAG, LIENZO } from "./explainer/guion";
import { fuentesListas } from "./marca/fuentes";
import { DemoPacientes } from "./pacientes/DemoPacientes";
import { DURACION as DURACION_PAC, FPS as FPS_PAC, LIENZO as LIENZO_PAC } from "./pacientes/guion";
import { DemoVentas } from "./ventas/DemoVentas";
import { DURACION as DURACION_VENTAS, FPS as FPS_VENTAS, LIENZO as LIENZO_VENTAS } from "./ventas/guion";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Folder name="Demos">
        <Composition
          id="DemoSaaS"
          component={DemoSaaS}
          durationInFrames={DURACION}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="DemoVentas"
          component={DemoVentas}
          durationInFrames={DURACION_VENTAS}
          fps={FPS_VENTAS}
          width={LIENZO_VENTAS.w}
          height={LIENZO_VENTAS.h}
          calculateMetadata={async () => {
            await fuentesListas();
            return {};
          }}
        />
        <Composition
          id="DemoPacientes"
          component={DemoPacientes}
          durationInFrames={DURACION_PAC}
          fps={FPS_PAC}
          width={LIENZO_PAC.w}
          height={LIENZO_PAC.h}
          calculateMetadata={async () => {
            await fuentesListas();
            return {};
          }}
        />
      </Folder>
      <Folder name="Explainers">
        <Composition
          id="ExplainerRAG"
          component={ExplainerRAG}
          durationInFrames={DURACION_RAG}
          fps={FPS_RAG}
          width={LIENZO.w}
          height={LIENZO.h}
          calculateMetadata={async () => {
            await fuentesListas();
            return {};
          }}
        />
      </Folder>
    </>
  );
};
