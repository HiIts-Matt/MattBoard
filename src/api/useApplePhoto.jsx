import { useQuery } from "@tanstack/react-query"
import { API_BASE } from "../utils/apiBase"

export function useApplePhoto(changeTime, enabled = true) {
    const fetchApplePhoto = async () => {
        const response = await fetch(`${API_BASE}/apple-album/random`)
        if (!response.ok) throw new Error('Failed to fetch random photo')
        return response.json()
    }

    return useQuery({
        queryKey: ['apple-album', 'random'],
        queryFn: fetchApplePhoto,
        enabled,
        refetchInterval: enabled ? changeTime : false,
        refetchOnWindowFocus: false,
        retry: 5,
    })
}