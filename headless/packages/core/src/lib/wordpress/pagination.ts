/**
 * Pagination Helpers
 *
 * Relay-style cursor construction and shared data fetcher for
 * the hybrid Load More + numbered-pages blog pagination.
 */

import { wpFetch } from "./client";
import { GET_POSTS } from "./queries/posts";
import { GET_SITE_SETTINGS } from "./queries/site";
import type {
  Post,
  PageInfo,
  PostsResponse,
  SiteSettingsResponse,
} from "./types";

/**
 * Build a Relay cursor that points to the item at `offset` (0-based).
 * WPGraphQL uses the standard `arrayconnection:<offset>` format.
 */
export function createCursor(offset: number): string {
  return btoa(`arrayconnection:${offset}`);
}

export interface PageData {
  posts: Post[];
  pageInfo: PageInfo;
  postsPerPage: number;
  maxPerPage: number | null;
  currentPage: number;
}

/**
 * Fetch a page of posts for the blog.
 *
 * - Page 1: fetches the first `postsPerPage` posts (no cursor).
 * - Page N > 1: constructs a cursor to skip `(page-1) * maxPerPage` posts,
 *   then fetches the first `postsPerPage` from that point.
 */
export async function getPageData(page: number): Promise<PageData> {
  let postsPerPage = 10;
  let maxPerPage: number | null = null;

  try {
    const settings = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    postsPerPage = settings.readingSettings?.postsPerPage ?? 10;
    maxPerPage = settings.readingSettings?.postsPerPageMax ?? null;
  } catch {
    // fall back to defaults
  }

  const emptyPageInfo: PageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: "",
    endCursor: "",
  };

  try {
    let data: PostsResponse;

    if (page <= 1) {
      data = await wpFetch<PostsResponse>(GET_POSTS, { first: postsPerPage });
    } else {
      if (!maxPerPage) {
        // No numbered pages when maxPerPage is not set
        return { posts: [], pageInfo: emptyPageInfo, postsPerPage, maxPerPage, currentPage: page };
      }
      const offset = (page - 1) * maxPerPage - 1;
      const cursor = createCursor(offset);
      data = await wpFetch<PostsResponse>(GET_POSTS, {
        first: postsPerPage,
        after: cursor,
      });
    }

    return {
      posts: data.posts.nodes,
      pageInfo: data.posts.pageInfo,
      postsPerPage,
      maxPerPage,
      currentPage: page,
    };
  } catch {
    return { posts: [], pageInfo: emptyPageInfo, postsPerPage, maxPerPage, currentPage: page };
  }
}
