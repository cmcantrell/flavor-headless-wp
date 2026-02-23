"use client";

import { useState, Suspense, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSiteSettings } from "../context/SiteContext";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import { UserMenu } from "./auth/UserMenu";

function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
          router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
      }}
      className="flex items-center"
    >
      <label htmlFor="site-search" className="sr-only">
        Search
      </label>
      <input
        id="site-search"
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        className="w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </form>
  );
}

function NavDropdown({
  item,
}: {
  item: {
    id: string;
    label: string;
    path: string;
    uri: string;
    childItems?: { nodes: { id: string; label: string; path: string; uri: string }[] };
  };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, close]);

  const hasChildren = item.childItems && item.childItems.nodes.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={item.path || item.uri}
        className="text-gray-700 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            close();
          }
        }}
        aria-expanded={open}
        aria-haspopup="true"
        className="text-gray-700 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
      >
        {item.label}
      </button>
      {open && (
        <div
          className="absolute left-0 top-full pt-2 z-50"
          role="menu"
          aria-label={`${item.label} submenu`}
        >
          <div className="bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]">
            {item.childItems!.nodes.map((child) => (
              <Link
                key={child.id}
                href={child.path || child.uri}
                role="menuitem"
                onClick={close}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:bg-gray-50 focus-visible:text-gray-900"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { settings, primaryMenu, membershipConfig } = useSiteSettings();
  const { user, loading } = useAuth();
  const [authModal, setAuthModal] = useState<{ open: boolean; view: "login" | "register" }>({
    open: false,
    view: "login",
  });

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded">
          {settings?.title || "WordPress"}
        </Link>

        <div className="flex items-center gap-6">
          {primaryMenu.length > 0 && (
            <nav aria-label="Primary navigation" className="flex gap-6 text-sm">
              {primaryMenu
                .filter((item) => !item.parentId)
                .map((item) => (
                  <NavDropdown key={item.id} item={item} />
                ))}
            </nav>
          )}

          {/* Search */}
          <Suspense>
            <SearchForm />
          </Suspense>

          {/* Auth UI */}
          {!loading && (
            <div className="flex items-center gap-3 text-sm">
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal({ open: true, view: "login" })}
                    className="text-gray-700 hover:text-gray-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
                  >
                    Sign In
                  </button>
                  {membershipConfig?.usersCanRegister && (
                    <button
                      onClick={() => setAuthModal({ open: true, view: "register" })}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md font-medium hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Register
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        initialView={authModal.view}
      />
    </header>
  );
}
