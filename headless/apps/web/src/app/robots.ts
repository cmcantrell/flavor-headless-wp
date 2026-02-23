import type { MetadataRoute } from "next";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_SITE_SETTINGS } from "@flavor/core/lib/wordpress/queries/site";
import type { SiteSettingsResponse } from "@flavor/core/lib/wordpress/types";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let baseUrl = "http://localhost:3000";
  let isPublic = true;

  try {
    const data = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    if (data.headlessConfig?.frontendUrl) {
      baseUrl = data.headlessConfig.frontendUrl.replace(/\/$/, "");
    }
    if (data.readingSettings?.blogPublic === false) {
      isPublic = false;
    }
  } catch {
    // fall back to defaults
  }

  if (!isPublic) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
