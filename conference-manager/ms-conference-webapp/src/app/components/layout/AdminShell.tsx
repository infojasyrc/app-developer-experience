"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import UserContext from "../../lib/contexts/UserContext";
import { useAuth } from "../../lib/hooks/useAuth";
import Header from "./Header";
import DrawerMenu from "./DrawerMenu";
import LeftMenu from "./LeftMenu";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const { isLoggedIn, user, logout } = useContext(UserContext);
  const authState = useAuth();

  const isAdmin = authState?.user?.isAdmin ?? user?.isAdmin ?? false;
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
        onMenuOpen={() => setDrawerOpen(true)}
      />

      {/* Mobile drawer */}
      <DrawerMenu
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      <div className="flex pt-14">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-mediumGray fixed top-14 bottom-0 left-0 z-30 overflow-y-auto">
          <LeftMenu isAdmin={isAdmin} />
        </aside>

        {/* Page content */}
        <main className="flex-1 md:ml-56 min-h-[calc(100vh-3.5rem)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
