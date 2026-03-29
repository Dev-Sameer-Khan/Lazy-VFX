import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import path from 'path'

export default defineConfig({
  plugins: [react(), glsl()],
  build: {
    lib: {
      // Point this to your main entry file (create this file in Step 2)
      entry: path.resolve(__dirname, 'src/index.js'), 
      name: 'LazyVFX',
      fileName: (format) => `lazy-vfx.${format}.js`,
    },
    rollupOptions: {
      // Important: Don't bundle these into your library, 
      // the user's project will provide them.
      external: ['react', 'react-dom', 'three', 'leva','zustand', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          three: 'THREE',
          '@react-three/fiber': 'Fiber',
          '@react-three/drei': 'Drei',
          leva: "leva",
          zustand: "zustand"
        },
      },
    },
  },
})