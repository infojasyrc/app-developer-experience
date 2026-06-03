import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateUserPayload {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
}

async function createUser(data: CreateUserPayload) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? "Failed to create user");
  }
  return res.json();
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
