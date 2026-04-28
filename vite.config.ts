import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    // NOTE: Do not expose server-only keys (GEMINI_API_KEY, ANTHROPIC_API_KEY,
    // SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, etc.) via `define` —
    // anything you put here ends up in the client bundle. Only `VITE_*`
    // prefixed env vars are intended for the browser.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
