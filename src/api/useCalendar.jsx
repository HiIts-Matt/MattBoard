import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../utils/apiBase';

async function fetchEvents({ calendarId = 'primary', timeMin, timeMax } = {}) {
    const params = new URLSearchParams({ calendarId });
    if (timeMin) params.set('timeMin', timeMin);
    if (timeMax) params.set('timeMax', timeMax);
    const res = await fetch(`${API_BASE}/calendar/events?${params}`);
    if (!res.ok) throw new Error('Failed to fetch calendar events');
    return res.json();
}

async function createEvent({ calendarId = 'primary', ...event }) {
    const res = await fetch(`${API_BASE}/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId, ...event }),
    });
    if (!res.ok) throw new Error('Failed to create event');
    return res.json();
}

async function updateEvent({ id, calendarId = 'primary', ...event }) {
    const res = await fetch(`${API_BASE}/calendar/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId, ...event }),
    });
    if (!res.ok) throw new Error('Failed to update event');
    return res.json();
}

async function deleteEvent({ id, calendarId = 'primary' }) {
    const params = new URLSearchParams({ calendarId });
    const res = await fetch(`${API_BASE}/calendar/events/${id}?${params}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete event');
    return res.json();
}

export function useCalendar({ calendarId = 'primary', refetchTime = 1000 * 60 * 5 } = {}) {
    const queryClient = useQueryClient();
    const queryKey = ['calendar', calendarId];

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: () => fetchEvents({ calendarId }),
        refetchInterval: refetchTime,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 2,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey });

    const createMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: updateEvent,
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEvent,
        onSuccess: invalidate,
    });

    return {
        events: data?.events ?? [],
        isLoading,
        isError,
        createEvent: createMutation.mutateAsync,
        updateEvent: updateMutation.mutateAsync,
        deleteEvent: deleteMutation.mutateAsync,
    };
}
