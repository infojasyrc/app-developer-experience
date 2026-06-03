"use client";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import { useUsers } from "../../../lib/api/queries/useUsers";
import UserList from "../../../components/users/UserList";

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: users = [], isLoading } = useUsers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark">Users</h1>
        <button
          onClick={() => router.push("/admin/users/new")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-mainBlue text-white text-sm font-medium hover:bg-darkerBlue transition-colors"
        >
          <FiPlus size={14} />
          Add User
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray text-sm">
          Loading users…
        </div>
      ) : (
        <UserList users={users} />
      )}
    </div>
  );
}
