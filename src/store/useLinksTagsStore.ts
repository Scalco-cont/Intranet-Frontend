import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LinksTagsState {
  // Mapa de linkId -> array de tags
  linkTags: Record<number, string[]>;
  // Retorna as tags de um link específico
  getTagsForLink: (linkId: number) => string[];
  // Define (substitui) as tags de um link
  setTagsForLink: (linkId: number, tags: string[]) => void;
  // Adiciona uma tag a um link (evita duplicatas)
  addTagToLink: (linkId: number, tag: string) => void;
  // Remove uma tag de um link
  removeTagFromLink: (linkId: number, tag: string) => void;
  // Retorna todas as tags únicas existentes (para o filtro)
  getAllTags: () => string[];
}

export const useLinksTagsStore = create<LinksTagsState>()(
  persist(
    (set, get) => ({
      linkTags: {},

      getTagsForLink: (linkId) => get().linkTags[linkId] ?? [],

      setTagsForLink: (linkId, tags) =>
        set((state) => ({
          linkTags: { ...state.linkTags, [linkId]: tags },
        })),

      addTagToLink: (linkId, tag) => {
        const trimmed = tag.trim().toLowerCase();
        if (!trimmed) return;
        const current = get().linkTags[linkId] ?? [];
        if (current.includes(trimmed)) return;
        set((state) => ({
          linkTags: { ...state.linkTags, [linkId]: [...current, trimmed] },
        }));
      },

      removeTagFromLink: (linkId, tag) =>
        set((state) => ({
          linkTags: {
            ...state.linkTags,
            [linkId]: (state.linkTags[linkId] ?? []).filter((t) => t !== tag),
          },
        })),

      getAllTags: () => {
        const all = Object.values(get().linkTags).flat();
        return [...new Set(all)].sort();
      },
    }),
    {
      name: 'intranet-links-tags',
    }
  )
);
