import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/html/', // to build to Test web change to /TestUI/ :: /html/
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`, // Remove hash from JS filenames
        assetFileNames: `assets/[name].[ext]`, // Remove hash from asset filenames
      },
    },
    outDir: "../html",
  },
});
