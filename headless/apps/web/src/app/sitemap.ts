import type { MetadataRoute } from "next";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_SITE_SETTINGS } from "@flavor/core/lib/wordpress/queries/site";
import type { SiteSettingsResponse } from "@flavor/core/lib/wordpress/types";

interface SitemapPost {
  slug: string;
  modified: string;
}

interface SitemapPage {
  slug: string;
  uri: string;
  modified: string;
}

interface SitemapTerm {
  slug: string;
}

const SITEMAP_POSTS = `
  query SitemapPosts {
    posts(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
      }
    }
  }
`;

const SITEMAP_PAGES = `
  query SitemapPages {
    pages(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        uri
        modified
      }
    }
  }
`;

const SITEMAP_CATEGORIES = `
  query SitemapCategories {
    categories(first: 1000, where: { hideEmpty: true }) {
      nodes {
        slug
      }
    }
  }
`;

const SITEMAP_TAGS = `
  query SitemapTags {
    tags(first: 1000, where: { hideEmpty: true }) {
      nodes {
        slug
      }
    }
  }
`;

async function getBaseUrl(): Promise<string> {
  try {
    const data = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    if (data.headlessConfig?.frontendUrl) {
      return data.headlessConfig.frontendUrl.replace(/\/$/, "");
    }
  } catch {
    // fall through
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getBaseUrl();

  const [postsData, pagesData, categoriesData, tagsData] = await Promise.all([
    wpFetch<{ posts: { nodes: SitemapPost[] } }>(SITEMAP_POSTS).catch(() => ({ posts: { nodes: [] } })),
    wpFetch<{ pages: { nodes: SitemapPage[] } }>(SITEMAP_PAGES).catch(() => ({ pages: { nodes: [] } })),
    wpFetch<{ categories: { nodes: SitemapTerm[] } }>(SITEMAP_CATEGORIES).catch(() => ({ categories: { nodes: [] } })),
    wpFetch<{ tags: { nodes: SitemapTerm[] } }>(SITEMAP_TAGS).catch(() => ({ tags: { nodes: [] } })),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Home
  entries.push({
    url: baseUrl,
    changeFrequency: "daily",
    priority: 1,
  });

  // Blog index
  entries.push({
    url: `${baseUrl}/blog`,
    changeFrequency: "daily",
    priority: 0.9,
  });

  // Posts
  for (const post of postsData.posts.nodes) {
    entries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.modified,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Pages (skip front page since we already have home)
  for (const page of pagesData.pages.nodes) {
    if (page.uri === "/" || page.slug === "front-page") continue;
    entries.push({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.modified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Categories
  for (const cat of categoriesData.categories.nodes) {
    entries.push({
      url: `${baseUrl}/category/${cat.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  // Tags
  for (const tag of tagsData.tags.nodes) {
    entries.push({
      url: `${baseUrl}/tag/${tag.slug}`,
      changeFrequency: "weekly",
      priority: 0.4,
    });
  }

  return entries;
}
