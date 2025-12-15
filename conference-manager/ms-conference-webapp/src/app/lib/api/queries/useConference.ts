import { useQuery } from "@tanstack/react-query";

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
