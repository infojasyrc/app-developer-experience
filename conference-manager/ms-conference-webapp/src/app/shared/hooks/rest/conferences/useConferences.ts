import { useQuery } from "@tanstack/react-query";

// API functions
const fetchConferences = async () => {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export function useConferences() {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchConferences,
  })
}
