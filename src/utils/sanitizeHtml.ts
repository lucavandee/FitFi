import DOMPurify from 'dompurify';

/**
 * Defense-in-depth HTML sanitization for any value that ends up inside
 * dangerouslySetInnerHTML. Even when the upstream renderer already escapes
 * input (e.g. mdLite, renderMarkdown), running through DOMPurify guarantees
 * that no <script>, on*= handler, javascript: URL, or other XSS payload can
 * reach the DOM if the renderer regresses or a new tag is whitelisted.
 */

const RICH_TEXT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'a',
    'br',
    'em',
    'strong',
    'b',
    'i',
    'p',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'style'],
  KEEP_CONTENT: true,
};

/**
 * Sanitize HTML produced by an internal renderer for safe use inside
 * dangerouslySetInnerHTML. Strips any tag/attr that is not on the rich-text
 * allowlist and forces external links to open with rel="noopener noreferrer".
 */
export function sanitizeRichHtml(html: string): string {
  // Force-add rel="noopener noreferrer" + target="_blank" handling on external <a>
  if (typeof window !== 'undefined') {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A' && node.getAttribute('href')) {
        const href = node.getAttribute('href') ?? '';
        if (/^https?:/i.test(href)) {
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
        }
      }
    });
  }

  const clean = DOMPurify.sanitize(html, RICH_TEXT_CONFIG);

  if (typeof window !== 'undefined') {
    DOMPurify.removeAllHooks();
  }

  return typeof clean === 'string' ? clean : String(clean);
}
