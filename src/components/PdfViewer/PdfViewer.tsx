interface PdfViewerProps {
  url: string;
  nome: string;
  onClose: () => void;
}

export function PdfViewer({ nome, onClose }: PdfViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">Fechar</button>
      <p className="text-white">{nome}</p>
    </div>
  );
}
