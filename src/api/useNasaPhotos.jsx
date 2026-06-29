import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../utils/apiBase";

// A single random NASA image for shuffle mode, rotated on the timer.
export function useNasaPhoto(query, changeTime, enabled = true) {
    return useQuery({
        queryKey: ['nasa', 'random', query],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/nasa/random?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch NASA photo');
            return res.json();
        },
        enabled: enabled && !!query,
        refetchInterval: enabled ? changeTime : false,
        refetchOnWindowFocus: false,
        retry: 3,
    });
}

// A page of NASA search results (with preview thumbnails) for the picker grid.
export function useNasaSearch(query, page = 1, enabled = true) {
    return useQuery({
        queryKey: ['nasa', 'search', query, page],
        queryFn: async () => {
            const res = await fetch(
                `${API_BASE}/nasa/search?q=${encodeURIComponent(query)}&page=${page}`
            );
            if (!res.ok) throw new Error('Failed to search NASA library');
            return res.json(); // { items: [{ id, title, thumb, full, width, height }], page }
        },
        enabled: enabled && !!query,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
}
