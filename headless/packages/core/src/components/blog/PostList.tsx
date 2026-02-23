"use client";

import { useCallback } from "react";
import Link from "next/link";
import { graphqlFetcher } from "../../lib/swr";
import { GET_POSTS } from "../../lib/wordpress/queries/posts";
import { useLoadMore } from "../../lib/hooks/useLoadMore";
import { PostCard } from "./PostCard";
import type { Post, PageInfo, PostsResponse } from "../../lib/wordpress/types";

interface PostListProps {
  initialPosts: Post[];
  initialPageInfo: PageInfo;
  postsPerPage: number;
  maxPerPage: number | null;
  currentPage: number;
}

const extractPosts = (data: PostsResponse) => data.posts.nodes;
const extractPageInfo = (data: PostsResponse) => data.posts.pageInfo;

export default function PostList({
  initialPosts,
  initialPageInfo,
  postsPerPage,
  maxPerPage,
  currentPage,
}: PostListProps) {
  const remaining = maxPerPage ? maxPerPage - initialPosts.length : Infinity;
  const nextBatchSize = maxPerPage
    ? Math.min(postsPerPage, remaining)
    : postsPerPage;

  const { items: posts, pageInfo, loading, loadMore } = useLoadMore<Post, PostsResponse>(
    initialPosts,
    initialPageInfo,
    GET_POSTS,
    {},
    nextBatchSize,
    extractPosts,
    extractPageInfo,
  );

  const currentRemaining = maxPerPage ? maxPerPage - posts.length : Infinity;
  const canLoadMore = pageInfo.hasNextPage && currentRemaining > 0;
  const showNextPage =
    maxPerPage !== null && currentRemaining <= 0 && pageInfo.hasNextPage;

  return (
    <>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load More button */}
      {canLoadMore && (
        <div className="mt-8 text-center" aria-live="polite">
          <button
            onClick={loadMore}
            disabled={loading}
            aria-busy={loading}
            className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}

      {/* Numbered page navigation */}
      {(showNextPage || currentPage > 1) && (
        <nav className="mt-8 flex items-center justify-between" aria-label="Blog pagination">
          {currentPage > 1 ? (
            <Link
              href={currentPage === 2 ? "/blog" : `/blog/page/${currentPage - 1}`}
              rel="prev"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              &larr; Previous Page
            </Link>
          ) : (
            <span />
          )}
          {showNextPage && (
            <Link
              href={`/blog/page/${currentPage + 1}`}
              rel="next"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Next Page &rarr;
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
