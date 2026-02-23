"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (!user) return null;

  const displayName = user.name || user.firstName || user.email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) setOpen(false);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`User menu for ${displayName}`}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
      >
        {user.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={`${displayName}'s avatar`}
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium" aria-hidden="true">
            {(displayName || "U").charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:inline">{displayName}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
          role="menu"
          aria-label="User menu"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-50"
          >
            Account Settings
          </Link>
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
