import { useQuery } from "@tanstack/react-query";
import { Headquarter } from "../../../shared/entities/headquarter";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const fetchHeadquarters = async (): Promise<Headquarter[]> => {
  const res = await fetch(`${BASE}headquarters`);
  if (!res.ok) throw new Error("Failed to fetch headquarters");
  return res.json();
};

export function useHeadquarters() {
  return useQuery<Headquarter[]>({
    queryKey: ["headquarters"],
    queryFn: fetchHeadquarters,
    staleTime: 5 * 60 * 1000, // headquarters rarely change
  });
}
