import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../utils/apiBase';

const AUTH_URL = `${API_BASE}/calendar/auth`;
const STATUS_URL = `${API_BASE}/calendar/auth/status`;

export function useCalendarAuth() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['calendar-auth-status'],
        queryFn: async () => {
            const res = await fetch(STATUS_URL);
            return res.json();
        },
        refetchInterval: 3000,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    function openAuthTab() {
        const tab = window.open(AUTH_URL, '_blank');
        if (!tab) return;

        const timer = setInterval(() => {
            if (tab.closed) {
                clearInterval(timer);
                queryClient.invalidateQueries({ queryKey: ['calendar-auth-status'] });
                return;
            }
            try {
                // Reading tab.location.href throws SecurityError on cross-origin pages (Google OAuth).
                // Once the backend redirects back to our origin, it becomes readable — auth is done.
                const href = tab.location.href;
                if (href && href !== AUTH_URL) {
                    clearInterval(timer);
                    tab.close();
                    queryClient.invalidateQueries({ queryKey: ['calendar-auth-status'] });
                }
            } catch {
                // Still on a cross-origin page, keep waiting
            }
        }, 500);
    }

    const disconnectMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_BASE}/calendar/auth`, { method: 'DELETE' });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-auth-status'] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        },
    });

    return {
        connected: data?.connected ?? false,
        isLoading,
        authUrl: AUTH_URL,
        openAuthTab,
        disconnect: disconnectMutation.mutateAsync,
        isDisconnecting: disconnectMutation.isPending,
    };
}
