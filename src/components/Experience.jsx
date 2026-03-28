import { Environment, OrbitControls, Stats, useTexture } from "@react-three/drei";
import VFXParticals from "./vfxs/VFXParticals";
import VFXEmitter from "./vfxs/VFXEmitter";
import { useRef } from "react";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export const Experience = () => {
  const emitterRed = useRef();
  const emitterBlue = useRef();

  const text = useTexture("https://static.thenounproject.com/png/4312916-200.png")

  return (
    <>
      <Stats />
      <OrbitControls enablePan={false} />
      <Environment preset="sunset" />
      <VFXParticals
        name="sparks"
        settings={{ nParticals: 10000, intensity: 2, renderMode: "billboard", fadeAlpha:[0.5,0.5], fadeSize:[0,0], gravity: [0,-10,0]}}
        alphaMap={text}
        geometry={<sphereGeometry/>}
      />
      <VFXEmitter
        ref={emitterRed}
        nParticals={5000}
        debug
        emitter="sparks"
        settings={{
          colorStart: ["red", "white"],
          size: [0.1, 0.5],
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          directionMin: [-0.5, 0, -0.5],
          directionMax: [0.5, 1, 0.5],
          speed: [1, 5],
          loop: true,
        }}
      />
      <VFXEmitter
        ref={emitterBlue}
        nParticals={5000}
        emitter="sparks"
        settings={{
          colorStart: ["blue", "white"],
          size: [0.01, 0.1],
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          directionMin: [-0.5, 0, -0.5],
          directionMax: [0.5, 1, 0.5],
          speed: [1, 5],
          loop: true,
        }}
      />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>
    </>
  );
};
