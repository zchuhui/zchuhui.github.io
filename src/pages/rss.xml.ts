import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '@/consts';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => +b.data.date - +a.data.date);

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? 'https://example.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  });
}
