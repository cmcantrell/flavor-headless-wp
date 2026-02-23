"use client";

import { createContext, useContext, ReactNode } from "react";
import { GeneralSettings, ReadingSettings, DiscussionConfig, MembershipConfig, HeadlessConfig, MenuItem } from "../lib/wordpress/types";

interface SiteContextType {
  settings: GeneralSettings | null;
  readingSettings: ReadingSettings | null;
  discussionConfig: DiscussionConfig | null;
  membershipConfig: MembershipConfig | null;
  headlessConfig: HeadlessConfig | null;
  primaryMenu: MenuItem[];
  footerMenu: MenuItem[];
}

const SiteContext = createContext<SiteContextType>({
  settings: null,
  readingSettings: null,
  discussionConfig: null,
  membershipConfig: null,
  headlessConfig: null,
  primaryMenu: [],
  footerMenu: [],
});

export function SiteProvider({
  children,
  settings,
  readingSettings,
  discussionConfig,
  membershipConfig,
  headlessConfig,
  primaryMenu = [],
  footerMenu = [],
}: {
  children: ReactNode;
  settings: GeneralSettings | null;
  readingSettings?: ReadingSettings | null;
  discussionConfig?: DiscussionConfig | null;
  membershipConfig?: MembershipConfig | null;
  headlessConfig?: HeadlessConfig | null;
  primaryMenu?: MenuItem[];
  footerMenu?: MenuItem[];
}) {
  return (
    <SiteContext.Provider value={{ settings, readingSettings: readingSettings ?? null, discussionConfig: discussionConfig ?? null, membershipConfig: membershipConfig ?? null, headlessConfig: headlessConfig ?? null, primaryMenu, footerMenu }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteContext);
}
