import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API functions
const fetchConference = async (id: number) => {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};

export function useConference(id: number) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchConference(id),
    enabled: !!id, // Only run if ID exists
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }) => {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: (data, variables) => {
      // Update cache after successful mutation
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
    },
  });
}
