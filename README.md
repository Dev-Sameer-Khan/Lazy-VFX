# ☄️ Lazy VFX

_Effortless high-end visual effects for the modern web, built for React & Three.js_

Lazy VFX is a minimal, shader-driven VFX engine designed for modern web apps using React and Three.js. It abstracts away all the math and plumbing for emitters, GPU-accelerated particles, and real-time shaders, so you can stay focused on building cinematic, interactive experiences.

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
```

---

## 🛠️ Usage Example

Add cinematic particles in seconds to any [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) scene:

```jsx
import { VFXParticals, VFXEmitter } from 'lazy-vfx';
// Also import your alphaMap or use a texture

function Experience() {
  return (
    <>
      <VFXParticals
        name="sparks"
        settings={{
          nParticals: 10000,
          intensity: 2,
          renderMode: "billboard",
          fadeAlpha: [0.5, 0.5],
          fadeSize: [0, 0],
          gravity: [0, -10, 0]
        }}
        alphaMap={text}
        geometry={<sphereGeometry />}
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
    </>
  );
}
```
_See `/src/components/Experience.jsx` for a more complete example._

---

## 📁 Project Structure

```
src/
├── components/
│   ├── shaders/         # Custom .glsl shader sources
│   └── vfxs/            # Core VFX engine components:
│       ├── VFXBuilder   # UI Controls via Leva
│       ├── VFXEmitter   # Main emitter logic
│       ├── VFXParticals # Particle system core
│       └── VFXStore     # Central effect state manager
└── Experience.jsx       # 3D scene entry point
```

---

## 🎨 Development

Want to hack on shaders or engine internals?

1. **Clone the repo:**  
   `git clone https://github.com/Dev-Sameer-Khan/Lazy-VFX.git`
2. **Install dependencies:**  
   `pnpm install`
3. **Start dev server:**  
   `pnpm dev`

Contributions and ideas are very welcome!

---

## 📄 License

MIT © [Lazy Coder](https://github.com/Dev-Sameer-Khan)
