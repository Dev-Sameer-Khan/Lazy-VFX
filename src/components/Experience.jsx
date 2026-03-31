import {
  Environment,
  OrbitControls,
  Stats,
  useTexture,
} from "@react-three/drei";
import VFXParticles from "./vfxs/VFXParticles";
import VFXEmitter from "./vfxs/VFXEmitter";
import { useRef } from "react";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export const Experience = () => {
  const emitterRed = useRef();
  const emitterBlue = useRef();

  const text = useTexture(
    "https://static.thenounproject.com/png/4312916-200.png",
  );

  return (
    <>
      <Stats />
      <OrbitControls enablePan={false} />
      <Environment preset="sunset" />

      {/* Step 1: Define your particle system */}
      <VFXParticles
        name="sparks" // A unique identifier for this particle system
        settings={{
          nParticals: 10000, // Maximum number of particles to allocate
          intensity: 2, // Brightness multiplier
          renderMode: "billboard", // "billboard" or "mesh" or "stretchBillboard"
          fadeAlpha: [0.5, 0.5], // Opacity fade in/out settings
          fadeSize: [0, 0], // Size fade in/out settings
          gravity: [0, -20, 0], // Apply gravity (x, y, z)
        }}
        alphaMap={text}
        // geometry={<sphereGeometry />}
      />

      {/* Step 2: Define your emitter */}
      <VFXEmitter
        debug // Show debug visualization
        emitter="sparks" // Target the particle system by name
        settings={{
          duration: 4,  // Emission cycle duration in seconds
          delay: 0, // Time delay before starting emission
          nbParticles: 10000, // Number of particles to emit per cycle
          spawnMode: "time", // Emission mode: 'time' or 'burst'
          loop: true, // Continuously emit particles (only if `spawnMode` is 'time')

           // Position range (min/max)
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],

          // Rotation range (min/max)
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
           // Rotation speed range (min/max)
          rotationSpeedMin: [0, 0, 0],
          rotationSpeedMax: [0, 0, 0],

           // Particle lifetime range [min, max]
          particlesLifetime: [0.1, 5],

          // Particle speed range [min, max]
          speed: [1, 10],

          // Direction range (min/max)
          directionMin: [-0.5, 0, -0.5],
          directionMax: [0.5, 1, 0.5],
 
          // Color at start - an array of strings for random selection
          colorStart: ["#ffe500", "#ffe500"],

           // Color at end - an array of strings for random selection
          colorEnd: ["#ffe500", "#ffffff"],

          // Particle size range [min, max]
          size: [0.1, 0.5],
        }}
      />
      <EffectComposer>
        <Bloom intensity={1} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>
    </>
  );
};
