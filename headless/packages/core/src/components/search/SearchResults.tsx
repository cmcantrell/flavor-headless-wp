"use client";

import Link from "next/link";
import { useLoadMore } from "../../lib/hooks/useLoadMore";
import { SEARCH_CONTENT } from "../../lib/wordpress/queries/search";
import type { ContentNode, PageInfo, SearchResponse } from "../../lib/wordpress/types";

interface SearchResultsProps {
  initialResults: ContentNode[];
  initialPageInfo: PageInfo;
  query: string;
  postsPerPage: number;
}

const extractNodes = (data: SearchResponse) => data.contentNodes.nodes;
const extractPageInfo = (data: SearchResponse) => data.contentNodes.pageInfo;

export default function SearchResults({
  initialResults,
  initialPageInfo,
  query,
  postsPerPage,
}: SearchResultsProps) {
  const { items: results, pageInfo, loading, loadMore } = useLoadMore<ContentNode, SearchResponse>(
    initialResults,
    initialPageInfo,
    SEARCH_CONTENT,
    { search: query },
    postsPerPage,
    extractNodes,
    extractPageInfo,
  );

  if (results.length === 0) {
    return (
      <p className="text-gray-500">
        No results found for &ldquo;{query}&rdquo;. Try a different search term.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {results.map((node) => {
          const isPost = node.contentType.node.name === "post";
          const href = isPost ? `/blog/${node.slug}` : `/${node.slug}`;

          return (
            <article
              key={node.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {isPost ? "Post" : "Page"}
                </span>
                <time className="text-xs text-gray-500">
                  {new Date(node.date).toLocaleDateString()}
                </time>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mt-1 mb-2">
                <Link href={href} className="hover:text-blue-600">
                  {node.title}
                </Link>
              </h2>
              {node.excerpt && (
                <div
                  className="text-gray-600 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: node.excerpt }}
                />
              )}
            </article>
          );
        })}
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
