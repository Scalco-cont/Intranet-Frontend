import { useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { Dashboard } from './pages/Dashboard/Dashboard';
import {
  getSistemas, getLinks, getComunicados,
  type Sistema, type LinkUtil, type Comunicado
} from './services/api';

function App() {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [links, setLinks] = useState<LinkUtil[]>([]);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getSistemas(), getLinks(), getComunicados()])
      .then(([s, l, c]) => {
        if (!cancelled) { setSistemas(s); setLinks(l); setComunicados(c); }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header onRefresh={refetch} />
      <main className="flex-grow">
        <Dashboard
          sistemas={sistemas}
          links={links}
          comunicados={comunicados}
          loading={loading}
          error={error}
          onRetry={refetch}
          onRefreshComunicados={refetch}
        />
      </main>
    </div>
  );
}

export default App;
