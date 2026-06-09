"use client";
import { useContext } from "react";
import { FiX, FiLogOut, FiUser } from "react-icons/fi";
import UserContext from "../../lib/contexts/UserContext";
import LeftMenu from "./LeftMenu";

export interface DrawerMenuProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export default function DrawerMenu({
  open,
  onClose,
  onLogout,
  isAdmin,
}: DrawerMenuProps) {
  const { user } = useContext(UserContext);

  return (
    <>
      {/* Dark overlay — mobile only */}
      <div
        className={`fixed inset-0 bg-transparentBlack z-40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        {/* Header: user info */}
        <div className="bg-lightOrange text-white px-4 py-4 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <FiUser size={44} className="opacity-80 mt-1" />
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-orangeTransparent transition-colors"
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
          </div>
          {user?.displayName && (
            <span className="font-bold text-sm leading-tight">
              {user.displayName}
            </span>
          )}
          {user?.email && !user?.displayName && (
            <span className="text-sm leading-tight truncate">{user.email}</span>
          )}
          {user?.role && (
            <span className="text-xs italic opacity-90">
              {typeof user.role === "string" ? user.role : user.role?.name}
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto py-2">
          <LeftMenu isAdmin={isAdmin} onClose={onClose} />
        </div>

        {/* Logout */}
        <div className="border-t border-mediumGray">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-lightGray transition-colors"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
