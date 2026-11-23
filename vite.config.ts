import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The public testnet REST API has no browser CORS headers. Vite forwards reads
// during local development and preview; deployed hosting needs an equivalent proxy.
const proxy = { '/lcd': { target: 'https://api-testnet.qore.host', changeOrigin: true, rewrite: (path: string) => path.replace(/^\/lcd/, '') } };
export default defineConfig({ plugins: [react()], server: { port: 5173, proxy }, preview: { proxy } });
