import { useQueries } from '@tanstack/react-query';
import { API_BASE } from '../utils/apiBase';

export function useNews({ feedUrls = [], refetchTime = 1000 * 60 * 15 } = {}) {
    const queries = useQueries({
        queries: feedUrls.map(url => ({
            queryKey: ['news', url],
            queryFn: async () => {
                const params = new URLSearchParams({ url });
                const res = await fetch(`${API_BASE}/news?${params}`);
                if (!res.ok) throw new Error('Failed to fetch news');
                return res.json();
            },
            refetchInterval: refetchTime,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 10,
        })),
    });

    const isLoading = queries.some(q => q.isLoading);
    const isError = queries.every(q => q.isError);
    const articles = queries.flatMap((q, i) => {
        const source = new URL(feedUrls[i]).hostname.replace(/^www\./, '');
        return (q.data?.articles ?? []).map(a => ({ ...a, source: a.source ?? source }));
    });

    console.log(articles);

    return { articles, isLoading, isError };
}
