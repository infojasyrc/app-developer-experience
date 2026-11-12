"use client";
import { useRouter } from "next/navigation";
import { useCreateUser } from "../../../../lib/api/queries/useMutateUser";
import UserForm, { UserFormValues } from "../../../../components/users/UserForm";

export default function AdminUsersNewPage() {
  const router = useRouter();
  const { mutate: createUser, isPending } = useCreateUser();

  const handleSubmit = (values: UserFormValues) => {
    createUser(values, {
      onSuccess: () => router.push("/admin/users"),
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark mb-6">Add User</h1>
      <div className="bg-white rounded-xl border border-mediumGray p-6">
        <UserForm
          isSubmitting={isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/users")}
        />
      </div>
    </div>
  );
}
