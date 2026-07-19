import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: 本番ドメインが決まったら site を差し替える（sitemap / canonical に使われます）
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [sitemap()],
});
