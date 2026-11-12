import { useQuery } from "@tanstack/react-query";
import { User } from "../../../shared/entities/user";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(`${BASE}users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}
