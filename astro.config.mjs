import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://getrefined.github.io',
  base: '/scafell_website/',
  integrations: [sitemap()],
});
