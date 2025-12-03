import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Define process.env globalmente como um objeto vazio para evitar "ReferenceError: process is not defined"
      // em bibliotecas que esperam um ambiente Node.js-like.
      'process.env': {},
    }
  };
});