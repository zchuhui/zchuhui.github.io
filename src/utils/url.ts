// 把站内路径拼上 base（GitHub Pages 子路径部署时必需）
const BASE = import.meta.env.BASE_URL; // 例如 '/' 或 '/myhome/'

export function withBase(path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith('mailto:')) return path;
  const b = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}` || '/';
}

// 判断当前路径是否激活（用于导航高亮）
export function isActive(current: string, href: string): boolean {
  const norm = (s: string) => {
    const stripped = s.replace(BASE, '/').replace(/\/+$/, '');
    return stripped === '' ? '/' : stripped;
  };
  const c = norm(current);
  const h = norm(href);
  return h === '/' ? c === '/' : c === h || c.startsWith(h + '/');
}
