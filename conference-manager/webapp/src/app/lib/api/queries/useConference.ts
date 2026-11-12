import { useQuery } from "@tanstack/react-query";
import { Conference } from "../../../shared/entities/conference";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const fetchConference = async (id: string): Promise<Conference> => {
  const res = await fetch(`${BASE}conferences/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch conference ${id}`);
  return res.json();
};

export function useConference(id: string) {
  return useQuery<Conference>({
    queryKey: ["conference", id],
    queryFn: () => fetchConference(id),
    enabled: !!id,
  });
}
