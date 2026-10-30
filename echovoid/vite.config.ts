import { defineConfig } from 'vite';

// El código vive en src/. `npm run build` deja el juego listo para publicar en esta misma
// carpeta (index.html + assets/), igual que Peak publica beta/index.html.
export default defineConfig({
  root: 'src',
  base: './',
  publicDir: false,
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsDir: 'assets',
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
  server: { host: true },
});
