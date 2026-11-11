// @ts-check
import { defineConfig } from 'astro/config';

// SITE and BASE come from the GitHub Pages deploy workflow: the github.io preview needs a base path,
// and once sharonavraham.com is set as the custom domain they become that domain and '/' automatically.
// https://astro.build/config
export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE || '/',
  devToolbar: { enabled: false },
});
