import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '@/consts';
import { withBase } from '@/utils/url';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => +b.data.date - +a.data.date);

  const kbItems = (await getCollection('kb'))
    .sort((a, b) => +b.data.updated - +a.data.updated)
    .slice(0, 20);

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: withBase(`/blog/${post.id}/`),
    })),
    ...kbItems.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary ?? entry.data.title,
      pubDate: entry.data.updated,
      link: withBase(`/kb/${entry.id}/`),
    })),
  ].sort((a, b) => +b.pubDate - +a.pubDate);

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? 'https://example.github.io',
    items,
  });
}
