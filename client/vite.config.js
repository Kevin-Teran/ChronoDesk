import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Vite configuration object
 * @typedef {Object} ViteConfig
 * @property {Array} plugins - Array of Vite plugins
 * @property {Object} server - Server configuration
 * @property {Object} define - Global variable definitions
 */

/**
 * Vite configuration for React application
 * @type {ViteConfig}
 * 
 * @description Configures the Vite development server with:
 * - React plugin support
 * - Environment variable loading
 * - Proxy setup for API requests
 * - Port configuration from environment variables
 * 
 * Environment variables are loaded from '../.env' file and made available
 * to the client-side code through 'process.env' global definition.
 */
export default defineConfig({
  /**
   * Vite plugins
   * @type {Array}
   * @default [react()]
   */
  plugins: [react()],

  /**
   * Server configuration
   * @type {Object}
   * @property {number} port - Frontend server port (from FRONTEND_PORT or default 3000)
   * @property {Object} proxy - Proxy configuration for API requests
   */
  server: {
    /**
     * Development server port
     * @type {number}
     * @default process.env.FRONTEND_PORT || 3000
     */
    port: parseInt(process.env.FRONTEND_PORT) || 3000,

    /**
     * Proxy configuration for API requests
     * @type {Object}
     * @property {string} '/api' - Proxy target for API requests
     */
    proxy: {
      '/api': `http://localhost:${process.env.BACKEND_PORT || 5001}`,
    },
  },

  /**
   * Global variable definitions
   * @type {Object}
   * @property {Object} 'process.env' - Makes environment variables available client-side
   */
  define: {
    'process.env': process.env, 
  },
});