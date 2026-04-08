import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../utils/apiBase';

export function useWeather({ lat, lon, units = 'celsius', refetchTime = 1000 * 60 * 30 } = {}) {
    return useQuery({
        queryKey: ['weather', lat, lon, units],
        queryFn: async () => {
            const params = new URLSearchParams({ lat, lon, units });
            const res = await fetch(`${API_BASE}/weather?${params}`);
            if (!res.ok) throw new Error('Failed to fetch weather');
            return res.json();
        },
        retry: false,
        enabled: !!(lat && lon),
        refetchInterval: refetchTime,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 15,
    });
}