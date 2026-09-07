import "./index.css";
import { Composition, Folder } from "remotion";
import { MyComposition } from "./Composition";
import { DemoSaaS } from "./demo/DemoSaaS";
import { DURACION, FPS } from "./demo/guion";

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
    </>
  );
};
