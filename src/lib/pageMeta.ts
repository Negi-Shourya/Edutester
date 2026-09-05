// Per-page document title + meta description for public pages (SEO).
// The SPA shell ships one static head (index.html); each public route calls
// this in useEffect so crawlers rendering JS see a unique title/description.
export function setPageMeta(title: string, description?: string): void {
  document.title = title;
  if (!description) return;
  let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }
  el.setAttribute('content', description);
}
