import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { arquivoUrl, listarArquivos, type CrumbArquivo, type ItemArquivo } from '../../services/api';
import { construirUrl, lerEstadoUrl } from '../../utils/arquivosUrl';
import { Breadcrumb, FileGridItem } from '../../components/FileBrowser';
import { PdfViewer } from '../../components/PdfViewer/PdfViewer';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState/ErrorState';

interface ArquivoAberto {
  token: string;
  nome: string;
}

interface ArquivosDoCursoProps {
  onVoltarInicio: () => void;
}

export function ArquivosDoCurso({ onVoltarInicio }: ArquivosDoCursoProps) {
  const [caminho, setCaminho] = useState<CrumbArquivo[]>([]);
  const [itens, setItens] = useState<ItemArquivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [arquivoAberto, setArquivoAberto] = useState<ArquivoAberto | null>(null);

  const carregar = useCallback((tokenPasta: string | null) => {
    setLoading(true);
    setErro(null);
    listarArquivos(tokenPasta ?? undefined)
      .then((resposta) => {
        setCaminho(resposta.caminho);
        setItens(resposta.itens);
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar arquivos.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const aplicarEstadoDaUrl = () => {
      const estado = lerEstadoUrl(window.location.search);
      carregar(estado.pasta);
      setArquivoAberto(null);
    };
    aplicarEstadoDaUrl();

    window.addEventListener('popstate', aplicarEstadoDaUrl);
    return () => window.removeEventListener('popstate', aplicarEstadoDaUrl);
  }, [carregar]);

  const abrirPasta = (token: string | null) => {
    const url = construirUrl({ pasta: token, arquivo: null });
    window.history.pushState({}, '', url);
    carregar(token);
    setArquivoAberto(null);
  };

  const abrirArquivo = (item: ItemArquivo) => {
    const tokenPastaAtual = caminho[caminho.length - 1]?.token ?? null;
    const url = construirUrl({ pasta: tokenPastaAtual, arquivo: item.token });
    window.history.pushState({}, '', url);
    setArquivoAberto({ token: item.token, nome: item.nome });
  };

  const fecharArquivo = () => {
    const tokenPastaAtual = caminho[caminho.length - 1]?.token ?? null;
    const url = construirUrl({ pasta: tokenPastaAtual, arquivo: null });
    window.history.pushState({}, '', url);
    setArquivoAberto(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <button
        onClick={onVoltarInicio}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-3"
      >
        <ArrowLeft size={16} />
        Voltar à intranet
      </button>

      <Breadcrumb caminho={caminho} onNavegar={abrirPasta} />

      {loading ? (
        <LoadingSpinner />
      ) : erro ? (
        <ErrorState message={erro} onRetry={() => carregar(caminho[caminho.length - 1]?.token ?? null)} />
      ) : itens.length === 0 ? (
        <p className="text-sm text-gray-400 mt-6">Esta pasta está vazia.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-6">
          {itens.map((item) => (
            <FileGridItem
              key={item.token}
              item={item}
              onAbrirPasta={() => abrirPasta(item.token)}
              onAbrirArquivo={() => abrirArquivo(item)}
            />
          ))}
        </div>
      )}

      {arquivoAberto && (
        <PdfViewer
          url={arquivoUrl(arquivoAberto.token)}
          nome={arquivoAberto.nome}
          onClose={fecharArquivo}
        />
      )}
    </div>
  );
}
