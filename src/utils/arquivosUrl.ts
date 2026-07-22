export const ARQUIVOS_PATH = '/arquivos-do-curso';

export interface EstadoUrlArquivos {
  pasta: string | null;
  arquivo: string | null;
}

export function estaNaPaginaArquivos(pathname: string): boolean {
  return pathname === ARQUIVOS_PATH;
}

export function lerEstadoUrl(search: string): EstadoUrlArquivos {
  const params = new URLSearchParams(search);
  return {
    pasta: params.get('pasta'),
    arquivo: params.get('arquivo'),
  };
}

export function construirUrl(estado: EstadoUrlArquivos): string {
  const params = new URLSearchParams();
  if (estado.pasta) params.set('pasta', estado.pasta);
  if (estado.arquivo) params.set('arquivo', estado.arquivo);
  const query = params.toString();
  return query ? `${ARQUIVOS_PATH}?${query}` : ARQUIVOS_PATH;
}
