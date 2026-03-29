import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "../utils/apiBase";

export function useToDo() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['toDos'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/todo`);
            if (!res.ok) throw new Error('Failed to fetch todos');
            return res.json();
        },
    });

    const addTodo = useMutation({
        mutationFn: async (todo) => {
            const res = await fetch(`${API_BASE}/todo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todo),
            });
            if (!res.ok) throw new Error('Failed to add todo');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['toDos'] }),
    });

    const updateTodo = useMutation({
        mutationFn: async ({ id, item }) => {
            const res = await fetch(`${API_BASE}/todo`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, item }),
            });
            if (!res.ok) throw new Error('Failed to update todo');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['toDos'] }),
    });

    const deleteTodo = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_BASE}/todo`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error('Failed to delete todo');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['toDos'] }),
    });

    return {
        ...query,
        addTodo,
        updateTodo,
        deleteTodo,
    };
}