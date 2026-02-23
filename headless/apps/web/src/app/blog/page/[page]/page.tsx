import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPageData } from "@flavor/core/lib/wordpress/pagination";
import PostList from "@flavor/core/components/blog/PostList";

interface Props {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  return { title: `Blog - Page ${page}` };
}

export default async function BlogPaginatedPage({ params }: Props) {
  const { page: pageParam } = await params;
  const page = parseInt(pageParam, 10);

  if (!page || page < 2) {
    redirect("/blog");
  }

  const { posts, pageInfo, postsPerPage, maxPerPage } = await getPageData(page);

  if (posts.length === 0) {
    redirect("/blog");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Blog &mdash; Page {page}
      </h1>
      <PostList
        initialPosts={posts}
        initialPageInfo={pageInfo}
        postsPerPage={postsPerPage}
        maxPerPage={maxPerPage}
        currentPage={page}
      />
    </div>
  );
}
