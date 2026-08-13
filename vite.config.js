import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        login: resolve(import.meta.dirname, 'index.html'),
        register: resolve(import.meta.dirname, 'register.html'),
        createLink: resolve(import.meta.dirname, 'create-link.html'),
        links: resolve(import.meta.dirname, 'links.html'),
        linkStatistics: resolve(import.meta.dirname, 'link-statistics.html'),
      },
    },
  },
});
