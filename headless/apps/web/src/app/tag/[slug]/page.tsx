import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_TAG_BY_SLUG, GET_POSTS_BY_TAG } from "@flavor/core/lib/wordpress/queries/taxonomy";
import { fetchArchiveData } from "@flavor/core/lib/wordpress/archive";
import type { TagBySlugResponse } from "@flavor/core/lib/wordpress/types";
import ArchivePostList from "@flavor/core/components/blog/ArchivePostList";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getTag(slug: string) {
  try {
    const data = await wpFetch<TagBySlugResponse>(GET_TAG_BY_SLUG, { slug });
    return data.tag;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return { title: "Tag Not Found" };
  return {
    title: `Tag: ${tag.name}`,
    description: tag.description || undefined,
  };
}

export default async function TagArchivePage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) notFound();

  const { posts, pageInfo, postsPerPage } = await fetchArchiveData(
    GET_POSTS_BY_TAG,
    { tag: slug },
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Tag: {tag.name}
      </h1>
      {tag.description && (
        <p className="text-gray-600 mb-8">{tag.description}</p>
      )}
      {!tag.description && <div className="mb-8" />}
      <ArchivePostList
        initialPosts={posts}
        initialPageInfo={pageInfo}
        postsPerPage={postsPerPage}
        query={GET_POSTS_BY_TAG}
        queryVariables={{ tag: slug }}
      />
    </div>
  );
}
