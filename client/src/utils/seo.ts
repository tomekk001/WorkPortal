const DEFAULT_TITLE = 'WorkPortal — znajdź swoją następną pracę';
const DEFAULT_DESCRIPTION = 'Przeglądaj oferty pracy, aplikuj online i zarządzaj rekrutacją na WorkPortal.';

function setMetaTag(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content);
}

export interface SeoTags {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export function setSeoTags({ title, description, url, image }: SeoTags) {
  document.title = title;
  setMetaTag('meta[name="description"]', description);
  setMetaTag('meta[property="og:title"]', title);
  setMetaTag('meta[property="og:description"]', description);
  setMetaTag('meta[property="og:url"]', url);
  setMetaTag('meta[name="twitter:title"]', title);
  setMetaTag('meta[name="twitter:description"]', description);
  if (image) {
    setMetaTag('meta[property="og:image"]', image);
    setMetaTag('meta[name="twitter:image"]', image);
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image');
  }
}

export function resetSeoTags() {
  setSeoTags({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: `${window.location.origin}/`,
  });
  setMetaTag('meta[name="twitter:card"]', 'summary');
}

export function setJsonLd(id: string, data: unknown) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
}

export function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}
