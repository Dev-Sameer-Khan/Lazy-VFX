# ☄️ Lazy VFX

*Effortless high-end visual effects for the modern web, built for React & Three.js*

Lazy VFX is a minimal, shader-driven VFX engine designed for modern web apps using React and Three.js. It abstracts away all the math and plumbing for emitters, GPU-accelerated particles, and real-time shaders, so you can stay focused on building cinematic, interactive experiences.

[Live demo](https://lazy-vfx.vercel.app/demo) - [Fireworks demo](https://fireworks-five-sigma.vercel.app/) - [Wizard Game demo](https://wizard-game-sable.vercel.app/)

---

## ✨ Features

- **Modular Emitters** &mdash; Create and control particle sources with flexible settings using `<VFXEmitter>`.
- **Custom GLSL Shaders** &mdash; GPU-accelerated with built-in vertex & fragment shaders, easily extensible for custom magic.
- **Centralized State** &mdash; Driven by a single VFXStore for consistent, live-reloadable scene effects and controls.
- **Fast Tooling** &mdash; Zero-config Vite setup, instant HMR, rapid production deployments.
- **Leva Controls** &mdash; Out-of-the-box UI for tuning and exporting effects.

---

## 🚀 Quick Install

Use your favorite package manager:

```bash
# With pnpm
pnpm add lazy-vfx

# Or npm
npm install lazy-vfx

# Or yarn
yarn add lazy-vfx
```

---

## 🛠️ Usage Example

**Lazy VFX uses a two-component system:**

- **VFXParticles:** Defines the particle system and its rendering properties
- **VFXEmitter:** Controls how and when particles are emitted into the scene

Add cinematic particles in seconds to any [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) scene:

```jsx
import { VFXParticals, VFXEmitter } from 'lazy-vfx';
import {
  Environment,
  OrbitControls,
  Stats,
  useTexture,
} from "@react-three/drei";


// Also import your alphaMap or use a texture

function Experience() {
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
    </>
  );
}
```

---

## Custom Geometry Example

You can use custom geometries for your particles:

```jsx
import { useGLTF } from '@react-three/drei';

const CustomParticles = () => {
  // Load the GLTF model. Make sure the path to your .glb file is correct.
  const { nodes } = useGLTF('/models/sword.glb');

  return (
    <>
      <VFXParticles
        name="swords"
        geometry={nodes?.Sword?.geometry ? <primitive object={nodes.Sword.geometry} /> : null}
        settings={{
          nbParticles: 1000,
          renderMode: "mesh",
          intensity: 2,
        }}
      />

      <VFXEmitter
        emitter="swords"
        settings={{
          spawnMode: "burst",
          nbParticles: 100,
          // Add any other emitter settings as needed
        }}
      />
    </>
  );
};
```

**Note:**  

- Ensure the GLTF file at `/models/sword.glb` has a node named `Sword`.
- If your model's node hierarchy is different, adjust `nodes.Sword.geometry` accordingly.

## API Reference

### VFXParticles Component


| Property | Type          | Description                                      |
| -------- | ------------- | ------------------------------------------------ |
| name     | string        | Unique identifier for this particle system       |
| settings | object        | Configuration options for particles              |
| alphaMap | THREE.Texture | Optional texture for particle alpha/transparency |
| geometry | ReactElement  | Optional custom geometry for particles           |


#### VFXParticles Settings


| Setting      | Type                     | Default          | Description                              |
| ------------ | ------------------------ | ---------------- | ---------------------------------------- |
| nbParticles  | number                   | 1000             | Maximum number of particles              |
| intensity    | number                   | 1                | Brightness multiplier                    |
| renderMode   | 'billboard'              | 'mesh'           | 'stretchBillboard'                       |
| fadeSize     | [number, number]         | [0.1, 0.9]       | Size fade in/out range (0-1 of lifetime) |
| fadeAlpha    | [number, number]         | [0, 1.0]         | Opacity fade in/out range                |
| gravity      | [number, number, number] | [0, 0, 0]        | Gravity force applied to particles       |
| blendingMode | THREE.Blending           | AdditiveBlending | How particles blend with the scene       |


---

### VFXEmitter Component


| Property | Type    | Description                                 |
| -------- | ------- | ------------------------------------------- |
| emitter  | string  | Name of the target particle system          |
| settings | object  | Configuration options for emission behavior |
| debug    | boolean | Show Leva controls to adjust settings       |


#### VFXEmitter Settings


| Setting           | Type                     | Default            | Description                           |
| ----------------- | ------------------------ | ------------------ | ------------------------------------- |
| loop              | boolean                  | true               | Continuously emit particles           |
| duration          | number                   | 1                  | Emission cycle duration in seconds    |
| nbParticles       | number                   | 100                | Number of particles to emit per cycle |
| spawnMode         | 'time'                   | 'burst'            | 'time'                                |
| delay             | number                   | 0                  | Time delay before starting emission   |
| particlesLifetime | [number, number]         | [0.1, 1]           | Particle lifetime range [min, max]    |
| startPositionMin  | [number, number, number] | [-0.1, -0.1, -0.1] | Minimum start position                |
| startPositionMax  | [number, number, number] | [0.1, 0.1, 0.1]    | Maximum start position                |
| startRotationMin  | [number, number, number] | [0, 0, 0]          | Minimum start rotation                |
| startRotationMax  | [number, number, number] | [0, 0, 0]          | Maximum start rotation                |
| rotationSpeedMin  | [number, number, number] | [0, 0, 0]          | Minimum rotation speed                |
| rotationSpeedMax  | [number, number, number] | [0, 0, 0]          | Maximum rotation speed                |
| directionMin      | [number, number, number] | [-1, 0, -1]        | Minimum emission direction            |
| directionMax      | [number, number, number] | [1, 1, 1]          | Maximum emission direction            |
| size              | [number, number]         | [0.01, 0.25]       | Particle size range [min, max]        |
| speed             | [number, number]         | [1, 12]            | Particle speed range [min, max]       |
| colorStart        | string[]                 | ['white']          | Colors at start (randomly selected)   |
| colorEnd          | string[]                 | ['white']          | Colors at end (randomly selected)     |


---

## 📄 License

MIT © [Dev-Sameerkhan](https://github.com/Dev-Sameer-Khan)