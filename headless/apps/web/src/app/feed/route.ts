import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_SITE_SETTINGS } from "@flavor/core/lib/wordpress/queries/site";
import type { SiteSettingsResponse } from "@flavor/core/lib/wordpress/types";

interface FeedPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  author?: {
    node: {
      name: string;
    };
  };
  categories?: {
    nodes: { name: string }[];
  };
}

const GET_FEED_POSTS = `
  query GetFeedPosts {
    posts(first: 20, where: { status: PUBLISH }) {
      nodes {
        title
        slug
        date
        excerpt
        author {
          node {
            name
          }
        }
        categories {
          nodes {
            name
          }
        }
      }
    }
  }
`;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function GET() {
  let siteTitle = "WordPress";
  let siteDescription = "";
  let baseUrl = "http://localhost:3000";

  try {
    const settings = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    siteTitle = settings.generalSettings?.title || siteTitle;
    siteDescription = settings.generalSettings?.description || "";
    if (settings.headlessConfig?.frontendUrl) {
      baseUrl = settings.headlessConfig.frontendUrl.replace(/\/$/, "");
    }
  } catch {
    // fall back to defaults
  }

  let posts: FeedPost[] = [];
  try {
    const data = await wpFetch<{ posts: { nodes: FeedPost[] } }>(GET_FEED_POSTS);
    posts = data.posts.nodes;
  } catch {
    // empty feed
  }

  const items = posts
    .map((post) => {
      const description = stripHtml(post.excerpt);
      const categories = post.categories?.nodes
        .map((cat) => `        <category>${escapeXml(cat.name)}</category>`)
        .join("\n") || "";

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>${post.author ? `\n      <dc:creator>${escapeXml(post.author.node.name)}</dc:creator>` : ""}${categories ? `\n${categories}` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <atom:link href="${baseUrl}/feed" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
