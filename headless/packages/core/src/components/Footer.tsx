"use client";

import Link from "next/link";
import { useSiteSettings } from "../context/SiteContext";

export function Footer() {
  const { settings, footerMenu } = useSiteSettings();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {footerMenu.length > 0 && (
          <nav aria-label="Footer navigation" className="flex justify-center gap-6 text-sm mb-4">
            {footerMenu
              .filter((item) => !item.parentId)
              .map((item) => (
                <Link
                  key={item.id}
                  href={item.path || item.uri}
                  className="text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        )}
        <p className="text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} {settings?.title || "WordPress"}.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
