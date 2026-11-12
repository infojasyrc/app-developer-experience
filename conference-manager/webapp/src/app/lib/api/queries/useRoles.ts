import { useQuery } from "@tanstack/react-query";
import { UserRole } from "../../../shared/entities/user";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const fetchRoles = async (): Promise<UserRole[]> => {
  const res = await fetch(`${BASE}roles`);
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
};

export function useRoles() {
  return useQuery<UserRole[]>({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    staleTime: 5 * 60 * 1000,
  });
}
