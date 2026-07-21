import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'h1', 'h2', 'h3',
  'strong', 'em', 'u', 's', 'blockquote',
  'ol', 'ul', 'li', 'a', 'span',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'style'];

/**
 * Sanitiza HTML vindo do editor rich-text (ReactQuill) antes de renderizar
 * com dangerouslySetInnerHTML. Mantém apenas as tags/atributos que a toolbar
 * do editor de fato produz.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
