import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.FRONTEND_PORT),
      strictPort: true,
      proxy: {
        [env.API_BASE_PATH]: {
          target: `http://localhost:${env.BACKEND_PORT}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${env.API_BASE_PATH}`), '')
        }
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(env.NODE_ENV)
    }
  };
});