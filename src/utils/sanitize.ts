const DISALLOWED_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'IFRAME', 'OBJECT', 'EMBED', 'SVG']);
const EVENT_ATTR_REGEX = /^on/i;

const DANGEROUS_ATTRS = new Set(['href', 'src']);

export function sanitize(html: string): string {
  if (!html.trim()) {
    return '';
  }

  const template = document.createElement('template');
  template.innerHTML = html;

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT, null);
  const toRemove: Element[] = [];

  while (walker.nextNode()) {
    const el = walker.currentNode as Element;
    if (DISALLOWED_TAGS.has(el.tagName)) {
      toRemove.push(el);
      continue;
    }

    const attributes = Array.from(el.attributes);
    for (const attr of attributes) {
      if (EVENT_ATTR_REGEX.test(attr.name)) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (DANGEROUS_ATTRS.has(attr.name.toLowerCase())) {
        const value = (attr.value || '').trim().toLowerCase();
        if (value.startsWith('javascript:') || value.startsWith('data:')) {
          el.removeAttribute(attr.name);
        }
      }
    }
  }

  toRemove.forEach((el) => el.remove());
  return template.innerHTML;
}
