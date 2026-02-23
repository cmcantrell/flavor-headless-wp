import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SWRProvider } from "@flavor/core/lib/swr";
import { SiteProvider } from "@flavor/core/context/SiteContext";
import { AuthProvider } from "@flavor/core/context/AuthContext";
import { Header } from "@flavor/core/components/Header";
import { Footer } from "@flavor/core/components/Footer";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_SITE_SETTINGS } from "@flavor/core/lib/wordpress/queries/site";
import { GET_MENU_BY_LOCATION } from "@flavor/core/lib/wordpress/queries/menus";
import type { SiteSettingsResponse, MenuItem } from "@flavor/core/lib/wordpress/types";
import "./globals.css";

interface MenuItemsResponse {
  menuItems: {
    nodes: MenuItem[];
  };
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function getSiteData() {
  try {
    const data = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    return { general: data.generalSettings, reading: data.readingSettings, discussion: data.discussionConfig, membership: data.membershipConfig, headless: data.headlessConfig };
  } catch (e) {
    console.error("Failed to fetch site settings:", e);
    return { general: null, reading: null, discussion: null, membership: null, headless: null };
  }
}

async function getMenu(location: string): Promise<MenuItem[]> {
  try {
    const data = await wpFetch<MenuItemsResponse>(GET_MENU_BY_LOCATION, {
      location,
    });
    return data.menuItems?.nodes ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { general: settings, reading } = await getSiteData();
  return {
    title: {
      default: settings?.title || "WordPress",
      template: `%s | ${settings?.title || "WordPress"}`,
    },
    description: settings?.description || "",
    ...(reading?.blogPublic === false && {
      robots: { index: false, follow: false },
    }),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteData, primaryMenu, footerMenu] = await Promise.all([
    getSiteData(),
    getMenu("PRIMARY"),
    getMenu("FOOTER"),
  ]);
  const { general: settings, reading: readingSettings, discussion: discussionConfig, membership: membershipConfig, headless: headlessConfig } = siteData;

  return (
    <html lang={settings?.language?.replace("_", "-") || "en"}>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 flex flex-col min-h-screen`}
      >
        <SWRProvider>
          <SiteProvider settings={settings} readingSettings={readingSettings} discussionConfig={discussionConfig} membershipConfig={membershipConfig} headlessConfig={headlessConfig} primaryMenu={primaryMenu} footerMenu={footerMenu}>
            <AuthProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:rounded-md"
              >
                Skip to main content
              </a>
              <Header />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
            </AuthProvider>
          </SiteProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
