import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../utils/apiBase';

export function useConfig() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['config'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/config`);
            if (!res.ok) throw new Error('Failed to fetch config');
            return res.json(); // { active: uuid, configs: [...] }
        },
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    });

    const activeConfig = query.data
        ? (query.data.configs?.find(c => c.id === query.data.active) ?? null)
        : null;

    const save = useMutation({
        mutationFn: async (config) => {
            const res = await fetch(`${API_BASE}/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (!res.ok) throw new Error('Failed to save config');
            return res.json(); // backend returns updated { active, configs }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['config'], data);
        },
    });

    return {
        ...query,
        activeConfig,
        save,
    };
}
