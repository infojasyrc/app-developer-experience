"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiUser, FiMenu, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { useThemeMode } from "@/app/lib/contexts/ThemeContext";

export interface HeaderProps {
  isAuthenticated: boolean;
  username: string;
  onLogin: () => void;
  onLogout: () => void;
  onMenuOpen?: () => void;
  version?: string;
}

export default function Header({
  isAuthenticated,
  username,
  onLogin,
  onLogout,
  onMenuOpen,
  version,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { mode, toggleTheme } = useThemeMode();

  const closeDropdown = () => setDropdownOpen(false);

  return (
    <header
      data-testid="header"
      className="w-full bg-mainBlue text-white flex items-center justify-between px-4 h-14 fixed top-0 left-0 right-0 z-50 shadow-md"
    >
      {/* Left: hamburger (mobile) + logo */}
      <div className="flex items-center gap-3">
        {onMenuOpen && (
          <button
            onClick={onMenuOpen}
            className="p-1.5 rounded hover:bg-darkerBlue transition-colors md:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>
        )}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Conference Manager"
            width={1408}
            height={768}
            style={{ height: "32px", width: "auto" }}
            unoptimized
            priority
          />
        </Link>
      </div>

      {/* Right: version + theme toggle + auth actions */}
      <div className="flex items-center gap-3 relative">
        {version && (
          <span className="text-xs text-transparentWhite hidden sm:block">
            v{version}
          </span>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-1.5 rounded hover:bg-darkerBlue transition-colors"
        >
          {mode === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {isAuthenticated ? (
          <>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="p-1.5 rounded hover:bg-darkerBlue transition-colors flex items-center gap-1.5"
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <FiUser size={20} />
              <span className="text-sm hidden sm:block truncate max-w-[140px]">
                {username}
              </span>
            </button>

            {dropdownOpen && (
              <>
                {/* Click-away overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={closeDropdown}
                  aria-hidden
                />
                <div className="absolute top-11 right-0 bg-white text-dark shadow-lg rounded-md min-w-[180px] z-50 py-1">
                  <div className="px-4 py-2 border-b border-mediumGray text-xs text-boldGray truncate">
                    {username}
                  </div>
                  <button
                    onClick={() => { closeDropdown(); onLogout(); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-lightGray flex items-center gap-2"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="flex items-center bg-white text-mainBlue text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-lightBlue transition-colors min-w-[88px] min-h-[44px] justify-center"
            aria-label="Sign in to your account"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
