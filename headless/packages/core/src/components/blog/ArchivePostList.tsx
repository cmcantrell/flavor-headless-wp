"use client";

import { useLoadMore } from "../../lib/hooks/useLoadMore";
import { PostCard } from "./PostCard";
import type { Post, PageInfo, PostsResponse } from "../../lib/wordpress/types";

interface ArchivePostListProps {
  initialPosts: Post[];
  initialPageInfo: PageInfo;
  postsPerPage: number;
  query: string;
  queryVariables: Record<string, unknown>;
}

const extractPosts = (data: PostsResponse) => data.posts.nodes;
const extractPageInfo = (data: PostsResponse) => data.posts.pageInfo;

export default function ArchivePostList({
  initialPosts,
  initialPageInfo,
  postsPerPage,
  query,
  queryVariables,
}: ArchivePostListProps) {
  const { items: posts, pageInfo, loading, loadMore } = useLoadMore<Post, PostsResponse>(
    initialPosts,
    initialPageInfo,
    query,
    queryVariables,
    postsPerPage,
    extractPosts,
    extractPageInfo,
  );

  if (posts.length === 0) {
    return <p className="text-gray-500">No posts found.</p>;
  }

  return (
    <>
      <div className="space-y-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {pageInfo.hasNextPage && (
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
    </>
  );
}
