import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../utils/apiBase";

// The full list of photos in the Apple album, for the picker grid.
// An optional token previews an album before it has been saved to config;
// otherwise the backend falls back to the saved config / env token.
export function useApplePhotoList(token, enabled = true) {
    return useQuery({
        queryKey: ['apple-album', 'list', token ?? null],
        queryFn: async () => {
            const qs = token ? `?token=${encodeURIComponent(token)}` : '';
            const res = await fetch(`${API_BASE}/apple-album/list${qs}`);
            if (!res.ok) throw new Error('Failed to fetch album photos');
            return res.json(); // { items: [{ guid, url, width, height, caption }] }
        },
        enabled,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
}
