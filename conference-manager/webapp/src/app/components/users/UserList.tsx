"use client";
import { FiShield, FiUser } from "react-icons/fi";
import { User } from "../../shared/entities/user";

export interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-16 text-gray text-sm">No users found.</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-mediumGray">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-lightGray text-boldGray text-xs uppercase tracking-wide">
            <th className="text-left px-4 py-3 font-semibold">Name</th>
            <th className="text-left px-4 py-3 font-semibold">Email</th>
            <th className="text-center px-4 py-3 font-semibold">Admin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mediumGray bg-white">
          {users.map((user) => (
            <tr key={user.uid} className="hover:bg-lightGray transition-colors">
              <td className="px-4 py-3 text-dark font-medium">
                <div className="flex items-center gap-2">
                  <FiUser size={15} className="text-boldGray shrink-0" />
                  {user.firstName} {user.lastName}
                </div>
              </td>
              <td className="px-4 py-3 text-gray">{user.email}</td>
              <td className="px-4 py-3 text-center">
                {user.isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-mainBlue/10 text-mainBlue text-xs font-medium">
                    <FiShield size={11} />
                    Admin
                  </span>
                ) : (
                  <span className="text-mediumGray text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
