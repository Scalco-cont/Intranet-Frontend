import { useState, useEffect } from 'react';
import { getSistemas, getLinks, type Sistema, type LinkUtil } from '../services/api';

interface UseIntranetDataReturn {
  sistemas: Sistema[];
  links: LinkUtil[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useIntranetData(): UseIntranetDataReturn {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [links, setLinks] = useState<LinkUtil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sistemasData, linksData] = await Promise.all([
          getSistemas(),
          getLinks(),
        ]);
        if (!cancelled) {
          setSistemas(sistemasData);
          setLinks(linksData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao conectar com o servidor. Verifique se o backend está rodando.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return { sistemas, links, loading, error, refetch };
}
