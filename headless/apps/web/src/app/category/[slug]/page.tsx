import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_CATEGORY_BY_SLUG, GET_POSTS_BY_CATEGORY } from "@flavor/core/lib/wordpress/queries/taxonomy";
import { fetchArchiveData } from "@flavor/core/lib/wordpress/archive";
import type { CategoryBySlugResponse } from "@flavor/core/lib/wordpress/types";
import ArchivePostList from "@flavor/core/components/blog/ArchivePostList";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
  try {
    const data = await wpFetch<CategoryBySlugResponse>(GET_CATEGORY_BY_SLUG, { slug });
    return data.category;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `Category: ${category.name}`,
    description: category.description || undefined,
  };
}

export default async function CategoryArchivePage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const { posts, pageInfo, postsPerPage } = await fetchArchiveData(
    GET_POSTS_BY_CATEGORY,
    { categoryName: slug },
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Category: {category.name}
      </h1>
      {category.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}
      {!category.description && <div className="mb-8" />}
      <ArchivePostList
        initialPosts={posts}
        initialPageInfo={pageInfo}
        postsPerPage={postsPerPage}
        query={GET_POSTS_BY_CATEGORY}
        queryVariables={{ categoryName: slug }}
      />
    </div>
  );
}
