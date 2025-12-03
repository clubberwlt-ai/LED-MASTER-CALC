import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  // Fix: Use '.' instead of process.cwd() to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Isso substitui process.env.API_KEY no seu código pelo valor da variável de ambiente durante o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});