import type { Metadata } from "next";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { SEARCH_CONTENT } from "@flavor/core/lib/wordpress/queries/search";
import { GET_SITE_SETTINGS } from "@flavor/core/lib/wordpress/queries/site";
import type { SearchResponse, SiteSettingsResponse, PageInfo } from "@flavor/core/lib/wordpress/types";
import SearchResults from "@flavor/core/components/search/SearchResults";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search</h1>
        <p className="text-gray-500">Enter a search term to find posts and pages.</p>
      </div>
    );
  }

  let postsPerPage = 10;
  try {
    const settings = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    postsPerPage = settings.readingSettings?.postsPerPage ?? 10;
  } catch {
    // fall back to default
  }

  const emptyPageInfo: PageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: "",
    endCursor: "",
  };

  let initialResults: SearchResponse["contentNodes"]["nodes"] = [];
  let initialPageInfo: PageInfo = emptyPageInfo;

  try {
    const data = await wpFetch<SearchResponse>(SEARCH_CONTENT, {
      search: query,
      first: postsPerPage,
    });
    initialResults = data.contentNodes.nodes;
    initialPageInfo = data.contentNodes.pageInfo;
  } catch {
    // fall back to empty results
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Search results for &ldquo;{query}&rdquo;
      </h1>
      <SearchResults
        key={query}
        initialResults={initialResults}
        initialPageInfo={initialPageInfo}
        query={query}
        postsPerPage={postsPerPage}
      />
    </div>
  );
}
