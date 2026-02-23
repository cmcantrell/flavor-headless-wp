import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_POST_BY_SLUG } from "@flavor/core/lib/wordpress/queries/posts";
import { GET_SITE_SETTINGS } from "@flavor/core/lib/wordpress/queries/site";
import type { PostBySlugResponse, SiteSettingsResponse } from "@flavor/core/lib/wordpress/types";
import { CommentSection } from "@flavor/core/components/comments";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  try {
    const data = await wpFetch<PostBySlugResponse>(GET_POST_BY_SLUG, { slug });
    return data.postBy;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt?.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

async function commentsEnabled(): Promise<boolean> {
  try {
    const data = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    return data.headlessConfig?.enableComments !== false;
  } catch {
    return true;
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, showComments] = await Promise.all([getPost(slug), commentsEnabled()]);

  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <time>{new Date(post.date).toLocaleDateString()}</time>
          {post.author && (
            <span>
              by{" "}
              {post.author.node.slug ? (
                <Link
                  href={`/author/${post.author.node.slug}`}
                  className="hover:text-blue-600"
                >
                  {post.author.node.name}
                </Link>
              ) : (
                post.author.node.name
              )}
            </span>
          )}
        </div>
        {post.categories && post.categories.nodes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.categories.nodes.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
        {post.tags && post.tags.nodes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags.nodes.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {showComments && post.commentStatus && (
        <CommentSection
          postDatabaseId={post.databaseId}
          commentStatus={post.commentStatus}
          initialComments={post.comments?.nodes ?? []}
          initialCount={post.commentCount ?? 0}
        />
      )}

      <footer className="mt-12 pt-6 border-t border-gray-200">
        <Link
          href="/blog"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to blog
        </Link>
      </footer>
    </article>
  );
}
