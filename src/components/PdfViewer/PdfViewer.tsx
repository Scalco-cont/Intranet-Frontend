import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

interface PdfViewerProps {
  url: string;
  nome: string;
  onClose: () => void;
}

export function PdfViewer({ url, nome, onClose }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [documento, setDocumento] = useState<PDFDocumentProxy | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [escala, setEscala] = useState(1.2);
  const [progresso, setProgresso] = useState<number | null>(0);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setErro(null);
    setProgresso(0);
    setDocumento(null);

    const loadingTask = pdfjsLib.getDocument({ url, disableRange: true });
    loadingTask.onProgress = (dados: { loaded: number; total: number }) => {
      if (cancelado) return;
      setProgresso(dados.total > 0 ? Math.round((dados.loaded / dados.total) * 100) : null);
    };

    loadingTask.promise
      .then((doc) => {
        if (cancelado) return;
        setDocumento(doc);
        setPaginaAtual(1);
        setProgresso(null);
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar o PDF.');
      });

    return () => {
      cancelado = true;
      loadingTask.destroy();
    };
  }, [url]);

  useEffect(() => {
    if (!documento || !canvasRef.current) return;
    let cancelado = false;

    documento.getPage(paginaAtual).then((pagina) => {
      if (cancelado) return;
      const viewport = pagina.getViewport({ scale: escala });
      const canvas = canvasRef.current!;
      const contexto = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pagina.render({ canvasContext: contexto, viewport });
    });

    return () => {
      cancelado = true;
    };
  }, [documento, paginaAtual, escala]);

  useEffect(() => {
    const bloquearAtalhos = (e: KeyboardEvent) => {
      const tecla = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (tecla === 's' || tecla === 'p')) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', bloquearAtalhos);
    return () => document.removeEventListener('keydown', bloquearAtalhos);
  }, []);

  const totalPaginas = documento?.numPages ?? 0;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 bg-gray-700 flex flex-col print:hidden"
    >
      <div className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-900 truncate">{nome}</span>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <X size={20} />
        </button>
      </div>

      <div className="flex-grow overflow-auto flex items-start justify-center p-6">
        {erro ? (
          <p className="text-white text-sm mt-10">{erro}</p>
        ) : progresso !== null ? (
          <div className="text-white text-sm mt-10 w-64">
            <p className="mb-2 text-center">Carregando{progresso > 0 ? ` — ${progresso}%` : '…'}</p>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: progresso > 0 ? `${progresso}%` : '30%' }}
              />
            </div>
          </div>
        ) : (
          <canvas ref={canvasRef} className="bg-white shadow-lg" />
        )}
      </div>

      {documento && (
        <div className="flex items-center justify-center gap-4 h-14 bg-white border-t border-gray-200">
          <button
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            disabled={paginaAtual <= 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">Página {paginaAtual} de {totalPaginas}</span>
          <button
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual >= totalPaginas}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-700"
          >
            <ChevronRight size={20} />
          </button>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => setEscala((s) => Math.max(0.5, s - 0.2))} className="p-2 rounded-full hover:bg-gray-100 text-gray-700">
            <ZoomOut size={20} />
          </button>
          <button onClick={() => setEscala((s) => Math.min(3, s + 0.2))} className="p-2 rounded-full hover:bg-gray-100 text-gray-700">
            <ZoomIn size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
