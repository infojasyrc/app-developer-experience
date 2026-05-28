"use client";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import UserContext from "../../lib/contexts/UserContext";
import Header from "./Header";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useContext(UserContext);
  const username = user?.email ?? user?.displayName ?? "";

  const handleLogout = () => {
    logout?.();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-lightGray">
      <Header
        isAuthenticated={isLoggedIn ?? false}
        username={username}
        onLogin={() => router.push("/login")}
        onLogout={handleLogout}
      />
      <main className="pt-14">{children}</main>
    </div>
  );
}
