import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Conference } from '../../../shared/entities/conference';

async function addConference(data: Partial<Conference>): Promise<Conference> {
  const res = await fetch('/api/conferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to create conference');
  }
  return res.json();
}

async function updateConference(id: string, data: Partial<Conference>): Promise<Conference> {
  const res = await fetch(`/api/conferences/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to update conference');
  }
  return res.json();
}

async function deleteConference(id: string): Promise<void> {
  const res = await fetch(`/api/conferences/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to delete conference');
  }
}

export function useAddConference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addConference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conferences'] });
    },
  });
}

export function useUpdateConference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Conference> }) =>
      updateConference(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['conferences'] });
      queryClient.invalidateQueries({ queryKey: ['conference', id] });
    },
  });
}

export function useDeleteConference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conferences'] });
    },
  });
}
