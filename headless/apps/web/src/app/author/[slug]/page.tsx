import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_AUTHOR_BY_SLUG, GET_POSTS_BY_AUTHOR } from "@flavor/core/lib/wordpress/queries/author";
import { fetchArchiveData } from "@flavor/core/lib/wordpress/archive";
import type { AuthorBySlugResponse } from "@flavor/core/lib/wordpress/types";
import ArchivePostList from "@flavor/core/components/blog/ArchivePostList";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getAuthor(slug: string) {
  try {
    const data = await wpFetch<AuthorBySlugResponse>(GET_AUTHOR_BY_SLUG, { slug });
    return data.user;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return { title: "Author Not Found" };
  return {
    title: `Posts by ${author.name}`,
    description: author.description || undefined,
  };
}

export default async function AuthorArchivePage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthor(slug);

  if (!author) notFound();

  const { posts, pageInfo, postsPerPage } = await fetchArchiveData(
    GET_POSTS_BY_AUTHOR,
    { authorName: slug },
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        {author.avatar?.url && (
          <Image
            src={author.avatar.url}
            alt={author.name}
            width={64}
            height={64}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
          {author.description && (
            <p className="text-gray-600 mt-1">{author.description}</p>
          )}
        </div>
      </div>
      <ArchivePostList
        initialPosts={posts}
        initialPageInfo={pageInfo}
        postsPerPage={postsPerPage}
        query={GET_POSTS_BY_AUTHOR}
        queryVariables={{ authorName: slug }}
      />
    </div>
  );
}
