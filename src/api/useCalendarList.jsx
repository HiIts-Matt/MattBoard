import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../utils/apiBase';

export function useCalendarList({ enabled = true } = {}) {
    const { data, isLoading } = useQuery({
        queryKey: ['calendar-list'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/calendar/calendars`);
            if (!res.ok) return { calendars: [] };
            return res.json();
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });

    return {
        calendars: data?.calendars ?? [],
        isLoading,
    };
}
