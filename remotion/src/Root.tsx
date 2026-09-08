import "./index.css";
import { Composition, Folder } from "remotion";
import { MyComposition } from "./Composition";
import { DemoSaaS } from "./demo/DemoSaaS";
import { DURACION, FPS } from "./demo/guion";
import { ExplainerRAG } from "./explainer/ExplainerRAG";
import { DURACION as DURACION_RAG, FPS as FPS_RAG, LIENZO } from "./explainer/guion";
import { fuentesListas } from "./marca/fuentes";

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
