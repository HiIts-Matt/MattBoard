import { useQuery } from "@tanstack/react-query"
import { API_BASE } from "../utils/apiBase"
import { minutes } from "../utils/utils"

export function useApplePhoto(changeTime) {
    const fetchApplePhoto = async () => {
        const response = await fetch(`${API_BASE}/apple-album/random`)
        if (!response.ok) throw new Error('Failed to fetch random photo')
        return response.json()
    }

    return useQuery({
        queryKey: ['apple-album', 'random'],
        queryFn: fetchApplePhoto,
        refetchInterval: changeTime,
        refetchOnWindowFocus: false,
        retry: 5,
    })
}