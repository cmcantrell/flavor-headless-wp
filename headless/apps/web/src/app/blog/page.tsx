import type { Metadata } from "next";
import { getPageData } from "@flavor/core/lib/wordpress/pagination";
import PostList from "@flavor/core/components/blog/PostList";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const { posts, pageInfo, postsPerPage, maxPerPage } = await getPageData(1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>
      <PostList
        initialPosts={posts}
        initialPageInfo={pageInfo}
        postsPerPage={postsPerPage}
        maxPerPage={maxPerPage}
        currentPage={1}
      />
    </div>
  );
}
