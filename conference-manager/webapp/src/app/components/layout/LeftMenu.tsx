"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiCalendar, FiUsers, FiKey } from "react-icons/fi";

export interface LeftMenuProps {
  isAdmin: boolean;
  onClose?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Conferences", icon: <FiCalendar size={18} /> },
  {
    href: "/admin/users",
    label: "Users",
    icon: <FiUsers size={18} />,
    adminOnly: true,
  },
  {
    href: "/admin/users/change-password",
    label: "Change Password",
    icon: <FiKey size={18} />,
  },
];

export default function LeftMenu({ isAdmin, onClose }: LeftMenuProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <nav className="flex flex-col gap-0.5 p-2" aria-label="Main navigation">
        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors ${
                isActive
                  ? "bg-mainBlue text-white font-medium"
                  : "text-dark dark:text-white hover:bg-lightBlue dark:hover:bg-[#2a2a2a]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
