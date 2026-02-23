/**
 * Shared helper for archive pages (category, tag, author).
 *
 * Fetches postsPerPage from site settings and the first page of posts
 * for a given query + variables.
 */

import { wpFetch } from "./client";
import { GET_SITE_SETTINGS } from "./queries/site";
import type { Post, PageInfo, PostsResponse, SiteSettingsResponse } from "./types";

export interface ArchiveData {
  posts: Post[];
  pageInfo: PageInfo;
  postsPerPage: number;
}

const emptyPageInfo: PageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: "",
  endCursor: "",
};

export async function fetchArchiveData(
  query: string,
  variables: Record<string, unknown>,
): Promise<ArchiveData> {
  let postsPerPage = 10;
  try {
    const settings = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    postsPerPage = settings.readingSettings?.postsPerPage ?? 10;
  } catch {
    // fall back to default
  }

  try {
    const data = await wpFetch<PostsResponse>(query, {
      ...variables,
      first: postsPerPage,
    });
    return {
      posts: data.posts.nodes,
      pageInfo: data.posts.pageInfo,
      postsPerPage,
    };
  } catch {
    return { posts: [], pageInfo: emptyPageInfo, postsPerPage };
  }
}
