import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('remove tags de script', () => {
    expect(sanitizeHtml('<p>oi</p><script>alert(1)</script>')).toBe('<p>oi</p>');
  });

  it('remove atributos de evento', () => {
    const result = sanitizeHtml('<p onclick="alert(1)">oi</p>');
    expect(result).not.toContain('onclick');
  });

  it('mantém formatação permitida', () => {
    const html = '<p>Texto <strong>negrito</strong></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('remove links javascript:', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">clique</a>');
    expect(result).not.toContain('javascript:');
  });

  it('mantém link http válido', () => {
    const html = '<a href="https://empresa.com">link</a>';
    expect(sanitizeHtml(html)).toBe(html);
  });
});
