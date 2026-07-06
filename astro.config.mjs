// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub 用户主页仓库 zchuhui.github.io：
//   site 指向根域，base 必须为 '/'，否则静态资源和站内链接会继续带 /myhome/ 前缀。
const SITE = 'https://zchuhui.github.io';
const BASE = '/';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'night-owl',
      wrap: true,
    },
  },
});
