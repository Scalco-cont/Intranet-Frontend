import { describe, expect, it } from 'vitest';
import { ARQUIVOS_PATH, construirUrl, estaNaPaginaArquivos, lerEstadoUrl } from './arquivosUrl';

describe('estaNaPaginaArquivos', () => {
  it('reconhece o path da pagina', () => {
    expect(estaNaPaginaArquivos(ARQUIVOS_PATH)).toBe(true);
  });

  it('rejeita outros paths', () => {
    expect(estaNaPaginaArquivos('/')).toBe(false);
  });
});

describe('lerEstadoUrl', () => {
  it('le pasta e arquivo da query string', () => {
    expect(lerEstadoUrl('?pasta=abc&arquivo=xyz')).toEqual({ pasta: 'abc', arquivo: 'xyz' });
  });

  it('retorna null quando ausente', () => {
    expect(lerEstadoUrl('')).toEqual({ pasta: null, arquivo: null });
  });
});

describe('construirUrl', () => {
  it('monta url so com pasta', () => {
    expect(construirUrl({ pasta: 'abc', arquivo: null })).toBe(`${ARQUIVOS_PATH}?pasta=abc`);
  });

  it('monta url com pasta e arquivo', () => {
    expect(construirUrl({ pasta: 'abc', arquivo: 'xyz' })).toBe(`${ARQUIVOS_PATH}?pasta=abc&arquivo=xyz`);
  });

  it('monta url da raiz sem parametros', () => {
    expect(construirUrl({ pasta: null, arquivo: null })).toBe(ARQUIVOS_PATH);
  });
});
