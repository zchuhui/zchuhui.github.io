import { writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

const OUTPUT = new URL('../src/data/ai-news.json', import.meta.url);
const MAX_ITEMS = Number.parseInt(process.env.AI_NEWS_MAX_ITEMS ?? '36', 10);
const FETCH_TIMEOUT_MS = Number.parseInt(process.env.AI_NEWS_FETCH_TIMEOUT_MS ?? '15000', 10);

const sources = [
  {
    name: 'OpenAI',
    url: 'https://openai.com/news/rss.xml',
    category: '公司动态',
  },
  {
    name: 'Google AI',
    url: 'https://blog.google/innovation-and-ai/technology/ai/rss/',
    category: '公司动态',
  },
  {
    name: 'arXiv cs.AI',
    url: 'https://export.arxiv.org/rss/cs.AI',
    category: '研究论文',
  },
  {
    name: 'arXiv cs.LG',
    url: 'https://export.arxiv.org/rss/cs.LG',
    category: '研究论文',
  },
  {
    name: 'arXiv cs.CL',
    url: 'https://export.arxiv.org/rss/cs.CL',
    category: '研究论文',
  },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '__cdata',
  trimValues: true,
});

const keywordTags = [
  ['模型', ['model', 'gpt', 'claude', 'gemini', 'llama', 'reasoning', '推理']],
  ['Agent', ['agent', 'agents', 'tool use', 'computer use', '智能体']],
  ['产品', ['chatgpt', 'app', 'api', 'platform', 'product', '产品']],
  ['研究', ['paper', 'benchmark', 'dataset', 'training', 'arxiv', 'research', '研究']],
  ['多模态', ['multimodal', 'vision', 'image', 'video', 'audio', 'speech']],
  ['安全', ['safety', 'security', 'jailbreak', 'policy', 'alignment', '安全']],
  ['开源', ['open source', 'open-weight', '开放', '开源']],
];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    return textOf(value.__cdata ?? value['#text'] ?? value._ ?? '');
  }
  return '';
}

function stripHtml(value) {
  return textOf(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(value) {
  const raw = textOf(value);
  const time = raw ? Date.parse(raw) : NaN;
  return Number.isNaN(time) ? new Date().toISOString() : new Date(time).toISOString();
}

function atomLink(entry) {
  const links = asArray(entry.link);
  const alternate = links.find((link) => link?.['@_rel'] === 'alternate' && link?.['@_href']);
  const firstHref = links.find((link) => link?.['@_href']);
  return alternate?.['@_href'] ?? firstHref?.['@_href'] ?? textOf(entry.link);
}

function rssLink(entry) {
  return textOf(entry.link) || textOf(entry.guid);
}

function makeId(sourceName, url, title) {
  const base = `${sourceName}:${url || title}`;
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function pickTags(title, summary) {
  const haystack = `${title} ${summary}`.toLowerCase();
  const tags = [];
  for (const [tag, keywords] of keywordTags) {
    if (keywords.some((keyword) => haystack.includes(keyword))) tags.push(tag);
  }
  return tags.length > 0 ? tags.slice(0, 3) : ['AI'];
}

function normalizeItems(source, parsed) {
  const rssItems = asArray(parsed?.rss?.channel?.item);
  const atomItems = asArray(parsed?.feed?.entry);
  const rawItems = rssItems.length > 0 ? rssItems : atomItems;
  const isAtom = atomItems.length > 0 && rssItems.length === 0;

  return rawItems
    .map((entry) => {
      const title = stripHtml(entry.title);
      const url = isAtom ? atomLink(entry) : rssLink(entry);
      const summary = stripHtml(entry.description ?? entry.summary ?? entry.content ?? entry['content:encoded']);
      const publishedAt = parseDate(entry.pubDate ?? entry.published ?? entry.updated ?? entry.dc?.date);

      if (!title || !url) return null;

      return {
        id: makeId(source.name, url, title),
        title,
        url,
        source: source.name,
        sourceUrl: source.url,
        publishedAt,
        summary: summary.slice(0, 260),
        tags: pickTags(title, summary),
        category: source.category,
      };
    })
    .filter(Boolean);
}

async function fetchFeed(source) {
  const response = await fetch(source.url, {
    headers: {
      'user-agent': 'zchuhui.github.io AI news updater (+https://zchuhui.github.io)',
      accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const xml = await response.text();
  if (!xml.trim()) {
    throw new Error('empty response');
  }

  return normalizeItems(source, parser.parse(xml));
}

const items = [];
const sourceResults = [];
const warnings = [];

for (const source of sources) {
  try {
    const sourceItems = await fetchFeed(source);
    items.push(...sourceItems);
    sourceResults.push({ name: source.name, url: source.url, ok: true, count: sourceItems.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(`${source.name}: ${message}`);
    sourceResults.push({ name: source.name, url: source.url, ok: false, count: 0, error: message });
  }
}

const deduped = new Map();
for (const item of items) {
  if (!deduped.has(item.id)) deduped.set(item.id, item);
}

const sorted = [...deduped.values()]
  .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  .slice(0, MAX_ITEMS);

const payload = {
  generatedAt: new Date().toISOString(),
  items: sorted,
  sources: sourceResults,
  warnings,
};

await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote ${sorted.length} AI news items to ${OUTPUT.pathname}`);
if (warnings.length > 0) {
  console.warn(`Warnings:\n- ${warnings.join('\n- ')}`);
}
